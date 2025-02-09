import { ZipReader } from '@zip.js/zip.js';
import { parseFilePath, PickedFile } from 'filesystem';
import { ImportContext } from 'main';
import { Vault, TFolder, htmlToMarkdown } from 'obsidian';
import { readZip, ZipEntryFile } from 'zip';
import { ImportableAsset, MediaAsset, PageAsset, TocAsset } from './epub-assets';
import { toFrontmatterTagname, titleToBasename } from '../ebook-transformers';

/**
 *  An adapter class to make the meta information of an epub book, as specified in the
 * `opf` manifest, available to the import process.
 *
 * THe relevant section in that file has this form:
 *
 * ~~~xml
 * <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
 *     <dc:title>C# 8.0 in a Nutshell: The Definitive Reference</dc:title>
 *     ...
 * </metadata>
 * ~~~
 *
 * ❗The namespace of the property names is removed. E.g `dc:title` becomes the `title` property.
 */
class BookMetadata {
	private meta = new Map<string, string[]>();

	/**
	 * Build a new adapter instance by parsing the `<metadata>` section of the book's
	 * manifest file.
	 *
	 * @param pkg The `<package>` element (root of the manifest file).
	 */
	constructor(pkg: Element) {
		const metadata = pkg.querySelector('package > metadata');
		if (metadata) {
			const
				c = metadata.children,
				cCount = c.length;
			for (let i = 0; i < cCount; i++) {
				// extract the metadata
				const
					node = c[i],
					nodeName = node.nodeName;
				let
					key: string | null,
					value: string | null;

				if (nodeName === 'meta') {
					key = node.getAttribute('name');
					value = node.getAttribute('content');
				}
				else {
					key = nodeName;
					value = node.textContent;
					if (key) {
						const colonIndex = key.indexOf(':');
						key = colonIndex >= 0 ? key.slice(colonIndex + 1) : key;
					}
				}

				if (key && value) {
					this.addProperty(key, value); // capture the metadata
				}
			}
		}
		// get the cover page if available
		const cover = pkg.querySelector('package > guide > reference[type="cover"]');
		if (cover) {
			const href = cover.getAttribute('href');
			if (href) {
				this.setProperty('cover', href);
			}
		}

		// get the toc
		const toc = pkg.querySelector('package > guide > reference[type="toc"]');
		if (toc) {
			const href = toc.getAttribute('href');
			if (href) {
				this.setProperty('toc', href);
			}
		}
	}

	addProperty(name: string, value: string) {
		const entry = this.meta.get(name);
		if (entry) {
			entry.push(value);
		}
		else {
			this.meta.set(name, [value]);
		}
	}

	setProperty(name: string, value: string) {
		return this.meta.set(name, [value]);
	}

	/**
	 * Get a property value as a string.
	 * @param name Property name (without namespace).
	 * @returns property value (as a comma separated list if there is more than one value
	 *          for that property).
	 */
	asString(name: string): string | undefined {
		return this.meta.get(name)?.join(',');
	}

	/**
	 * Get the property value(s) as array.
	 * @param name Property name (without namespace).
	 * @returns Array of property values
	 */
	asArray(name: string): string[] | undefined {
		return this.meta.get(name);
	}
}

/**
 * A builder class to facilitate the import of epub books to an Obsidian folder.
 *
 * The responsibilities of this class are:
 * 1. Epub contents analysis : Inspect the contents of an epub ZIP file in {@link EpubBook.addAssets}
 *    and obtain the book's manifest {@link EpubBook.parseManifest} and meta data {@link BookMetadata}.
 * 2. Factory setup: create specific factory objects, subclassed from {@link ImportableAsset},
 *     for the book's assets listed in its manifest.
 * 3. Perform the import: Create the book's cover page and call {@link ImportableAsset.import} to
 *    for all book assetes to create the Obsidian representation of the book in the import folder.
 * 4. Progress reporting.
 */
export class EpubBook {
	private vault: Vault;
	private sourcePrefix: string; // the ZIP directory path to the e-book
	private mimeMap = new Map<string, string>(); // asset source path => mimetype
	private assetMap = new Map<string, ImportableAsset>(); // asset source path => book asset
	private meta: BookMetadata; // The books metadata
	private filenameRegistry = new Set<string>;

	readonly parser = new DOMParser(); // the parser instance to use

	toc?: TocAsset | PageAsset;

	private _tags: string[] = [];
	private _titlePageFilename?: string;

	// some progress data
	private ctx: ImportContext;
	private fileCount = 0;
	private processed = 0;

	get abstract(): string[] {
		const description = htmlToMarkdown(this.description ?? '-')
			.split('\n')
			.map(l => '> ' + l);
		return [
			`> [!abstract] ${this.title}`,
			`> <span style="float:Right;">![[${this.coverImage}|300]]</span>`,
			...description,
		];
	}

	/**
	 * @type {string[]}
	 */
	get tags(): string[] {
		return this._tags;
	}

	get published(): string | undefined {
		return this.meta.asString('date');
	}
	get language(): string {
		return this.meta.asString('language') ?? 'Unspecified';
	}

