// Markdown → HTML in the browser, for the CMS's preview: the same steps as the site's
// build (vite.config.ts), with the same plugins, so the preview shows callouts, our blocks
// (```yt, ```video), highlighted code, heading links and captions as the page will.
// It runs anywhere the CMS runs, dev or hosted: no server, no files.
// What it can't do like the build: enhanced-img (pictures are shown as they are) and
// mdsvex's own parsing (an older markdown parser, and curly quotes).
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeStringify from 'rehype-stringify';
import { bundledLanguages, createHighlighter, type BundledLanguage } from 'shiki';
import { renderBlock } from '#lib/blocks.ts';
import { rehypeCallouts } from '#lib/callouts.ts';
import { rehypeTables } from '#lib/tables.ts';
import { codeTheme } from '#lib/code-theme.ts';

// The HTML tree (hast), as far as this file needs it.
type Element = {
	type: 'element';
	tagName: string;
	properties: Record<string, unknown>;
	children: Node[];
	value?: undefined;
};
type Node = { type: string; value?: string; children?: Node[] } | Element;
const isElement = (node: Node, tag?: string): node is Element =>
	node.type === 'element' && (!tag || (node as Element).tagName === tag);

// Shiki, created once, languages loaded the first time a block uses them (like the build).
const shiki = createHighlighter({ themes: [codeTheme], langs: [] });

const text = (node: Node): string => node.value ?? (node.children ?? []).map(text).join('');

// <pre><code class="language-x">: our block if x is one (blocks.ts), else Shiki's HTML in
// the frame CodeBlock.svelte draws (a bar with the language, then the code).
async function codeBlock(pre: Element, file: string): Promise<Node> {
	const code = pre.children.find((child) => isElement(child, 'code')) as Element | undefined;
	const classes = (code?.properties.className as string[] | undefined) ?? [];
	const lang = classes.find((name) => name.startsWith('language-'))?.slice(9);
	const source = text(code ?? pre).replace(/\n$/, '');

	const block = renderBlock(lang, source, file);
	if (block !== undefined) return { type: 'raw', value: block };

	const highlighter = await shiki;
	let language = 'text';
	if (lang && lang in bundledLanguages) {
		await highlighter.loadLanguage(lang as BundledLanguage);
		language = lang;
	}
	const html = highlighter.codeToHtml(source, { lang: language, theme: 'tokens' });
	return {
		type: 'raw',
		value: `<figure class="code-block"><figcaption><span>${language}</span></figcaption>${html}</figure>`
	};
}

// Replaces every code block, in place (async, so not inside a synchronous plugin).
async function highlightAll(node: Node, file: string) {
	const children = node.children ?? [];
	for (let i = 0; i < children.length; i++) {
		const child = children[i];
		if (isElement(child, 'pre')) children[i] = await codeBlock(child, file);
		else await highlightAll(child, file);
	}
}

// ![alt](./x.png "Caption") → <figure> with a <figcaption>, as enhance-media.ts does;
// and every ./file (img src, video src and poster, source src) through `resolve`, which
// gives a URL the preview can show (Sveltia's getAsset()).
function media(node: Node, resolve: (path: string) => string) {
	const children = node.children ?? [];
	for (let i = 0; i < children.length; i++) {
		const child = children[i];
		if (!isElement(child)) continue;
		for (const name of ['src', 'poster']) {
			const value = child.properties[name];
			if (typeof value === 'string' && value.startsWith('./')) {
				child.properties[name] = resolve(value);
			}
		}
		media(child, resolve);
		// A paragraph holding only a captioned picture becomes a figure.
		const only = child.children.filter((c) => !(c.type === 'text' && !c.value?.trim()));
		if (isElement(child, 'p') && only.length === 1 && isElement(only[0], 'img')) {
			const img = only[0];
			const caption = img.properties.title;
			if (typeof caption === 'string' && caption) {
				delete img.properties.title;
				children[i] = {
					type: 'element',
					tagName: 'figure',
					properties: {},
					children: [
						img,
						{
							type: 'element',
							tagName: 'figcaption',
							properties: {},
							children: [{ type: 'text', value: caption }]
						}
					]
				};
			}
		}
	}
}

const toTree = unified().use(remarkParse).use(remarkGfm).use(remarkRehype, {
	allowDangerousHtml: true // HTML in the markdown (<video>, <details>) goes through, as in mdsvex
});
const plugins = unified()
	.use(rehypeRaw)
	.use(rehypeCallouts as never)
	.use(rehypeTables as never)
	.use(rehypeSlug)
	.use(rehypeAutolinkHeadings, { behavior: 'wrap' });
const toHtml = unified().use(rehypeStringify, { allowDangerousHtml: true });

// `file` is the entry's file name: it decides the language of callout titles and of the
// blocks' text (<slug>.es.md is Spanish), as in the build. Throws what the build would
// throw (an unknown callout type, a block with a wrong field).
export async function renderMarkdown(
	markdown: string,
	file: string,
	resolve: (path: string) => string = (path) => path
): Promise<string> {
	const vfile = { filename: file, path: file, value: markdown, data: {} };
	const mdast = toTree.parse(markdown);
	const tree = (await toTree.run(mdast)) as unknown as Node;
	await highlightAll(tree, file);
	const done = (await plugins.run(tree as never, vfile as never)) as unknown as Node;
	media(done, resolve);
	return toHtml.stringify(done as never) as string;
}
