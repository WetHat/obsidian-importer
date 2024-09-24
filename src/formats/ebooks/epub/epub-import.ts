import { ZipReader } from "@zip.js/zip.js";
import { parseFilePath, PickedFile } from "filesystem";
import { ImportContext } from "main";
import { Vault, TFolder } from "obsidian";
import { readZip, ZipEntryFile } from "zip";
import { ImportableAsset, MediaAsset, PageAsset, TocAsset } from "./epub-assets";
import { frontmatterTagname, titleToBasename } from "../ebook-transformers";

/**
 * A utility class to parse meta information of the book as specified in the
 * `opf` file
 *
 * THe relevant section in that file has this form
 *
 * ~~~xml
 * <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
 *     <dc:title>C# 8.0 in a Nutshell: The Definitive Reference</dc:title>
 *     ...
 * </metadata>
 * ~~~
 *
 * ❗The namespace of the property names is removed.
 */
class BookMetadata {
    private meta = new Map<string, string[]>();

    /**
     * Build a new instance by parsing the `<metadata>` section of the book's
     * content file.
     *
     * @param pkg The `<package>` element (root of the content file).
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

                if (nodeName === "meta") {
                    key = node.getAttribute("name");
                    value = node.getAttribute("content");
                } else {
                    key = nodeName;
                    value = node.textContent;
                    if (key) {
                        const colonIndex = key.indexOf(':');
                        key = colonIndex >= 0 ? key.slice(colonIndex + 1) : key;
                    }
                }

                if (key && value) {
                    this.setProperty(key, value); // capture the metadata
                }
            }
        }
        // make sure we have the cover page
        if (!this.meta.has("coverPage")) {
            // get the cover image gtom the cover page then
            const coverPage = pkg.querySelector('package > guide > reference[type="cover"]');
            if (coverPage) {
                const href = coverPage.getAttribute("href");
                this.meta.set("coverPage", href ? [href] : []);
            }
        }
    }

    private setProperty(name: string, value: string) {
        const entry = this.meta.get(name);
        if (entry) {
            entry.push(value);
        } else {
            this.meta.set(name, [value]);
        }
    }

    /**
     * Get a property value as a string.
     * @param name Property name (without namespace).
     * @returns property value (as a comma separated list if there is more than one value
     *          for that property).
     */
    asString(name: string): string | undefined {
        return this.meta.get(name)?.join(",");
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
 * Representation of an e-pub book prepared for imported to Obsidian.
 *
 * This class also defines and executes the necessary import workflow.
 */
export class EpubBook {
    private vault: Vault;
    private sourcePrefix: string; // the ZIP parent directory path to the e-book
    private mimeMap = new Map<string, string>(); // asset source path => mimetype
    private assetMap = new Map<string, ImportableAsset>(); // asset source path => book asset
    readonly parser = new DOMParser(); // the parser instance to use
    private meta: BookMetadata; // The books metadata

    toc: TocAsset;

    coverImage?: string;
    tags: string[] = [];

    // some progress data
    ctx: ImportContext;
    fileCount = 0;
    processed = 0;

    get title(): string {
        return this.meta.asString("title") ?? 'Untitled book';
    }

    get author(): string {
        return this.meta.asString("creator") ?? "Unkown author";
    }

    get publisher(): string {
        return this.meta.asString("publisher") ?? "Unknown publisher";
    }

    get description(): string | undefined {
        return this.meta.asString("description") ?? undefined;
    }

    constructor(vault: Vault, ctx: ImportContext) {
        this.vault = vault;
        this.ctx = ctx;
    }

    private getSourcePath(source: ZipEntryFile): string {
        return source.filepath.slice(this.sourcePrefix.length);
    }

    private async parseManifest(source: ZipEntryFile): Promise<void> {
        const
            manifest = this.parser.parseFromString(await source.readText(), 'application/xml'),
            parent = parseFilePath(source.filepath).parent;

        this.sourcePrefix = parent ? parent + '/' : parent;

        const
            root = manifest.documentElement,
            items = root.getElementsByTagName('item'),
            itemCount = items.length;

        // Build the mimetype map
        for (let i = 0; i < itemCount; i++) {
            const
                item = items[i],
                mimetype = item.getAttribute('media-type'),
                href = item.getAttribute('href');
            if (mimetype && href) {
                this.mimeMap.set(href, mimetype);
            }
        }

        // extract the book meta information;
        this.meta = new BookMetadata(root);
        this.tags = this.meta.asArray("subject") ?? ["e-book"];
        this.tags = this.tags.map(t => frontmatterTagname(t));
    }

    /**
     * Get a facade instance of an asset that was
     * mentioned in the book's manifest (`content.opf`),
     *
     * @param path path to the asset relative to the book.
     * @returns the facade object associated with the asset or
     *          `undefined` if no such asset was listed in the manifest.
     */
    getAsset(path: string): ImportableAsset | undefined {
        return this.assetMap.get(path)
    }

    /**
     * Add all book assets from the ZIP archive.
     *
     * The assets added are dermined by the book manifest read
     * from `content.opf.)
     * @param entries ZIP file entries
     */
    async addAssets(entries: ZipEntryFile[]): Promise<void> {
        this.fileCount = entries.length;

        // find the books manifest first so that we know what the relevant files are.
        const manifestSource = entries.find((asset, _0, _1) => asset.extension === 'opf');
        if (!manifestSource) {
            return;
        }
        this.ctx.status("Parsing epub file contents");
        await this.parseManifest(manifestSource);
        // now check all files from the ZIP against the manifest and create
        // the appropriate asset facade instances.
        for (const source of entries) {
            // get the type from the manifest
            if (source.filepath.startsWith(this.sourcePrefix)) {
                const
                    href = this.getSourcePath(source),
                    mimetype = this.mimeMap.get(href) ?? '?';
                switch (mimetype) {
                    case 'application/xhtml+xml':
                        // a book page
                        const page = new PageAsset(source, href, mimetype);
                        // we need to parse right away so that all pages are
                        // available when the TOC is parsed.
                        await page.parse(this);
                        this.assetMap.set(href, page);
                        break;
                    case 'application/x-dtbncx+xml':
                        // the content map of the book
                        this.toc = new TocAsset(source, href, mimetype);
                        // defer parsing until all pages are available
                        this.assetMap.set(href, this.toc);
                        break;
                    case 'text/css':
                        // we are going to ignore stylesheets and files not in the manifest
                        this.ctx.reportProgress(++this.processed, this.fileCount);
                        break;
                    case '?':
                        if ("opf" !== source.extension) {
                            this.ctx.reportSkipped(`'${source.name}' is not part of the book`);
                        }
                        this.ctx.reportProgress(++this.processed, this.fileCount);
                        break;
                    default:
                        if (source.extension) {
                            // media can me imported without pre-processing
                            this.assetMap.set(href, new MediaAsset(source, href, mimetype));
                        } else {
                            this.ctx.reportSkipped(`'${source.name}' has unsupported mimetype: ${mimetype}`);
                            this.ctx.reportProgress(++this.processed, this.fileCount);
                        }
                        break;
                }
            } else {
                this.ctx.reportSkipped(`'${source.name}' is not part of the book`);
                this.ctx.reportProgress(++this.processed, this.fileCount);
            }
        }
        // now, that we have all relevant assets, we can augment the metadata
        this.coverImage = this.meta.asString("cover");
        if (!this.coverImage) {
            // get it from the cover page then
            const coverPage = this.meta.asString("coverPage");
            if (coverPage) {
                const asset = this.getAsset(coverPage);
                // find the image in the content
                if (asset instanceof PageAsset && asset.page) {
                    const images = asset.page.body.getElementsByTagName("img");
                    if (images.length > 0) {
                        const src = images[0].getAttribute("src");
                        if (src) {
                            this.coverImage = src.replace(/\.\.\//g, ""); // make relative to top
                        }
                    }
                }
            }
        }

        // ... and complete initialization to the content map
        await this.toc.parse(this);
    }

    async import(outputFolder: TFolder): Promise<void> {
        const bookFolderPath = outputFolder.path + '/' + titleToBasename(this.title);
        if (await this.vault.adapter.exists(bookFolderPath)) {
            this.ctx.reportFailed(`import of '${this.title}' failed`, "The output folder already exists");
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

        // import all recognized assets of the book (as determined by the book manifest)
        for (const asset of this.assetMap.values()) {
            if (this.ctx.cancelled) {
                return;
            }
            await asset.import(bookFolder);
            if (asset instanceof MediaAsset) {
                this.ctx.reportAttachmentSuccess(asset.sourceAssetPath);
            } else {
                this.ctx.reportNoteSuccess(asset.sourceAssetPath);
            }
            this.ctx.reportProgress(++this.processed, this.fileCount);
        }
    }
}

/**
 * The ePub book importer.
 * @param vault
 * @param epub
 * @param outputFolder
 * @param ctx
 * @returns
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