	get coverImage(): string | undefined {
		return this.meta.asString('cover-image');
	}

	get title(): string {
		return this.meta.asString('title') ?? 'Untitled Book';
	}

	private get titlePageFilename(): string {
		if (!this._titlePageFilename) {
			this._titlePageFilename = titleToBasename("§ About: " + this.title) + ".md"
		}
		return this._titlePageFilename;
	}

	get author(): string {
		return this.meta.asString('creator') ?? 'Unknown author';
	}

	get publisher(): string {
		return this.meta.asString('publisher') ?? 'Unknown publisher';
	}

	get description(): string | undefined {
		return this.meta.asString('description') ?? undefined;
	}

	constructor(vault: Vault, ctx: ImportContext) {
		this.vault = vault;
		this.ctx = ctx;
	}

	relativePathToTitlePage(asset: ImportableAsset): string {
		const relpath = "../".repeat(asset.assetFolderPath.length);
		return relpath ? (relpath + "/" + this.titlePageFilename) : this.titlePageFilename;
	}

	private getSourcePath(source: ZipEntryFile): string {
		return source.filepath.slice(this.sourcePrefix.length);
	}

	private async parseManifest(source: ZipEntryFile): Promise<void> {
		const
			manifest = this.parser.parseFromString(await source.readText(), 'application/xml'),
			parent = parseFilePath(source.filepath).parent;

		this.sourcePrefix = parent ? parent + '/' : parent;

		const root = manifest.documentElement;
		// extract the book meta information;
		this.meta = new BookMetadata(root);
		this._tags = this.meta.asArray('subject') ?? ['e-book'];
		this._tags = this._tags.map(t => toFrontmatterTagname(t)).join(',').split(',');
		this._tags = Array.from(new Set<string>(this._tags)).sort();
		// Build the mimetype map
		const
			items = root.getElementsByTagName('item'),
			itemCount = items.length;
		for (let i = 0; i < itemCount; i++) {
			const
				item = items[i],
				mimetype = item.getAttribute('media-type'),
				href = decodeURIComponent(item.getAttribute('href') as string),
				properties = item.getAttribute('properties');

			if (mimetype && href) {
				this.mimeMap.set(href, mimetype);
				// remember special assets
				switch (properties) {
					case 'cover-image':
						this.meta.setProperty(properties, href);
						break;
					case 'nav':
						// a navigation page, probably in lieu of an ncx file
						this.meta.setProperty('toc', href);
						break;
				}
			}
		}
	}


	/**
	 * Register a filename for an asset.
	 *
	 * Registration is needed to make filenames unique.
	 *
	 * @param filename The filename to register
	 * @returns `true` if the filename is unique and was registered successfully; `false` if the filename is already in use.
	 */
	registerFilename(filename: string): boolean {
		if (this.filenameRegistry.has(filename)) {
			return false;
		}
		this.filenameRegistry.add(filename);
		return true;
	}

	/**
	 * Get an conversion adapter instance of an asset that was
	 * mentioned in the book's manifest (`content.opf`),
	 *
	 * @param path source path to the asset relative to the book.
	 * @returns the adapter object associated with the asset or
	 *          `undefined` if no such asset was listed in the manifest.
	 */
	getAsset(path: string): ImportableAsset | undefined {
		return this.assetMap.get(path);
	}

