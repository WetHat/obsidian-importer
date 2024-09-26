
import { htmlToMarkdown, TFile, TFolder } from 'obsidian';
import { ZipEntryFile } from 'zip';
import { EpubBook } from './epub-import';
import { convertToMarkdown, hoistTableCaptions, injectCodeBlock, markElementAsLinkTarget, titleToBasename } from '../ebook-transformers';

/**
 * Base class for assets in an e-pub ZIP archive that can be imported to Obsidian.
 */
export abstract class ImportableAsset {
    /**
     * asset source in the ZIP archive.
     * Needed for delazd loading of the asset contents
     */
    protected source: ZipEntryFile;

    /**
     * The relative folder path to an asset relative to the book.
     * Will also used as the relative folder path in the output folder.
     */
    assetFolderPath: string[];

    /**
     * The mimetype of the asset as defined in the book's manifest.
     */
    mimetype: string;

    /**
     * Create anew instance of an importable asset.
     *
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
     * A utility function to build a relative path to an asset.
     *
     * Works for both source and output paths as they share a common, relative folder path.
     *
     * @param filename Name
     * @returns a link relative to the book or source folder.
     */
    protected makeAssetPath(filename: string): string {
        return [
            ...this.assetFolderPath,
            filename,
        ].join('/');
    }

    /**
     * Convert a path which is relative to this asset to a book relative path.
     *
     * The link is typically taken from the content of this asset.
     *
     * @param relPath a path relative to this asset
     * @returns Book relative path
     */
    pathFromBook(relPath: string): string {
        if (this.assetFolderPath.length > 0) {
            return [
                ...this.assetFolderPath,
                relPath
            ].join("/");
        }
        return relPath;
    }

    /**
     * Get a relative path from this asset to another asset.
     *
     * @param targetAsset The other asset to generate a relative path to.
     * @returns The relative path to the other asset.
     */
    relativePathTo(targetAsset: ImportableAsset): string {
        let
            thisPath = Array.from(this.assetFolderPath),
            targetPath = Array.from(targetAsset.assetFolderPath);
        while (thisPath.length > 0 && targetPath.length > 0 && thisPath[0] === targetPath[0]) {
            thisPath.shift();
            targetPath.shift();
        }
        targetPath.push(targetAsset.outputFilename);

        return "../".repeat(thisPath.length) + targetPath.join("/");
    }
    /**
     * Get the path to the asset relatice the book output folder.
     *
     * @see makeAssetPath
     *
     * @param encode `true` to url-encode the path
     * @return Path relative to the book in the output folder.
     */
    get outputPath(): string {
        return this.makeAssetPath(this.outputFilename);
    }

    /**
     * This property is implemented by derived classes and contains the
     * the desired filena, of the asset in the book output folder (including file extension).
     *
     * @type {string}
     */
    abstract get outputFilename(): string;

    get sourceFilename(): string {
        return this.source.basename + "." + this.source.extension;
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
    async getVaultOutputPath(bookOutputFolder: TFolder): Promise<string> {
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
        return bookOutputFolder.path + '/' + this.outputPath;
    }
}

/**
 * Representation of a page in the epub book.
 */
export class PageAsset extends ImportableAsset {
    /**
     * Flag to indicate if this page is in table of contents format (nav).
     *
     * @type boolean
     */
    toc: boolean = false;
    /**
     * The html document generated by {@link PageAsset.parse}.
     * @type {Document}
     */
    page?: Document;
    /**
     * The book's title as specified in the content map file `toc.ncx`
     * of the book.
     */
    pageTitle?: string;
    private book?: EpubBook;
    linkTargetMap = new Map<string, string>(); // id => sanitized ID

    constructor(source: ZipEntryFile, href: string, mimetype: string) {
        super(source, href, mimetype);
    }

