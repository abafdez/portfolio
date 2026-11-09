// Wide tables scroll in their own box instead of stretching the page. A markdown table
// can't get narrower than its longest word or bit of code (`refs/pull/<number>/merge`),
// and on a phone that's wider than the column: the whole page scrolled sideways.
// This rehype plugin (vite.config.ts, rehypePlugins) wraps every table in
//   <div class="table-scroll" role="region" aria-label="Table" tabindex="0">
// The box scrolls (overflow-x in .prose, global.css); tabindex lets a keyboard reach and
// scroll it, and the region's name says what it is. Wrapping it, rather than giving the
// table display: block, keeps the table a table for screen readers.
import { fileLocale } from '#lib/i18n/locales.ts';

type Element = {
	type: 'element';
	tagName: string;
	properties: Record<string, unknown>;
	children: Node[];
};
type Node = Element | { type: string };
type Parent = { children: Node[] };

// In the file's language: <slug>.es.md is Spanish.
const labels = { en: 'Table', es: 'Tabla' };

export function rehypeTables() {
	return (tree: Parent, file: { filename?: string }) =>
		wrap(tree, labels[fileLocale(file.filename ?? '')]);
}

function wrap(parent: Parent, label: string) {
	parent.children = parent.children.map((node) => {
		if (node.type !== 'element') return node;
		const element = node as Element;
		if (element.tagName !== 'table') {
			wrap(element, label);
			return element;
		}
		return {
			type: 'element',
			tagName: 'div',
			properties: { className: ['table-scroll'], role: 'region', ariaLabel: label, tabIndex: 0 },
			children: [element]
		} satisfies Element;
	});
}