	/**
	 * Add all book assets from the ZIP archive.
	 *
	 * The assets added are dermined by the book manifest read
	 * from `content.opf.)
	 * @param entries ZIP file entries
	 */
	async addAssets(entries: ZipEntryFile[]): Promise<void> {
		this.fileCount = entries.length + 1; // one more for the book's _about_ page.

		// find the books manifest first so that we know what the relevant files are.
		const manifestSource = entries.find((asset, _0, _1) => asset.extension === 'opf');
		if (!manifestSource) {
			return;
		}
		this.ctx.status('Parsing epub file contents');
		await this.parseManifest(manifestSource);
		const tocPath = this.meta.asString('toc');
		// now check all files from the ZIP against the manifest and create
		// the appropriate asset adapter instances.
		for (const source of entries) {
			// get the type from the manifest
			if (source.filepath.startsWith(this.sourcePrefix)) {
				const
					epubPath = this.getSourcePath(source),
					mimetype = this.mimeMap.get(epubPath) ?? '?';
				switch (mimetype) {
					case 'text/html':
					case 'application/xhtml+xml':
						// a book page
						const page = new PageAsset(source, epubPath, mimetype);
						// we need to parse right away so that all pages are
						// available when the TOC is parsed. Also this might
						// be the toc (epub 3).
						const isToc = tocPath === epubPath;
						await page.parse(this, isToc);
						if (isToc && !this.toc) {
							this.toc = page;
						}
						this.assetMap.set(epubPath, page);
						break;
					case 'application/x-dtbncx+xml':
						// the content map of the book
						this.toc = new TocAsset(source, epubPath, mimetype);
						// defer parsing until all pages are available
						this.assetMap.set(epubPath, this.toc);
						break;
					case 'text/css':
						// we are going to ignore stylesheets and files not in the manifest
						this.ctx.reportProgress(++this.processed, this.fileCount);
						break;
					case '?':
						if ('opf' !== source.extension) {
							this.ctx.reportSkipped(`'${source.name}' is not part of the book`);
						}
						this.ctx.reportProgress(++this.processed, this.fileCount);
						break;
					default:
						if (source.extension) {
							// media can me imported without pre-processing
							this.assetMap.set(epubPath, new MediaAsset(source, epubPath, mimetype));
						}
						else {
							this.ctx.reportSkipped(`'${source.name}' has unsupported mimetype: ${mimetype}`);
							this.ctx.reportProgress(++this.processed, this.fileCount);
						}
						break;
				}
			}
			else {
				this.ctx.reportSkipped(`'${source.name}' is not part of the book`);
				this.ctx.reportProgress(++this.processed, this.fileCount);
			}
		}
		// now, that we have all relevant assets, we can provide missing metadata
		let coverImage = this.meta.asString('cover-image');
		if (!coverImage) {
			// attempt extractopn of the cover image from the cover page
			const
				cover = this.meta.asString('cover'),
				asset = cover ? this.getAsset(cover) : undefined;
			// find the image in the content
			if (asset instanceof PageAsset && asset.page) {
				const imgs = asset.page.body.getElementsByTagName('img');
				if (imgs.length > 0) {
					const src = imgs[0].getAttribute('src');
					if (src) {
						coverImage = decodeURIComponent(asset.pathFromBook(src)); // make relative to top
					}
				}
				else {
					const images = asset.page.body.getElementsByTagName('image');
					if (images.length > 0) {
						const href = images[0].getAttribute('xlink:href') || images[0].getAttribute('href');
						if (href) {
							coverImage = decodeURIComponent(asset.pathFromBook(href));
						}
					}
				}
			}
		}
		if (coverImage) {
			this.meta.setProperty('cover-image', coverImage);
		}

		// ... and complete initialization to the content map
		if (this.toc instanceof TocAsset) {
			await this.toc.parse(this);
		}


	}

	async import(outputFolder: TFolder): Promise<void> {
		// creating the book's import folder
		const bookFolderPath = outputFolder.path + '/' + titleToBasename(this.title);
		if (await this.vault.adapter.exists(bookFolderPath)) {
			this.ctx.reportFailed(`import of '${this.title}' failed`, 'The output folder already exists');
			return;
		}
		const bookFolder = await this.vault.createFolder(bookFolderPath);
		this.ctx.status(`Saving Ebook to ${bookFolder.path}`);

		// reconnect the link targets in all pages
		for (const asset of this.assetMap.values()) {
			if (this.ctx.cancelled) {
				return;
			}
			if (asset instanceof PageAsset) {
				asset.reconnectLinks(this);
			}
		}
		// create the books about page
		const titlePageContent = [
			'---',
			`book: "${this.title}"`,
			`author: "${this.author}"`,
			'aliases: ',
			`  - "${this.title}"`,
			`publisher: "${this.publisher}"`,
			`tags: [${this.tags.join(',')}]`,
			'---',
			"",
			...this.abstract,
			"",
			`![[${this.toc?.outputPath}]]`,
		];
		await this.vault.create(bookFolderPath + "/" + this.titlePageFilename, titlePageContent.join("\n"));
		this.ctx.reportNoteSuccess(this.titlePageFilename);
		this.ctx.reportProgress(++this.processed, this.fileCount);

		// import all recognized assets of the book (as determined by the book manifest)
		for (const asset of this.assetMap.values()) {
			if (this.ctx.cancelled) {
				return;
			}
			try {
				await asset.import(bookFolder);
				if (asset instanceof MediaAsset) {
					this.ctx.reportAttachmentSuccess(asset.outputFilename);
				}
				else {
					this.ctx.reportNoteSuccess(asset.outputFilename);
				}
			}
			catch (ex: any) {
				this.ctx.reportFailed(asset.outputFilename, ex.message);
			}

			this.ctx.reportProgress(++this.processed, this.fileCount);
		}
	}
}

/**
 * Import an e-pub format e-book.
 *
 * The import process has 3 major phases:
 * 1. reading the e-pub ZIP contents
 * 2. passing the ZIP contents to the {@link EpubBook} builder object for
 *    analysis {@link EpubBook.addAssets}.
 * 3. Saving the book's assets to the given output folder {@link EpubBook.import}
 *
 * @param vault The Obsidian vault to import to.
 * @param epub THe ePub file selected for import.
 * @param outputFolder Obsidian folder to import the book to.
 * @param ctx Import progress reporting object.
 * @returns THe e-pub book factory object which performed the import.
 */
export async function importEpubBook(vault: Vault, epub: PickedFile, outputFolder: TFolder, ctx: ImportContext): Promise<EpubBook> {
	const doc = new EpubBook(vault, ctx);

	await readZip(epub, async (zip: ZipReader<any>, entries: ZipEntryFile[]): Promise<void> => {
		await doc.addAssets(entries);
		await doc.import(outputFolder);
		ctx.status(`import of ${epub.name} complete`);
	});
	return doc;
}