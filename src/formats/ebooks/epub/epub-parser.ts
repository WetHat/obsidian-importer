import { ZipReader } from '@zip.js/zip.js';
import { parseFilePath, PickedFile } from 'filesystem';
import { ImportContext } from 'main';
import { htmlToMarkdown, TFile, TFolder, Vault } from 'obsidian';
import { readZip, ZipEntryFile } from 'zip';

type TStringPropertyBag = { [key: string]: string | string[] | undefined };

const FILENAME_CHAR_MAP = [
    ["?", "❓"],
    [".", "․"],
    [":", "꞉"],
    ['"', "″"],
    ['<', "＜"],
    ['>', "＞"],
    ['|', "∣"],
    ["\\", "/"],
    ["/", "╱"],
    ["[", "{"],
    ["]", "}"],
    ["#", "＃"],
    ["^", "△"],
    ["&", "+"],
    ["*", "✱"],
];

/**
 * Utility to convert a string into a valid filename.
 * @param name - A string, such as a title, to create a filename for.
 * @returns valid filename without file extension.
 */
function sanitizeFilename(filename: string): string {

    let sanitized = filename;

    for (let [from, to] of FILENAME_CHAR_MAP) {
        const re = new RegExp("\\"+ from,"g");
        sanitized = sanitized.replace(re,to);
    }

    return sanitized.trim();
}

