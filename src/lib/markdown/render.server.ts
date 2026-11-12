// A post's markdown as HTML, on the server: parse it (parse.ts), load the languages its
// code blocks use, then render <Markdown> to a string with svelte/server. The page shows
// the string with {@html}, so the browser gets the HTML and none of the code that made
// it (marked, svelte-markdown, Shiki, the renderers).
// The blog's and the Devlog's [slug] pages use it.
import { render } from 'svelte/server';
import { readEntry } from '#lib/content-files.ts';
import type { Locale } from '#lib/i18n/locales.ts';
import Markdown from './Markdown.svelte';
import { parse } from './parse.ts';
import { loadLanguages } from './shiki.ts';
import { mediaFor } from './media.server.ts';
import type { Media } from './media.ts';

// text: the whole file, frontmatter included. file: its path (/content/…/<slug>.md),
// for errors, ./files and its language. locale: the page's (links, the copy button).
// media: where ./files are found (tests pass their own).
export async function renderMarkdown(text: string, file: string, locale: Locale, media?: Media) {
	const { tokens, languages, files } = parse(String(readEntry(text).body ?? ''), file);
	// Everything the renderers need, loaded first: they render without waiting.
	const highlighter = await loadLanguages(languages);
	media ??= await mediaFor(file, files);
	const { body } = render(Markdown, {
		props: { tokens, file, locale, highlighter, media }
	});
	// Svelte marks where each block starts and ends (<!--[-->, <!--]-->) and each {@html}
	// (<!--1xwl4yi-->), so the browser could take the HTML over (hydrate it). Nothing
	// will: the markers go. (Comments written in the markdown never get here: parse.ts.)
	return body.replace(/<!--(?:\[[^\]]*?|\]|[a-z0-9]*)-->/g, '');
}
