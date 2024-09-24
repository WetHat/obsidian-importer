import { ZipReader } from '@zip.js/zip.js';
import { parseFilePath, PickedFile } from 'filesystem';
import { ImportContext } from 'main';
import { htmlToMarkdown, TFile, TFolder, Vault } from 'obsidian';
import { readZip, ZipEntryFile } from 'zip';

/**
 * A list of regular expressions mapping characters which cause issues on the filesystem
 * to benign Unocode look-alikes.
 */
const FILENAME_TRANSFORMATIONS = [
    [/\?/g, "❓"],
    [/\:/g, "꞉"],
    [/"/g, "'"],
    [/\</g, "＜"],
    [/\>/g, "＞"],
    [/\|/g, "∣"],
    [/\\/g, "/"],
    [/\//g, "╱"],
    [/\[/g, "⟦"],
    [/\]/g, "⟧"],
    [/\#/g, "＃"],
    [/\^/g, "⌃"],
    [/\&/g, "＆"],
    [/\*/g, "✱"],
];

/**
 * Utility to convert a string into a valid filename.
 *
 * Applies the transformation defined in {@link FILENAME_TRANSFORMATIONS} to make
 * the given filenme compatible with the file system.
 * @param basename - A string, such as a title, to create a filename for.
 * @returns valid basename.
 */
function tidyFilename(basename: string): string {

    let sanitized = basename;

    for (let [from, to] of FILENAME_TRANSFORMATIONS) {
        sanitized = sanitized.replace(from as RegExp, to as string);
    }

    return sanitized.trim();
}

function tidyTagname(tagname: string) {
    return tagname
        .replace(/^#/g, "") // get rid of the leading #
        .replace(/#/g, "＃") // transform internal hashes
        .replace(/\./g, "〭")
        .replace(/[&/\[\(\{]/g, ",")
        .replace(/:/g, "꞉")
        .replace(/[;/\)\]\}]/, "")
        .trim()
        .replace(/\s+|[\\;]/, "-")
        ;
}

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
 * <metadata/>
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
                this.meta.set("coverPage",href ? [href] : []);
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
 * Base class for assets in an e-pub ZIP archive that can be imported to Obsidian.
 */
abstract class ImportableAsset {
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
     * Works for botu source and output links as they share a common, relative folder path.
     *
     * @param basename the asset file's basename either in the book source or in the output folder.
     * @param extension THe asset file's extension
     * @param encode `true` to url encode the basename;
     * @returns a link relative to the book in the output or source folder.
     */
    protected makeAssetPath(basename: string, extension: string, encode: boolean): string {
        return [
            ...this.assetFolderPath,
            (encode ? encodeURIComponent(basename) : basename) + '.' + extension
        ].join('/');
    }

    /**
     * This property is computed by derived classes.
     *
     * @see makeAssetPath
     *
     * @param encode `true` to url-encode the path
     * @return Relative path of the asset relative to the book in the output folder.
     */
    abstract outputAssetPath(encode: boolean): string;

    get sourceAssetPath(): string {
        return this.makeAssetPath(this.source.basename, this.source.extension, false);
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
        return bookOutputFolder.path + '/' + this.outputAssetPath(false);
    }
}

type MarkerLocation = {
    blockElement: Element,
    action: BlockMarkerAction
}

enum BlockMarkerAction {
    insertAfter = 1, // insert link target after the block element
    append, // append link target to the cildren of the block element
    scanAppend // scan for a child with append action
}

/**
 * Representation of a page in the epub book.
 */
class PageAsset extends ImportableAsset {
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

    linkTargetMap = new Map<string, string>(); // id => sanitized ID

    /**
     * A map of HTML block elements to an action code which specifies how
     * the elemnts has to be marked as link target,
     */
    private static readonly BLOCK_ACTIONS = new Map<string, BlockMarkerAction>([
        ["div", BlockMarkerAction.scanAppend],
        ["p", BlockMarkerAction.append],
        ["h1", BlockMarkerAction.append],
        ["h2", BlockMarkerAction.append],
        ["h3", BlockMarkerAction.append],
        ["h4", BlockMarkerAction.append],
        ["h5", BlockMarkerAction.append],
        ["h6", BlockMarkerAction.append],
        ["ul", BlockMarkerAction.scanAppend],
        ["ol", BlockMarkerAction.scanAppend],
        ["li", BlockMarkerAction.append],
        ["table", BlockMarkerAction.insertAfter],
        ["td", BlockMarkerAction.append],
        ["th", BlockMarkerAction.append],
        ["dl", BlockMarkerAction.scanAppend],
        ["dt", BlockMarkerAction.append],
        ["dd", BlockMarkerAction.append],
        ["header", BlockMarkerAction.append],
        ["footer", BlockMarkerAction.append],
        ["section", BlockMarkerAction.scanAppend],
        ["article", BlockMarkerAction.scanAppend],
        ["aside", BlockMarkerAction.scanAppend],
        ["pre", BlockMarkerAction.insertAfter],
        ["blockquote", BlockMarkerAction.insertAfter],
    ]);


    getAliasId(markerLocation: MarkerLocation): string | null {
        let id: string | null = null;
        const { blockElement, action } = markerLocation;
        switch (action) {
            case BlockMarkerAction.insertAfter:
                // look before this element for a marker
                id = blockElement.nextElementSibling?.getAttribute("marker") ?? null;
                break;
            case BlockMarkerAction.append:
                id = blockElement.lastElementChild?.getAttribute("marker") ?? null;
                break;
        }
        return id;
    }

    /**
     * Find an HTML block element which is suitable for marking with an Obsidian style
     * link target marker.
     *
     * @see {getOutputPageLink}
     * @param e An HTML element that has an id which is used as link target
     * @returns A block element that should be used for attaching a target marker.
     */
    findBlockElement(e: Element | null): MarkerLocation | undefined {
        let action: BlockMarkerAction | undefined;

        // find a block element that has any action defined
        while (e && undefined === (action = PageAsset.BLOCK_ACTIONS.get(e.localName))) {
            e = e.parentElement;
        }

        if (action === BlockMarkerAction.scanAppend) {
            // find a child with an 'append' action.
            let
                appendChild: Element | null = e,
                childAction: BlockMarkerAction | undefined = action;

            // inspect the first cild elements for an 'append' action
            while (appendChild && childAction !== BlockMarkerAction.append) {
                appendChild = appendChild?.firstElementChild;
                if (appendChild) {
                    childAction = PageAsset.BLOCK_ACTIONS.get(appendChild.localName);
                }
            }

            if (appendChild && childAction === BlockMarkerAction.append) {
                return {
                    blockElement: appendChild,
                    action: childAction,
                }
            } else {
                // no luck. change action to 'prepend'
                action = BlockMarkerAction.insertAfter;
            }
        }

        if (action && e) {
            return {
                blockElement: e,
                action: action,
            }
        }
        return undefined;
    }

    constructor(source: ZipEntryFile, href: string, mimetype: string) {
        super(source, href, mimetype);
    }

    /**
     * Get a link to a page element or page in the book output folder,
     *
     * This method injects a code block into the location of the elment with the given
     * id for Markdown postprocessing to pick up.
     *
     * @param targetID Optional id to an element in the page identified by that id.
     * @returns link to a page element (if a `targetIS` was provided) or the
     *          page (if no `targetID` eas provided).
     */
    getOutputPageLink(encode: boolean, targetID?: string): string {
        const path = this.outputAssetPath(encode);
        if (!targetID || !this.page) {
            return path;
        }

        // make or get a link for that target id
        let id = this.linkTargetMap.get(targetID);
        if (!id) {
            // that targetID is not known - get the element with this id
            const e = this.page.querySelector("#" + targetID);
            if (!e) {
                return path;
            }
            // find the block element to attach the marker to
            const block = this.findBlockElement(e);
            if (!block) {
                return path;
            }

            // maybe can re-use an existing id
            const aliasID = this.getAliasId(block);
            if (aliasID) {
                // remember that
                this.linkTargetMap.set(targetID, aliasID);
                id = aliasID;
            } else {
                id = targetID.replace(/[_\.]+/g, "-"); // sanitize the id and create a marker
                this.linkTargetMap.set(targetID, id);

                const marker = this.page.createElement("code");
                marker.setAttribute("marker", id);
                const { blockElement, action } = block;
                // attach the marker to the correct position
                switch (action) {
                    case BlockMarkerAction.append:
                        marker.setText("{{ ^" + id + "}}");
                        blockElement.appendChild(marker);
                        break;
                    case BlockMarkerAction.insertAfter:
                        marker.setText("{{newline}}{{^" + id + "}}");
                        const parent = blockElement.parentElement;
                        if (!parent) {
                            return path;
                        }
                        parent.insertAfter(marker, blockElement);
                        break;
                }
            }
        }
        return path + "#^" + id; // the Obsidian link format;
    }

    outputAssetPath(encode: boolean): string {
        const basename = tidyFilename(this.pageTitle ?? this.source.basename);
        return this.makeAssetPath(basename, "md", encode);
    }

    async parse(book: EpubBook): Promise<void> {
        const html = (await this.source.readText())
            .replace(/&lt;/g, "＜")
            .replace(/&gt;/g, "＞"); // replace Obsidian unfriendly html entities.
        // we need to use the `text/html`so that Obsidian produces usable Markdown!
        this.page = book.parser.parseFromString(html, "text/html");

        // Apply document transformations to make the html Obsidian friendly
        this.injectCodeBlock();
        this.hoistTableCaptions();
    }

    /**
     * A page transformation to hoist '<caption>' elements inside a `<table>` to the first positions
     * for Obsidian to process them correctly.
     *
     * In addidtion a `{{newline}}` post-processing marker is added to make sure there
     * is an empty line between caption and table.
     */
    private hoistTableCaptions() {
        if (!this.page) {
            return;
        }
        this.page.body.querySelectorAll("table > caption")
            .forEach(caption => {
                const table = caption.parentElement;
                if (table) {
                    if (table.firstElementChild?.nodeName !== caption.nodeName) {
                        // hoist to top
                        table.insertBefore(caption, table.firstElementChild);
                    }
                }
                // mark the caption for postprocessing
                caption.setText(caption?.textContent + "{{newline}}")
            });
    }
    /**
     * A page transformation looking for `<pre>` tags which are **not** immediately followed by a `<code>` block
     * and inject one.
     *  Without this Obsidian will not generate a markdown code block and obfuscates any code contained in the '<pre>'.
     */
    private injectCodeBlock() {
        if (!this.page) {
            return;
        }

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
                code.setAttribute("class", "language-undefined");
                let child;
                while (firstChild) {
                    code.append(firstChild);
                    firstChild = pre.firstChild;
                }
                pre.append(code);
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
            if (href) {
                const
                    parts = href.split("#"),
                    [path, id] = parts,
                    asset = path ? book.getAsset(path) : this;
                if (asset instanceof PageAsset) {
                    const link = asset.getOutputPageLink(true, id);
                    a.setAttribute("href", link);
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
        if (!this.page) {
            throw new Error('Book page not available for import');
        }

        const
            outputPath = await this.getVaultOutputPath(bookOutpuFolder),
            markdown = htmlToMarkdown(this.page.body)
                .replace(/[\n\s]*`(({{newline}})*){{(\s*\^[^\}]+)}}`[\n\s]*/g, "$1$3\n\n") // link targets
                .replace(/{{newline}}/g, "\n");

        return bookOutpuFolder.vault.create(outputPath, markdown);
    }
}

/**
 * Media asset used on pages of the e-book.
 */
class MediaAsset extends ImportableAsset {
    constructor(source: ZipEntryFile, href: string, mimetype: string) {
        super(source, href, mimetype);
    }

    outputAssetPath(encode: boolean): string {
        return this.makeAssetPath(this.source.basename, this.source.extension, encode);
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
                        asset.pageTitle = navtext ;
                    }
                }
                this.assetLink = asset.getOutputPageLink(false, id);
            } else {
                this.assetLink = asset ? asset.outputAssetPath(false) : srcPath;
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
class TocAsset extends ImportableAsset {
    bookTitle: string = "Untitled Book";
    bookAuthor: string = "Unknown Author";
    bookCoverImage?: string;
    bookDescription?: string;
    bookPublisher?: string;
    tags: string[] = [];
    // a flat version of the content map
    navList: NavLink[] = [];

    constructor(source: ZipEntryFile, href: string, mimetype: string) {
        super(source, href, mimetype);
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
            "aliases: ",
            `  - "${tidyFilename(this.bookTitle)}"`,
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

    outputAssetPath(encode: boolean): string {
        return this.makeAssetPath('§ Title Page', 'md', encode);
    }

    private parseNavPoint(level: number, navPoint: Element, book: EpubBook): NavLink {
        const navlink = new NavLink(level, navPoint, book);
        this.navList.push(navlink);
        navPoint.querySelectorAll(':scope > navPoint')
            .forEach(pt => this.parseNavPoint(level + 1, pt, book));
        return navlink;
    }

    async parse(book: EpubBook): Promise<void> {
        const
            doc = book.parser.parseFromString(await this.source.readText(), 'application/xml'),
            meta = book.bookMeta,
            docTitle = doc.querySelector('ncx > docTitle > text'),
            docAuthor = doc.querySelector('ncx > docAuthor > text'),
            navMap = doc.querySelector('ncx > navMap');

        this.bookTitle = docTitle?.textContent ?? (meta.asString("title") ?? this.bookTitle);
        this.bookAuthor = docAuthor?.textContent ?? (meta.asString("creator") ?? this.bookAuthor);
        this.bookPublisher = meta.asString("publisher");
        this.bookDescription = meta.asString("description");
        this.tags = meta.asArray("subject") ?? ["e-book"];
        this.tags = this.tags.map(t => tidyTagname(t));
        this.bookCoverImage = meta.asString("cover");
        if (!this.bookCoverImage) {
            // get it from the cover page then
            const coverPage = meta.asString("coverPage");
            if (coverPage) {
                const asset = book.getAsset(coverPage);
                // find the image in the content
                if (asset instanceof PageAsset && asset.page) {
                    const images = asset.page.body.getElementsByTagName("img");
                    if (images.length > 0) {
                        const src = images[0].getAttribute("src");
                        if (src) {
                            this.bookCoverImage = src.replace(/\.\.\//g,""); // make relative to top
                        }
                    }
                }
            }
        }

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
            bookFolderPath = outputFolder.path + '/' + tidyFilename(this.bookTitle),
            bookFolder = await this.vault.createFolder(bookFolderPath);
        this.ctx.status(`Saving Ebook to ${bookFolder.path}`);

        // prepare the assets for import
        await this.toc.parse(this);

        // reconnect the link targets in all pages
        for (const asset of this.assetMap.values()) {
            if (asset instanceof PageAsset) {
                asset.reconnectLinks(this);
            }
        }

        // import all recognized assets of the book (as determined by the book manifest)
        for (const asset of this.assetMap.values()) {
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

export async function importEpubBook(vault: Vault, epub: PickedFile, outputFolder: TFolder, ctx: ImportContext): Promise<EpubBook> {
    const doc = new EpubBook(vault, ctx);

    await readZip(epub, async (zip: ZipReader<any>, entries: ZipEntryFile[]): Promise<void> => {
        await doc.addAssets(entries);
        await doc.import(outputFolder);
        ctx.status(`import of ${epub.name} complete`);
    });
    return doc;
}