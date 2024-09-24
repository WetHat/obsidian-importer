import { ZipReader } from "@zip.js/zip.js";
import { parseFilePath, PickedFile } from "filesystem";
import { ImportContext } from "main";
import { Vault, TFolder } from "obsidian";
import { readZip, ZipEntryFile } from "zip";
import { ImportableAsset, BookMetadata, MediaAsset, PageAsset, TocAsset } from "./epub-assets";
import { titleToBasename } from "../ebook-transformers";

/**
 * Representation of an e-pub book prepared for imported to Obsidian.
 *
 * This class also defines and executes the necessary import workflow.
 */
export class EpubBook {
    private vault: Vault;
    private toc: TocAsset;
    private sourcePrefix: string; // the ZIP parent directory path to the e-book
    private mimeMap = new Map<string, string>(); // asset source path => mimetype
    private assetMap = new Map<string, ImportableAsset>(); // asset source path => book asset
    readonly parser = new DOMParser(); // the parser instance to use
    bookMeta: BookMetadata; // The books metadata

    // some progress data
    ctx: ImportContext;
    fileCount = 0;
    processed = 0;

    get bookTitle(): string {
        return this.bookMeta.asString("title") ?? 'Untitled Book';
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
        this.bookMeta = new BookMetadata(root);
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
                    case '?':
                        // we are going to ignore stylesheets and files not in the manifest
                        this.ctx.reportProgress(++this.processed, this.fileCount);
                        break;
                    default:
                        if (source.extension) {
                            // media can me imported without pre-processing
                            this.assetMap.set(href, new MediaAsset(source, href, mimetype));
                        } else {
                            this.ctx.reportSkipped(`"${source.name}" has unsupported mimetype: ${mimetype}`);
                            this.ctx.reportProgress(++this.processed, this.fileCount);
                        }
                        break;
                }
            } else {
                this.ctx.reportSkipped(`"${source.name}" is not part of the book`);
                this.ctx.reportProgress(++this.processed, this.fileCount);
            }
        }
    }

    async import(outputFolder: TFolder): Promise<void> {
        const
            bookFolderPath = outputFolder.path + '/' + titleToBasename(this.bookTitle),
            bookFolder = await this.vault.createFolder(bookFolderPath);
        this.ctx.status(`Saving Ebook to ${bookFolder.path}`);

        // prepare the assets for import
        await this.toc.parse(this);

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