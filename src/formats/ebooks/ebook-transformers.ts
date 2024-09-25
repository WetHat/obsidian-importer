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
 * Convert a string into a valid filename.
 *
 * Applies the transformation defined in {@link FILENAME_TRANSFORMATIONS} to make
 * the given tile string compatible with the file system as well as Obsidian.
 *
 * The transformation attmepty to preseve the original appearance ot the title by replacing
 * invalid characters with Unicode look-alikes.
 *
 * @param title - A page title string to transform into a valid Obsidian basename for a file .
 * @returns valid basename.
 */
export function titleToBasename(title: string): string {

    let sanitized = title;

    for (let [from, to] of FILENAME_TRANSFORMATIONS) {
        sanitized = sanitized.replace(from as RegExp, to as string);
    }

    return sanitized.trim();
}


export function toFrontmatterTagname(tagname: string) {
    return tagname
        .replace(/^#/, "") // get rid of the leading #
        .replace(/#/g, "＃") // transform internal hashes
        .replace(/\s*[&+.\\:;/\[\(\{]\s*/g, ",") // generate multiple tags
        .replace(/s*[\)\]\}]\s*/g, "")
        .replace(/\s+/g, "-");
}

/**
 * An HTML transformation to hoist '<caption>' elements inside a `<table>` to the first positions
 * for Obsidian to process them correctly.
 *
 * In addidtion a `{{newline}}` Markdown post-processing marker is added to make sure there
 * is an empty line between caption and table.
 *
 * @param element an element of an HTML document.
 */
export function hoistTableCaptions(element: HTMLElement) {
    element.querySelectorAll("table > caption")
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
  * An HTML transformation looking for `<pre>` tags which are **not** immediately followed by a `<code>` block
  * and inject one.
  *
  * Without that `<code>` element Obsidian will not generate a Markdown code block and obfuscates any code contained in the '<pre>'.
  *
  * @param element an element of an HTML document.
  */
 export function injectCodeBlock(element: HTMLElement) {

    const pres = element.getElementsByTagName("pre");
    for (let i = 0; i < pres.length; i++) {
        const pre = pres[i];
        let firstChild = pre.firstChild;

        // remove emptylines
        while (firstChild?.nodeType === Node.TEXT_NODE && firstChild.textContent?.trim().length === 0) {
            firstChild.remove();
            firstChild = pre.firstChild;
        }

        if (firstChild && firstChild.nodeName !== "code") {
            const code = element.doc.createElement("code");
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