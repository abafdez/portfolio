// Code blocks are highlighted with Shiki at build time: the HTML ships with a colour on
// every token and no highlighting JS. Our theme's colours are var(--code-…), so code
// follows the site theme like everything else (see code-theme.ts).
// One highlighter for every file. It starts with no languages: each one is loaded the
// first time a code block uses it. Loading is async, but a Svelte component can't wait
// while it renders, so loadLanguages() runs first (render.server.ts) and highlight()
// is then synchronous.
import { bundledLanguages, createHighlighter, type BundledLanguage } from 'shiki';
import { codeTheme } from '#lib/code-theme.ts';

const highlighter = createHighlighter({ themes: [codeTheme], langs: [] });

export type Highlighter = Awaited<typeof highlighter>;

// The highlighter, with these languages ready. An unknown language is shown as plain
// text, with a warning (```text is plain on purpose: an error message, a terminal).
export async function loadLanguages(languages: Iterable<string>): Promise<Highlighter> {
	const ready = await highlighter;
	for (const language of languages) {
		if (language in bundledLanguages) await ready.loadLanguage(language as BundledLanguage);
		else if (language !== 'text') {
			console.warn(`Shiki has no language "${language}"; that block is shown as plain text.`);
		}
	}
	return ready;
}

// The language Shiki will use for a block: its own, or 'text'.
export function languageOf(highlighter: Highlighter, lang: string | null | undefined) {
	return lang && highlighter.getLoadedLanguages().includes(lang) ? lang : 'text';
}

// A block as HTML: <pre class="shiki tokens"><code><span class="line">…
export function highlight(highlighter: Highlighter, code: string, lang: string | null | undefined) {
	return highlighter.codeToHtml(code, {
		lang: languageOf(highlighter, lang),
		theme: 'tokens',
		// Long lines wrap (CodeBlock.svelte), so a block never scrolls and doesn't need
		// to be focusable.
		transformers: [{ pre: (node) => void delete node.properties.tabindex }]
	});
}
