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
		.replace(/\s*[&+.\\:;\[\(\{]\s*/g, ',') // generate multiple tags
		.replace(/s*[\)\]\}]\s*/g, '')
		.replace(/\s+/g, '-');
}

type TTExtTransformer = (textNode: Node) => void;

export function entityTransformer(textNode: Node) {
	const text = textNode.textContent;
	if (text && textNode.parentElement?.localName !== "code") {
		 // replace Obsidian unfriendly html entities and characters.
		const transformed = text
			.replace(/>/g, '＞')
			.replace(/</g, '＜');
		if (transformed !== text) {
			textNode.textContent = transformed;
		}
	}
}

export function transformText(node: Node, transformer: TTExtTransformer) {
	node.childNodes.forEach( n => {
		if (n.nodeType === Node.TEXT_NODE) {
			transformer(n);
		} else {
			transformText(n,transformer);
		}
	});
}

/**
 * Put mermaid diagrams into a code block so that Obsidian can pick them up.
 *
 * @param element the HTML element to scan for mermaid diagrams
 */
export function mermaidToCodeBlock(element: Element) {
	const
		mermaids = element.getElementsByClassName("mermaid"),
		mermaidCount = mermaids.length;

	for (let i = 0; i < mermaidCount; i++) {
		const mermaid = mermaids[i];

		switch (mermaid.localName) {
			case "code":
				mermaid.classList.add("language-mermaid");
				const mermaidParent = mermaid.parentElement;
				if (mermaidParent && mermaidParent.localName !== "pre") {
					const pre = mermaid.doc.createElement("pre");
					mermaidParent.insertBefore(pre, mermaid);
					pre.append(mermaid);
				}
				break;

			case "pre":
				if (mermaid.firstElementChild?.localName !== "code") {
					const code = mermaid.doc.createElement("code");
					code.className = "language-mermaid";
					while (mermaid.firstChild) {
						code.append(mermaid.firstChild);
					}
					mermaid.append(code);
				}
				break;

			default:
				const
					pre = mermaid.doc.createElement("pre"),
					code = mermaid.doc.createElement("code");
				code.className = "language-mermaid";
				pre.append(code);
				while (mermaid.firstChild) {
					code.append(mermaid.firstChild);
				}
				mermaid.append(pre);
				break;
		}
	}
}

/**
 * An HTML transformation to hoist '<caption>' elements inside a `<table>` to the first positions
 * for Obsidian to process them correctly.
 *
 * In addidtion a `{{newline}}` Markdown post-processing marker is added to make sure there
 * is an empty line between caption and table. This marker is processed by
 * {@link convertToMarkdown}.
 *
 * @param element an element of an HTML document.
 */
export function hoistTableCaptions(element: HTMLElement) {
	element.querySelectorAll('table > caption')
		.forEach(caption => {
			const table = caption.parentElement;
			if (table) {
				if (table.firstElementChild?.nodeName !== caption.nodeName) {
					// hoist to top
					table.insertBefore(caption, table.firstElementChild);
				}
			}
			// mark the caption for postprocessing
			caption.setText(caption?.textContent + '{{newline}}');
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
	const pres = Array.from(element.getElementsByTagName('pre'));
	for (let i = 0; i < pres.length; i++) {
		const pre = pres[i];
		let firstChild = pre.firstChild;

		// remove emptylines
		while (firstChild?.nodeType === Node.TEXT_NODE && firstChild.textContent?.trim().length === 0) {
			firstChild.remove();
			firstChild = pre.firstChild;
		}

		const firstChildelement = pre.firstElementChild;

		if (!firstChildelement || firstChildelement.localName !== 'code') {
			const code = element.doc.createElement('code');
			code.className = 'language-undefined';
			while (firstChild) {
				code.append(firstChild);
				firstChild = pre.firstChild;
			}
			pre.append(code);
		}
	}
}

/**
 * Strategies for attaching link target markers to HTML elements,
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
 * Mark an HTML element as Obsidian link target.
 *
 * Obsidian link targtes have the form `^id` where 'id' is alpanumeric and needs to be attached
 * **after** the Markdown block to link to. few HTML block elements have direct representation in MArkdown,
 * hence this function finds the best element to attach a marker to and marks it with a code block
 * which is turned into a proper Obsidian link target during Markdown post-processing.
 *
 * THe link target marker is processed by {@link convertToMarkdown}.
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
		// descend into the targetElement's structure to find a child element with
		// an 'append' or `insertAfter` strategy
		let
			markerElement: Element | null = targetElement,
			markerStrategy: BlockMarkerStrategy | undefined = strategy;

		// inspect the first child element chain for an 'append' or `insertAfter` action
		do {
			markerElement = markerElement.firstElementChild;
			markerStrategy = MARK_STRATEGIES.get(markerElement?.localName ?? '');
		} while (markerElement && markerStrategy === BlockMarkerStrategy.Descend);

		if (markerElement && markerStrategy !== BlockMarkerStrategy.Descend) {
			// An elment to attach the marker to has been found
			targetElement = markerElement;
			strategy = markerStrategy;
		}
		else {
			// no luck. Use  default strategy
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
	// attach the marker to the correct position
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
 * During post-processing all moustace type markers `{{placeholder}}` with
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