    /**
     * Get the fragment identifier (anchor) of page element,
     *
     * This method injects a code block into the location of the elment with the given
     * id for Markdown postprocessing to pick up.
     *
     * @param targetID Id of an element in the page document.
     * @returns The fragment identifier to a page element in Obsidian format (`#^...`)
     *          or an empty string if no elemnt with the given targetD could be cound
     */
    fragmentIdentifier(targetID: string): string {
        if (!this.page) {
            return "";
        }

        // check if we already have a merker for this id
        let id = this.linkTargetMap.get(targetID);
        if (!id) {
            // that targetID is not known - get the element with this id
            // and create a marker
            let e: Element | null;
            try {
                // try the canonical selector
                e = this.page.querySelector("#" + targetID);
            } catch (ex: any) {
                // fallback if targtID is malformed
                e = this.page.querySelector(`[id="${targetID}"]`);
            }

            if (!e) {
                return ""; // no such element just link to the page
            }

            id = markElementAsLinkTarget(e);
            if (!id) {
                return ""; // hust link to the page
            }
            this.linkTargetMap.set(targetID, id); // remember that
        }
        return "#^" + id; // the Obsidian link format;
    }

    get outputFilename(): string {
        return titleToBasename(this.pageTitle ?? this.source.basename) + ".md";
    }

    async parse(book: EpubBook, toc: boolean): Promise<void> {
        this.book = book;
        this.toc = toc;
        const html = (await this.source.readText())
            .replace(/&lt;/g, "＜")
            .replace(/&gt;/g, "＞"); // replace Obsidian unfriendly html entities.
        // we need to use the `text/html`so that Obsidian produces usable Markdown!
        this.page = book.parser.parseFromString(html, "text/html");
        const ttl = this.page.title;
        if (ttl !== "") {
            this.pageTitle = ttl;
        }

        if (this.page) {
            if (toc) {
                // a navigation page - convert all nav element to sections
                this.page.body.querySelectorAll("nav").forEach(nav => {
                    const section = nav.doc.createElement("section");
                    nav.parentElement?.insertBefore(section, nav);
                    while (nav.firstChild) {
                        section.append(nav.firstChild);
                    }
                    nav.remove();
                });
            } else {
                // a content page
                const body = this.page.body;
                // Apply document transformations to make the html Obsidian friendly
                injectCodeBlock(body);
                hoistTableCaptions(body);
            }
        }
    }

    /**
     * Reconnect all links on this page pointing to other assets.
     *
     * Searches for all hyperlinks, extracts link target ids,
     * computes the correct link in the book output folder and
     * updated the each hyperlink.
     */
    reconnectLinks(book: EpubBook) {
        this.page?.body.querySelectorAll("a[href]").forEach(a => {
            const href = a.getAttribute("href");
            if (href && !href.includes("://")) {
                const
                    parts = href.split("#"),
                    [path, id] = parts,
                    targetAsset = path ? book.getAsset(this.pathFromBook(path)) : this;
                if (targetAsset instanceof PageAsset) {
                    const link = this.relativePathTo(targetAsset) + targetAsset.fragmentIdentifier(id);
                    a.setAttribute("href", link.replace(/\s/g, "%20"));
                    // we also need to make sure the link text is compatible with
                    // markdown links
                    let txt = a.textContent;
                    if (txt) {
                        const sanitized = txt.replace(/([\]\[]+)/g, "\\$1");
                        if (sanitized.length !== txt.length) {
                            a.setText(sanitized);
                        }
                    }
                }
            }
        })
    }
    async import(bookOutpuFolder: TFolder): Promise<TFile> {
        if (!this.page || !this.book) {
            throw new Error('Book page not available for import');
        }

        const outputPath = await this.getVaultOutputPath(bookOutpuFolder)
        let markdown: string[];
        if (this.toc) {
            markdown = [
                ...this.book.frontmatter,
                "",
                ...this.book.abstract,
                ""
            ];
        } else {
            const toc = this.book.toc;
            markdown = [
                "---",
                toc ? `book: "[[${this.relativePathTo(toc)}|${this.book.title}]]"` : `"${this.book.title}"`,
                `tags: ${this.book.tags}`,
                "---",
                ""
            ]
        }

        markdown.push(convertToMarkdown(this.page));
        return bookOutpuFolder.vault.create(outputPath, markdown.join("\n"));
    }
}

/**
 * Media asset used on pages of the e-book.
 */
export class MediaAsset extends ImportableAsset {
    constructor(source: ZipEntryFile, href: string, mimetype: string) {
        super(source, href, mimetype);
    }

