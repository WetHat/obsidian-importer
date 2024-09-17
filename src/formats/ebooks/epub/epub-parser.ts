import { ZipReader } from "@zip.js/zip.js";
import { parseFilePath, PickedFile } from "filesystem";
import { ImportContext } from "main";
import { TFile, TFolder, Vault } from "obsidian";
import { readZip, ZipEntryFile } from "zip";

type TStringPropertyBag = { [key: string]: string | string[]; };

/**
 * Base class for assets in an e-pub ZIP archive that can be imported.
 */
abstract class ImportableAsset {
    /**
     * The original book relative hyperlink of an asset
     */
    sourceHref: string;

    /**
     * THe mimetype of the asset.
     */
    mimetype: string;

    protected constructor(href: string, mimetype: string) {
        this.mimetype = mimetype;
        this.sourceHref = href;
    }

    /**
     * Get path of the asset relative to the book.
     */
    abstract get outputHref() : string;

    abstract import(bookOutpuFolder: TFolder): Promise<TFile>;

    /**
     * Get the fully qualified path to the output location of this asset.
     *
     * Missing folders in the output path are created if they do not exist-
     *
     * @param bookOutputFolder The out put folder
     * @returns full vault path.
     */
    async getVaultOutputPath(bookOutputFolder: TFolder): Promise<string> {
        const
            vault = bookOutputFolder.vault,
            folders = this.outputHref.split("/"),
            folderCount = folders.length - 1; // omit the file
        let folderPath = bookOutputFolder.path;
        for (let i = 0; i < folderCount; i++) {
            folderPath += "/" + folders[i];
            if (!vault.getFolderByPath(folderPath)) {
                await vault.createFolder(folderPath);
            }
        }
        return bookOutputFolder.path + "/" + this.outputHref;
    }

    /**
     * Change the extension of a file.
     *
     * @param filePath path to a file
     * @param newExtension New extension (without the dot)
     * @returns path to file with the new file extension-
     */
    protected static changeFileExtension(filePath: string, newExtension: string) {
        const dotindex = filePath.lastIndexOf(".");
        return dotindex > 0 ? filePath.slice(0, dotindex + 1) + newExtension : filePath;
    }
}

class PageAsset extends ImportableAsset {
    private page: Document;
    private constructor(doc: Document, href: string) {
        super(href, "application/xhtml+xml");
        this.page = doc;
    }

    static async parse(parser: DOMParser, source: ZipEntryFile, href: string): Promise<PageAsset | null> {
        if (source) {
            const doc = await parser.parseFromString(await source.readText(), "application/xhtml+xml");
            return new PageAsset(doc, href);
        }
        return null;
    }

    get outputHref(): string {
        return ImportableAsset.changeFileExtension(this.sourceHref, "md");
    }

    import(bookOutpuFolder: TFolder): Promise<TFile> {
        throw new Error("Method not implemented.");
    }
}


/**
 * Media asset used on pages of the e-book.
 */
class MediaAsset extends ImportableAsset {
    private source: ZipEntryFile;

    constructor(source: ZipEntryFile, href: string, mimetype: string) {
        super(href, mimetype);
        this.source = source;
    }

    get outputHref(): string {
        return this.sourceHref;
    }

    async import(bookOutputFolder: TFolder): Promise<TFile> {
        const outputPath = await this.getVaultOutputPath(bookOutputFolder);
        return bookOutputFolder.vault.createBinary(outputPath, await this.source.read());
    }
}

class TocAsset {
    constructor(toc: Document) {

    }
}

export class EpubDocument {
    private vault: Vault;
    private toc: TocAsset;
    private sourcePrefix: string; // the ZIP parent directory path to the e-book
    private mimeMap = new Map<string, string>(); // href => mimetype
    private assetMap = new Map<string, ImportableAsset>() // href => book asset
    private parser = new DOMParser();
    private bookMeta: TStringPropertyBag = {};

    get bookTitle() : string {
        return this.bookMeta.title as string ?? "Book";
    }
    constructor(vault: Vault) {
        this.vault = vault;
    }

    private getSourceHref(source: ZipEntryFile): string {
        return source.filepath.slice(this.sourcePrefix.length);
    }

    private async parseManifest(source: ZipEntryFile): Promise<void> {
        const manifest = await this.parser.parseFromString(await source.readText(), "application/xml");

        this.sourcePrefix = parseFilePath(source.filepath).parent + "/";

        const
            root = manifest.documentElement,
            items = root.getElementsByTagName("item"),
            itemCount = items.length;

        // Build the mimetype map
        for (let i = 0; i < itemCount; i++) {
            const
                item = items[i],
                mimetype = item.getAttribute("media-type"),
                href = item.getAttribute("href");
            if (mimetype && href) {
                this.mimeMap.set(href, mimetype);
            }
        }

        // extract the book meta information;
        const metadata = root.querySelector("metadata");
        if (metadata) {
            const
                c = metadata.children,
                cCount = c.length;
            for (let i = 0; i < cCount; i++) {
                const
                    node = c[i],
                    nodeName = node.nodeName,
                    value = node.textContent;
                if (value) {
                    const
                        colonIndex = nodeName.indexOf(":"),
                        propertyName = colonIndex >=0 ? nodeName.slice(colonIndex+1) : nodeName,
                        meta = this.bookMeta[propertyName];

                    if (meta) {
                        if (Array.isArray(meta)) {
                            meta.push(value);
                        } else {
                            this.bookMeta[propertyName] = [meta, value];
                        }
                    } else {
                        this.bookMeta[propertyName] = value;
                    }
                }
            }
        }
    }

    async addAssets(entries: ZipEntryFile[]): Promise<void> {
        const manifestSource = entries.find((asset, _0, _1) => asset.extension === "opf");
        if (!manifestSource) {
            return;
        }
        await this.parseManifest(manifestSource);

        // now check all files from the ZIP files against the manifest and create
        // the appropriate asset facade instances
        for (const source of entries) {
            // get the type from the manifest
            if (source.filepath.startsWith(this.sourcePrefix)) {
                const
                    href = this.getSourceHref(source),
                    mimetype = this.mimeMap.get(href) ?? "?";
                switch (mimetype) {
                    case "application/xhtml+xml":
                        // a book chapter
                        break;
                    case "application/x-dtbncx+xml":
                        // the table of contents
                        break;
                    case "text/css":
                    case "?":
                        // we are going to ignore stylesheets and files not in the manifest
                        break;
                    default:
                        if (source.extension) {
                            // media can me imported without processing
                            this.assetMap.set(href,new MediaAsset(source,href,mimetype));
                        }
                        break;
                }
            }
        }
    }

    async import(outputFolder: TFolder): Promise<void> {
        const
            bookFolderPath = outputFolder.path + "/" + this.bookMeta.title as string,
            bookFolder = await this.vault.createFolder(bookFolderPath);
        console.log(`Saving Ebook to ${bookFolder.path}`);
        // import all recognized assets of the book (as determined by the book manifest)
        for (const asset of this.assetMap.values()) {
            await asset.import(bookFolder);
        }
    }
}

export class EpubParser {
    private vault: Vault;
    private ctx: ImportContext;

    constructor(vault: Vault, ctx: ImportContext) {
        this.vault = vault;
        this.ctx = ctx;
    }

    async import(file: PickedFile, outputFolder: TFolder): Promise<EpubDocument> {
        const doc = new EpubDocument(this.vault);

        await readZip(file, async (zip: ZipReader<any>, entries: ZipEntryFile[]): Promise<void> => {
            await doc.addAssets(entries);
            await doc.import(outputFolder);
        });
        return doc;
    }
}