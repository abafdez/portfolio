// Parse plugins: our rules for the markdown, taught to mdsvex 1.0 (design/mdsvex-spike.md).
// A parse plugin is an object keyed by node type; a handler can return a function that
// runs once the node has closed, when everything inside is known.
import type { NodeView, ParsePlugin } from 'mdsvex';
import { calloutTypes, marker } from '#lib/callouts.ts';

type Context = { readonly filename: string | undefined };

// The file goes on tables: their label follows the file's language (mdsvex passes attrs
// on as props). A code block's button follows the page's (Pre.svelte).
const withFile = (node: NodeView, ctx: Context) => () => void (node.attrs.file = ctx.filename);

// > [!tip] Optional title     ->  a blockquote with kind="tip" title="Optional title"
// > The text.                       file=…, drawn as a callout by markdown/Blockquote.svelte
// The [!type] line is taken out of the first paragraph: every node up to the first line
// break (or the whole paragraph, when the marker line is all there is).
function callout(node: NodeView, ctx: Context) {
	return () => {
		const first = node.first_child;
		if (first?.type !== 'paragraph') return;
		const line: NodeView[] = [];
		for (let child = first.first_child; child && child.type !== 'soft_break'; child = child.next)
			line.push(child);
		const text = line.map((child) => child.text_content ?? '').join('');
		const match = marker.exec(text);
		if (!match) return;
		const kind = match[1].toLowerCase();
		if (!Object.hasOwn(calloutTypes, kind)) {
			throw new Error(`${ctx.filename}: [!${match[1]}] isn't a callout type.`);
		}
		const title = text.slice(match[0].length).trim();
		const lineBreak = line.at(-1)?.next;
		if (lineBreak) [...line, lineBreak].forEach((child) => child.remove());
		else first.remove();
		// attrs can't be replaced, only changed key by key. They reach the blockquote's
		// replacement as props.
		Object.assign(node.attrs, { kind, title, file: ctx.filename });
	};
}

// ![Alt](./x.png "Caption") alone in its paragraph  ->  <figure><img><figcaption>
function figure(node: NodeView) {
	return () => {
		const image = node.first_child;
		const caption = image?.attrs.title;
		if (image?.type !== 'image' || image.next || typeof caption !== 'string') return;
		delete image.attrs.title;
		node.type = 'html';
		node.attrs.tag = 'figure';
		node.append('html', { tag: 'figcaption' }).append('text', caption);
	};
}

// An image is a file next to the post, with alt text: anything else fails the build.
// (A missing file fails too: mdsvex imports it.)
function checkImage(node: NodeView, ctx: Context) {
	return () => {
		const src = String(node.attrs.src ?? '');
		if (!src.startsWith('./'))
			throw new Error(`${ctx.filename}: ${src} should be a file next to the post (./…)`);
		if (!node.text_content.trim())
			throw new Error(`${ctx.filename}: ${src} needs alt text: ![What it shows](${src})`);
	};
}

// HTML written in the text fails the build: it goes in backticks (our rule).
function noHtml(node: NodeView, ctx: Context) {
	return () => {
		throw new Error(`${ctx.filename}: <${node.attrs.tag}> is in the text. Put it in backticks.`);
	};
}

// So does Svelte: in mdsvex, {…} in the text is an expression that runs, and {#if} a
// block. Our posts are text (braces go in backticks), and the CMS preview runs what it
// compiles, so nothing in a post may run.
function noSvelte(_node: NodeView, ctx: Context) {
	return () => {
		throw new Error(`${ctx.filename}: a { } in the text is Svelte code. Put it in backticks.`);
	};
}

export const parsePlugins: ParsePlugin[] = [
	{
		block_quote: { parse: callout },
		paragraph: { parse: figure },
		image: { parse: checkImage },
		table: { parse: withFile },
		html: { parse: noHtml },
		mustache: { parse: noSvelte },
		svelte_block: { parse: noSvelte }
	}
];
