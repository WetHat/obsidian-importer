import { htmlToMarkdown } from 'obsidian';

/**
 * A list of regular expressions mapping characters which cause issues on the filesystem
 * to benign Unocode look-alikes.
 */
const FILENAME_TRANSFORMATIONS = [
	[/\?/g, '❓'],
	[/\:/g, '꞉'],
	[/"/g, '\''],
	[/\</g, '＜'],
	[/\>/g, '＞'],
	[/\|/g, '∣'],
	[/\\/g, '/'],
	[/\//g, '╱'],
	[/\[/g, '⟦'],
	[/\]/g, '⟧'],
	[/\#/g, '＃'],
	[/\^/g, '⌃'],
	[/\&/g, '＆'],
	[/\*/g, '✱'],
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
	return tagname.trim()
		.replace(/^#/, '') // get rid of the leading #
		.replace(/#/g, '＃') // transform internal hashes
		.replace(/"'/g, 'ʼ')
		.replace(/\s*[\\/:.]\s*/g, '/')
		.replace(/\s*[&+;\[\(\{]\s*/g, ',') // generate multiple tags
		.replace(/s*[\)\]\}]\s*/g, '')
		.replace(/\s+/g, '-');
}

/**
 * Strategies for attaching link target markers to HTML elements.
 */
const enum BlockMarkerStrategy {
	/**
	 * Insert an Obsidian link target marker after the HTMK block element.
	 */
	InsertAfter = 1,
	/**
	 * Append an Obsidian link target marker to the child elements of
	 * an HTML block element.
	 */
	Append,

	/**
	 * Descend into the sub-structure of an HTML block element to find
	 * an HTML element to mark with an Obsidian link target.
	 */
	Descend
}

/**
 * A map of HTML block elements to an action code which specifies a
 * strategy how to add Obsidian link target markers to HTML elements.
 */
const MARK_STRATEGIES = new Map<string, BlockMarkerStrategy>([
	['div', BlockMarkerStrategy.Descend],
	['p', BlockMarkerStrategy.Append],
	['h1', BlockMarkerStrategy.Append],
	['h2', BlockMarkerStrategy.Append],
	['h3', BlockMarkerStrategy.Append],
	['h4', BlockMarkerStrategy.Append],
	['h5', BlockMarkerStrategy.Append],
	['h6', BlockMarkerStrategy.Append],
	['ul', BlockMarkerStrategy.Descend],
	['ol', BlockMarkerStrategy.Descend],
	['li', BlockMarkerStrategy.Append],
	['figure', BlockMarkerStrategy.InsertAfter],
	['figcaption', BlockMarkerStrategy.Append],
	['caption', BlockMarkerStrategy.Append],
	['table', BlockMarkerStrategy.InsertAfter],
	['td', BlockMarkerStrategy.Append],
	['th', BlockMarkerStrategy.Append],
	['dl', BlockMarkerStrategy.Descend],
	['dt', BlockMarkerStrategy.Append],
	['dd', BlockMarkerStrategy.Append],
	['header', BlockMarkerStrategy.Append],
	['footer', BlockMarkerStrategy.Append],
	['section', BlockMarkerStrategy.Descend],
	['article', BlockMarkerStrategy.Descend],
	['aside', BlockMarkerStrategy.Descend],
	['pre', BlockMarkerStrategy.InsertAfter],
	['blockquote', BlockMarkerStrategy.InsertAfter],
]);

/**
 * A comma separated list of HTML elements which can be link targets.
 *
 * This list is designed to be used in querySelector css queries.
 */
const TARGETABLE_ELEMENTS = Array.from(MARK_STRATEGIES.entries())
	.filter(([_, value]) => value !== BlockMarkerStrategy.Descend)
	.map(([key, _]) => key)
	.join(",");

/**
 * Mark an HTML element as Obsidian link target.
 *
 * Obsidian link targtes have the form `^id` where 'id' is alpanumeric and needs to be attached
 * **after** the Markdown block to link to. few HTML block elements have direct representation in MArkdown,
 * hence this function finds the best element to attach a marker to and marks it with a code block
 * which is turned into a proper Obsidian link target during Markdown post-processing.
 *
 * The link target marker is processed by {@link convertToMarkdown}.
 *
 * @param element An element of a HTML document to mark as Obsidian link target.
 * @returns The obsidian compatible link target id (not necessarily the given the element's id).
 */
export function markElementAsLinkTarget(element: Element): string | undefined {
	// Now, that we have an id, find the best element and attachment strategy
	let
		strategy: BlockMarkerStrategy | undefined,
		targetElement: Element | null = element;

	// find a block element that has any action defined (in case the given element is not recognized)
	while (targetElement && undefined === (strategy = MARK_STRATEGIES.get(targetElement.localName))) {
		targetElement = targetElement.parentElement;
	}
	if (!targetElement) {
		return undefined; // nothing found to attach marker to
	}

	if (strategy === BlockMarkerStrategy.Descend) {
		// find a targetable element
		const targetable = targetElement.querySelector(TARGETABLE_ELEMENTS);
		if (targetable) {
			targetElement = targetable;
			strategy = MARK_STRATEGIES.get(targetElement.localName);
		} else {
			// no luck. Use default strategy
			strategy = BlockMarkerStrategy.InsertAfter;
		}
	}
	// Now that we have an element to work with, check if it already has a marker we can use.
	// we do that to avoid proliveration of multiple markers on the same element.
	let aliasID: string | undefined;
	switch (strategy) {
		case BlockMarkerStrategy.InsertAfter:
			// look before this element for a marker
			aliasID = targetElement.nextElementSibling?.getAttribute('marker') ?? undefined;
			break;
		case BlockMarkerStrategy.Append:
			aliasID = targetElement.lastElementChild?.getAttribute('marker') ?? undefined;
			break;
	}
	if (aliasID) {
		// reuse the already existing marker
		return aliasID;
	}

	// attach a marker to the targetElement

	// determine the id to use. try a sanitized version of the element's id first
	let id: string | undefined = element.getAttribute('id')?.replace(/[_\.:]+/g, '-');
	if (!id || !/^[a-zA-Z][\w\-.]*$/.test(id)) {
		// make up an Obsidian compatible id
		id = (Math.random() * 1000000000000000000).toString(24);
	}

	const marker = element.doc.createElement('code');
	marker.setAttribute('marker', id);
	// attach a marker `code` element to the correct position so that the target placeholder
	// makes it all the way through to Markdown.
	switch (strategy) {
		case BlockMarkerStrategy.Append:
			marker.setText('{{ ^' + id + '}}');
			targetElement.appendChild(marker);
			break;
		case BlockMarkerStrategy.InsertAfter:
			marker.setText('{{newline}}{{^' + id + '}}');
			const parent = targetElement.parentElement;
			if (!parent) {
				return undefined;
			}
			parent.insertAfter(marker, targetElement);
			break;
	}

	return id;
}

/**
 * Convert and post-process a HTML document to Markdown.
 *
 * During post-processing all moustache type markers `{{...}}` with
 * Obsidian Markdown elements.
 *
 * @param html The HTML document to convert and post-process.
 * @returns Post-processed Markdown
 */
export function convertToMarkdown(html: Document): string {
	return htmlToMarkdown(html.body.doc)
		.replace(/[\n\s]*`(({{newline}})*){{(\s*\^[^\}]+)}}`[\n\s]*/g, '$1$3\n\n') // link targets
		.replace(/{{newline}}/g, '\n').trim();
}