function sanitizeTagname(tagname: string) {
    return tagname
        .replace(/\#/g, "＃")
        .replace(/\./g, "〭")
        .replace(/[&/\[\(\{]/g, ",")
        .replace(/:/g, "꞉")
        .replace(/[;/\)\]\}]/, "")
        .trim()
        .replace(/\s+|[\\;]/, "-")
       ;
}

/**
 * Base class for assets in an e-pub ZIP archive that can be imported to Obsidian.
 */
abstract class ImportableAsset {
    /**
     * asset source in the ZIP archive.
     * Needed for delazd loading of the asset contents
     */
    protected source: ZipEntryFile;

    /**
     * The relative folder path to the assert relative to the book.
     * Will also used as the relative folder path in the output folder
     */
    assetFolderPath: string[];

    /**
     * The mimetype of the asset.
     */
    mimetype: string;

    /**
     * Create anew instance of an importable asset
     * @param source The ZIP file source of the asset.
     * @param href The book relative hyperlink of the asset
     * @param mimetype Asset mimetype
     */
    protected constructor(source: ZipEntryFile, href: string, mimetype: string) {
        this.mimetype = mimetype;
        this.source = source;
        const parts = href.split('/');
        this.assetFolderPath = parts.slice(0, parts.length - 1); // strip the filename
    }

    /**
     * A utility function to build a relative link to an asset.
     *
     * @param basename the asset file's basename
     * @param extension THe asset file's extension
     * @returns a link realtive to the book in the output folder.
     */
    protected makeHref(basename: string, extension: string): string {
        return [...this.assetFolderPath, basename + '.' + extension].join('/');
    }

    /**
     * This property is computed by derived classes.
     *
     * @see makeHref
     *
     * @return Link of the asset relative to the book in the output folder.
     */
    abstract get outputHref(): string;

    get sourceHref() : string {
        return this.makeHref(this.source.basename,this.source.extension);
    }
    /**
     *
     * @param bookOutpuFolder Import the asset to the book's output folder.
     * @returns The imported file.
     */
    abstract import(bookOutpuFolder: TFolder): Promise<TFile>;

    /**
     * Get the fully qualified path to the output location of this asset.
     *
     * Missing folders in the output path are created if they do not exist-
     *
     * @param bookOutputFolder The out put folder
     * @returns full vault path.
     */
    protected async getVaultOutputPath(bookOutputFolder: TFolder): Promise<string> {
        const
            vault = bookOutputFolder.vault,
            fs = vault.adapter,
            folderCount = this.assetFolderPath.length;
        let folderPath = bookOutputFolder.path;
        for (let i = 0; i < folderCount; i++) {
            folderPath += '/' + this.assetFolderPath[i];
            if (!await fs.exists(folderPath)) {
                await vault.createFolder(folderPath);
            }
        }
        return bookOutputFolder.path + '/' + this.outputHref;
    }
}

class PageAsset extends ImportableAsset {
    page?: Document;
    pageTitle?: string;
    linkTargetIDs = new Map<string, string>();

    constructor(source: ZipEntryFile, href: string, mimetype: string) {
        super(source, href, mimetype);
    }

    registerLinkTarget(targetID: string): string {
        const sanitized = targetID.replace(/[_]+/g, "-");
        this.linkTargetIDs.set(targetID, sanitized);
        return sanitized;
    }

    get outputHref(): string {
        const basename = sanitizeFilename(this.pageTitle ?? this.source.basename);
        return this.makeHref(basename, "md");
    }

    async parse(parser: DOMParser, assetMap: Map<string, ImportableAsset>): Promise<void> {
        const html = (await this.source.readText())
            .replace(/&lt;/g, "＜")
            .replace(/&gt;/g, "＞"); // replace Obsidian unfriendly html entities.
        // we need to use the `text/html`so that Obsidian produces usable Markdown
        this.page = parser.parseFromString(html, "text/html");
        // Make the html Obsidian friendly
        // Look for <pre> tags and make sure their first child is always a <code> tag.
        const pres = this.page.body.getElementsByTagName("pre");
        for (let i = 0; i < pres.length; i++) {
            const pre = pres[i];
            let firstChild = pre.firstChild;

            // remove emptylines
            while (firstChild?.nodeType === Node.TEXT_NODE && firstChild.textContent?.trim().length === 0) {
                firstChild.remove();
                firstChild = pre.firstChild;
            }

            if (firstChild && firstChild.nodeName !== "code") {
                const code = this.page.createElement("code");
                code.setAttribute("class","language-undefined");
                let child;
                while (firstChild) {
                    code.append(firstChild);
                    firstChild = pre.firstChild;
                }
                pre.append(code);
            }
        }
    }

    async import(bookOutpuFolder: TFolder): Promise<TFile> {
        if (!this.page) {
            throw new Error('Book page not available for import');
        }

        // mark all link targets
        for (const [id, sanitizedID] of this.linkTargetIDs) {
            const e = this.page.querySelector("#" + id);
            if (e) {
                const marker = this.page.createElement("code");
                marker.setText(`{{^${sanitizedID}}}`);
                e.parentNode?.insertBefore(marker, e);
            }
        }

        const
            outputPath = await this.getVaultOutputPath(bookOutpuFolder),
            markdown = htmlToMarkdown(this.page)
                .replace(/[\n\s]*{{(\^[^\{\}]+)}}[\s\n]*/g, "\n\n$1\n")
                .replace(/\n[\n\s]*\n/g, "\n\n");
        return bookOutpuFolder.vault.create(outputPath, markdown);
    }
}


/**
 * Media asset used on pages of the e-book.
 */
class MediaAsset extends ImportableAsset {
    constructor(source: ZipEntryFile, href: string, mimetype: string) {
        super(source, href, mimetype);
        this.source = source;
    }

    get outputHref(): string {
        return this.makeHref(this.source.basename, this.source.extension);
    }

    /**
     * Import the asset into the corrent location of the book's output folder.
     *
     * @param bookOutputFolder The book's output folder.
     * @returns THe Obsidian file
     */
    async import(bookOutputFolder: TFolder): Promise<TFile> {
        const outputPath = await this.getVaultOutputPath(bookOutputFolder);
        return bookOutputFolder.vault.createBinary(outputPath, await this.source.read());
    }
}

class NavLink {
    assetHref: string;
    targetID: string;
    level: number;
    linkText: string;

    constructor(level: number, navpoint: Element, assetMap: Map<string, ImportableAsset>) {
        this.level = level;
        const
            text = navpoint.querySelector(':scope > navLabel > text'),
            content = navpoint.querySelector(':scope > content'),
            contentSrc = content?.getAttribute('src');

        this.linkText = text?.textContent ?? 'unknown';
        if (contentSrc) {
            const
                [srcHref, id] = contentSrc.split('#'),
                asset = assetMap.get(srcHref);
            if (asset instanceof PageAsset) {
                this.targetID = asset.registerLinkTarget(id);
                if (level === 0) {
                    asset.pageTitle = text?.textContent ?? undefined;
                }
            } else {
                this.targetID = id;
            }
            this.assetHref = asset ? asset.outputHref : srcHref;
        }
    }

    get markdownListItem(): string {
        const padding = ' '.repeat(this.level * 2);
        return `${padding}- [[${this.assetHref}#^${this.targetID}|${this.linkText}]]`;
    }
}

/**
 * The book's content map.
 *
 * WHen implrted creates the books title page
 */

class TocAsset extends ImportableAsset {
    bookTitle?: string;
    bookAuthor?: string;
    bookCoverImage?: string;
    bookDescription?: string;
    bookPublisher?: string;
    tags: string[] = [];
    // a flat version of the content map
    navList: NavLink[] = [];

    constructor(source: ZipEntryFile, href: string, mimetype: string) {
        super(source, href, mimetype);
    }

    private getBookMetaProperty(meta: TStringPropertyBag, key: string): string | undefined {
        const value = meta[key];
        return Array.isArray(value) ? value.join(',') : value;
    }

    async import(bookOutpuFolder: TFolder): Promise<TFile> {
        const
            path = await this.getVaultOutputPath(bookOutpuFolder),
            description = htmlToMarkdown(this.bookDescription as string ?? "-")
                .split("\n")
                .map(l => "> " + l);
        let content: string[] = [
            "---",
            `author: "${this.bookAuthor}"`,
            `publisher: "${this.bookPublisher}"`,
            `tags: [${this.tags.join(",")}]`,
            "---",
            "",
            `> [!abstract] ${this.bookTitle}`,
            `> <span style="float:Right;">![[${this.bookCoverImage}|300]]</span>`,
            ...description,
            "",
            "# " + this.bookTitle,
        ];
        content.push("# Book Content Map");
        for (const navlink of this.navList) {
            content.push(navlink.markdownListItem);
        }
        return bookOutpuFolder.vault.create(path, content.join("\n"));
    }

    get outputHref(): string {
        return this.makeHref('§ Title Page', 'md');
    }

    private parseNavPoint(level: number, navPoint: Element, assetMap: Map<string, ImportableAsset>): NavLink {
        const navlink = new NavLink(level, navPoint, assetMap);
        this.navList.push(navlink);
        navPoint.querySelectorAll(':scope > navPoint')
            .forEach(pt => this.parseNavPoint(level + 1, pt, assetMap));
        return navlink;
    }

    async parse(parser: DOMParser, assetMap: Map<string, ImportableAsset>, meta: TStringPropertyBag): Promise<void> {
        const
            doc = parser.parseFromString(await this.source.readText(), 'application/xml'),
            docTitle = doc.querySelector('ncx > docTitle > text'),
            docAuthor = doc.querySelector('ncx > docAuthor > text'),
            navMap = doc.querySelector('ncx > navMap');

        this.bookTitle = docTitle?.textContent ?? meta.title as string;
        this.bookAuthor = docAuthor?.textContent ?? this.getBookMetaProperty(meta, 'creator');
        this.bookPublisher = meta.publisher as string;
        this.bookCoverImage = meta.cover as string;
        this.bookDescription = meta.description as string;
        this.tags = Array.isArray(meta.subject) ? meta.subject : [meta.subject ?? 'e-book'];
        this.tags = this.tags.map(t => sanitizeTagname(t));
        // now build the content map. Top level navigation links denote chapters
        const navPoints = navMap?.children;
        if (navPoints) {
            const navPointCount = navPoints.length;
            for (let i = 0; i < navPointCount; i++) {
                this.parseNavPoint(0, navPoints[i], assetMap);
            }
        }
    }
}

/**
 * Representation of am e-pub book which can be imported to Obsidian.
 */
export class EpubDocument {
    private vault: Vault;
    private toc: TocAsset;
    private sourcePrefix: string; // the ZIP parent directory path to the e-book
    private mimeMap = new Map<string, string>(); // href => mimetype
    private assetMap = new Map<string, ImportableAsset>(); // href => book asset
    private parser = new DOMParser();
    private bookMeta: TStringPropertyBag = {};

    get bookTitle(): string {
        return this.bookMeta.title as string ?? 'Book';
    }
    constructor(vault: Vault) {
        this.vault = vault;
    }

    private getSourceHref(source: ZipEntryFile): string {
        return source.filepath.slice(this.sourcePrefix.length);
    }

    private async parseManifest(source: ZipEntryFile): Promise<void> {
        const manifest = this.parser.parseFromString(await source.readText(), 'application/xml');

        this.sourcePrefix = parseFilePath(source.filepath).parent + '/';

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
        const metadata = root.querySelector('metadata');
        if (metadata) {
            const
                c = metadata.children,
                cCount = c.length;
            for (let i = 0; i < cCount; i++) {
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
                    const meta = this.bookMeta[key];

                    if (meta) {
                        if (Array.isArray(meta)) {
                            meta.push(value);
                        }
                        else {
                            this.bookMeta[key] = [meta, value];
                        }
                    }
                    else {
                        this.bookMeta[key] = value;
                    }
                }
            }
        }
    }

    /**
     * Add all book assets from the ZIP archive.
     * @param entries ZIP file entries
     */
    async addAssets(entries: ZipEntryFile[]): Promise<void> {
        // find the books manifest first so that we know what the relevant files are.
        const manifestSource = entries.find((asset, _0, _1) => asset.extension === 'opf');
        if (!manifestSource) {
            return;
        }
        await this.parseManifest(manifestSource);

        // now check all files from the ZIP against the manifest and create
        // the appropriate asset facade instances
        for (const source of entries) {
            // get the type from the manifest
            if (source.filepath.startsWith(this.sourcePrefix)) {
                const
                    href = this.getSourceHref(source),
                    mimetype = this.mimeMap.get(href) ?? '?';
                switch (mimetype) {
                    case 'application/xhtml+xml':
                        // a book page
                        const page = new PageAsset(source, href, mimetype);
                        // we need to parse right away so that all pages are
                        // available when the TOC is parsed.
                        await page.parse(this.parser, this.assetMap);
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
                        break;
                    default:
                        if (source.extension) {
                            // media can me imported without processing
                            this.assetMap.set(href, new MediaAsset(source, href, mimetype));
                        }
                        break;
                }
            }
        }
    }

    async import(outputFolder: TFolder): Promise<void> {
        const
            bookFolderPath = outputFolder.path + '/' + sanitizeFilename(this.bookMeta.title as string),
            bookFolder = await this.vault.createFolder(bookFolderPath);
        console.log(`Saving Ebook to ${bookFolder.path}`);

        // prepare the assets for import
        await this.toc.parse(this.parser, this.assetMap, this.bookMeta);

        // mark the link targets in all pages


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