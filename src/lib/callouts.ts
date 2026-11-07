// Callouts: a blockquote that starts with [!type] becomes a box with an icon and a
// title. GitHub draws the same syntax (it calls them "alerts") and so does Obsidian
// ("callouts"); anywhere else it's still a readable blockquote.
//
//   > [!tip]                     > [!warning] Not on GitHub Pages
//   > Text of the tip.           > Custom title, then the text.
//
// A rehype plugin: it works on the HTML tree, after mdsvex has turned the markdown into
// HTML and before that becomes Svelte code (vite.config.ts). Why not a remark plugin,
// on the markdown tree: mdsvex 0.12 bundles an old markdown parser (remark-parse 8),
// so the modern callout plugins don't run on it. The HTML tree is the same in every
// version. Its own file so it can be unit-tested (callouts.test.ts).
import { icons, type IconNode } from 'lucide';

// The HTML tree (hast) as far as this file needs it. The real types are in the 'hast'
// package, which isn't one of our dependencies.
type Text = { type: 'text'; value: string };
type Element = {
	type: 'element';
	tagName: string;
	properties: Record<string, unknown>;
	children: Node[];
};
type Node = Text | Element | { type: string };
type Parent = { children: Node[] };

// GitHub's five types. The title is the type as text, so it isn't told by colour
// alone; the icon is a second hint for the eye. Obsidian has more types, but GitHub
// would show those as plain blockquotes, so they fail the build instead (see below).
export const calloutTypes = {
	note: { title: 'Note', icon: icons.Info },
	tip: { title: 'Tip', icon: icons.Lightbulb },
	important: { title: 'Important', icon: icons.MessageSquareWarning },
	warning: { title: 'Warning', icon: icons.TriangleAlert },
	caution: { title: 'Caution', icon: icons.OctagonAlert }
} as const;
type CalloutType = keyof typeof calloutTypes;

// [!type] at the very start of the first paragraph. The + or - after it is Obsidian's
// folding (open or closed); we don't fold yet, so it's accepted and shown open.
const marker = /^\[!(\w+)\][+-]?[ \t]*/;

export function rehypeCallouts() {
	// A rehype plugin returns the function that changes the tree. `file` is the .md
	// being compiled (mdsvex keeps its name in `filename`), so an error can name it.
	return (tree: Parent, file: { filename?: string }) =>
		walk(tree, file.filename ?? 'a markdown file');
}

function walk(parent: Parent, path: string) {
	parent.children = parent.children.map((node) => {
		if (!isElement(node)) return node;
		const replaced = node.tagName === 'blockquote' ? (callout(node, path) ?? node) : node;
		walk(replaced, path); // a callout can hold another one
		return replaced;
	});
}

function callout(quote: Element, path: string): Element | undefined {
	const first = quote.children.find((node) => isElement(node) || !isBlank(node));
	if (!first || !isElement(first) || first.tagName !== 'p') return;

	// mdsvex's parser reads [!note] as a link to a reference that doesn't exist, and puts
	// it back as text, in its own text node. Join the text at the start into one.
	const inline = first.children;
	while (isText(inline[0]) && isText(inline[1])) {
		inline[0].value += inline[1].value;
		inline.splice(1, 1);
	}
	const start = inline[0];
	const match = isText(start) ? marker.exec(start.value) : null;
	if (!isText(start) || !match) return;

	const name = match[1].toLowerCase();
	if (!(name in calloutTypes)) {
		throw new Error(
			`${path}: [!${match[1]}] isn't a callout type. Use one of: ${Object.keys(calloutTypes).join(', ')}`
		);
	}
	const type = name as CalloutType;
	start.value = start.value.slice(match[0].length);

	// The rest of the first line is the custom title (it can have **bold** or `code` in
	// it); the lines after it are the text.
	const title: Node[] = [];
	while (inline.length) {
		const node = inline[0];
		const newline = isText(node) ? node.value.indexOf('\n') : -1;
		if (isText(node) && newline !== -1) {
			title.push(text(node.value.slice(0, newline)));
			node.value = node.value.slice(newline + 1);
			break;
		}
		title.push(inline.shift()!);
	}
	const body = quote.children.filter((node) => node !== first || inline.some((n) => !isBlank(n)));

	const { title: typeName, icon } = calloutTypes[type];
	const custom = title.some((node) => !isBlank(node));
	return element('aside', { className: ['callout'], dataCallout: type }, [
		// The text in one <span>: the title is a flex row (icon, text), and every node of
		// "Use `pnpm`" would be a flex item of its own, with a gap between them.
		element('p', { className: ['callout-title'] }, [
			svg(icon),
			element(
				'span',
				{},
				// With its own title, the type is still read out first: "Warning: Not on…".
				custom
					? [element('span', { className: ['visually-hidden'] }, [text(`${typeName}: `)]), ...title]
					: [text(typeName)]
			)
		]),
		...body
	]);
}

// A Lucide icon as an inline <svg>: it's in the HTML at build time, with no JS, and
// stroke="currentColor" draws it in the title's colour. Hidden from screen readers,
// which read the title instead.
function svg(icon: IconNode): Element {
	return element(
		'svg',
		{
			xmlns: 'http://www.w3.org/2000/svg',
			viewBox: '0 0 24 24',
			fill: 'none',
			stroke: 'currentColor',
			'stroke-width': '2',
			'stroke-linecap': 'round',
			'stroke-linejoin': 'round',
			'aria-hidden': 'true'
		},
		icon.map(([tagName, attributes]) => element(tagName, { ...attributes }, []))
	);
}

function element(tagName: string, properties: Element['properties'], children: Node[]): Element {
	return { type: 'element', tagName, properties, children };
}

function text(value: string): Text {
	return { type: 'text', value };
}

function isElement(node: Node | undefined): node is Element {
	return node?.type === 'element';
}

function isText(node: Node | undefined): node is Text {
	return node?.type === 'text';
}

function isBlank(node: Node): boolean {
	return isText(node) && !node.value.trim();
}