    get outputFilename(): string {
        return this.sourceFilename;
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

/**
 * A link descriptor for one link in the content map defined in (toc.ncx)
 */
class NavLink {
    assetLink: string;
    level: number;
    linkText: string;

    constructor(level: number, navpoint: Element, book: EpubBook) {
        this.level = level;
        const
            text = navpoint.querySelector(':scope > navLabel > text'),
            content = navpoint.querySelector(':scope > content'),
            contentSrc = content?.getAttribute('src');

        this.linkText = text?.textContent ?? 'unknown';
        if (contentSrc) {
            const
                [srcPath, id] = contentSrc.split('#'),
                asset = book.getAsset(srcPath);
            if (asset instanceof PageAsset) {
                if (!asset.pageTitle) {
                    const navtext = text?.textContent;
                    if (navtext) {
                        asset.pageTitle = navtext;
                    }
                }
                this.assetLink = asset.outputPath + asset.fragmentIdentifier(id);
            } else {
                this.assetLink = asset ? asset.outputPath : srcPath;
            }
        }
    }

    get markdownListItem(): string {
        const padding = ' '.repeat(this.level * 2);
        return `${padding}- [[${this.assetLink}|${this.linkText}]]`;
    }
}

/**
 * The book's content map.
 *
 * The content map is built from the books `toc.ncx` by parsing
 * the `<navMap>` element.
 *
 * WHen imported creates the book's title page containig:
 * - Frontmatter with book metadata
 * - Book content map.
 */
export class TocAsset extends ImportableAsset {
    private book?: EpubBook;
    // a flat version of the content map
    navList: NavLink[] = [];

    constructor(source: ZipEntryFile, href: string, mimetype: string) {
        super(source, href, mimetype);
    }

    async import(bookOutpuFolder: TFolder): Promise<TFile> {
        const
            path = await this.getVaultOutputPath(bookOutpuFolder),
            description = htmlToMarkdown(this.book?.description ?? "-")
                .split("\n")
                .map(l => "> " + l);
        let content: string[] = this.book ? [
            ...this.book.frontmatter,
            "",
            ...this.book.abstract,
            "",
            "# " + this.book.title,
        ] : [];
        content.push("# Book Content Map");
        for (const navlink of this.navList) {
            content.push(navlink.markdownListItem);
        }
        return bookOutpuFolder.vault.create(path, content.join("\n"));
    }

    get outputFilename(): string {
        return "§ Title Page.md";
    }

    private parseNavPoint(level: number, navPoint: Element, book: EpubBook): NavLink {
        const navlink = new NavLink(level, navPoint, book);
        this.navList.push(navlink);
        navPoint.querySelectorAll(':scope > navPoint')
            .forEach(pt => this.parseNavPoint(level + 1, pt, book));
        return navlink;
    }

    async parse(book: EpubBook): Promise<void> {
        this.book = book;
        const
            doc = book.parser.parseFromString(await this.source.readText(), 'application/xml'),
            navMap = doc.querySelector('ncx > navMap');

        // now build the content map. Top level navigation links denote chapters
        const navPoints = navMap?.children;
        if (navPoints) {
            const navPointCount = navPoints.length;
            for (let i = 0; i < navPointCount; i++) {
                this.parseNavPoint(0, navPoints[i], book);
            }
        }
    }
}


