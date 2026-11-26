// Code blocks are highlighted with twinkleplop at build time: the HTML ships with a class
// on every token (<span class="tok keyword">) and no highlighting JS. global.css colours
// those classes with our var(--code-…) tokens, so code follows the site theme like
// everything else.
// twinkleplop is synchronous: each language is a function from code to HTML, ready as
// soon as its module is imported. So there is nothing to load before rendering, unlike
// Shiki, whose languages load asynchronously.
import { language as bash } from '@twinkleplop/bash';
import { language as css } from '@twinkleplop/css';
import { language as diff } from '@twinkleplop/diff';
import { language as html } from '@twinkleplop/html';
import { language as http } from '@twinkleplop/http';
import { language as javascript } from '@twinkleplop/javascript';
import { language as json } from '@twinkleplop/json';
import { language as markdown } from '@twinkleplop/markdown';
import { language as svelte } from '@twinkleplop/svelte';
import { language as typescript } from '@twinkleplop/typescript';
import { language as yaml } from '@twinkleplop/yaml';

type Highlight = ReturnType<typeof typescript>;

// Every language our posts use, under the names written after the opening ```.
// Each package is a factory: calling it once makes the function that highlights.
const highlighters: Record<string, Highlight> = {};
for (const [make, names] of [
	[bash, ['sh', 'bash', 'shell']],
	[css, ['css']],
	[diff, ['diff']],
	[html, ['html']],
	[http, ['http']],
	[javascript, ['js', 'javascript']],
	[json, ['json']],
	[markdown, ['md', 'markdown']],
	[svelte, ['svelte']],
	[typescript, ['ts', 'typescript']],
	[yaml, ['yaml', 'yml']]
] as const) {
	const highlight = make();
	for (const name of names) highlighters[name] = highlight;
}

// The language a block is shown as: its own, or 'text' when there's none or we don't
// highlight it (```text is plain on purpose: an error message, a terminal).
export function languageOf(lang: string | null | undefined) {
	return lang && lang in highlighters ? lang : 'text';
}

const warned = new Set<string>();

// A block as HTML: <pre class="twinkleplop"><code><span class="l">…, one span per line.
export function highlight(code: string, lang: string | null | undefined) {
	const highlighter = highlighters[languageOf(lang)];
	if (highlighter) return highlighter(code);
	if (lang && lang !== 'text' && !warned.has(lang)) {
		warned.add(lang);
		console.warn(`No highlighter for "${lang}"; those blocks are shown as plain text.`);
	}
	// Plain text in the same shape, so it gets the same line numbers.
	const lines = code.split('\n').map((line) => `<span class="l">${escape(line)}</span>`);
	return `<pre class="twinkleplop"><code>${lines.join('\n')}</code></pre>`;
}

function escape(text: string) {
	return text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}
