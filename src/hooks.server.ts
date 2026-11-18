// Runs for every page SvelteKit renders (here: at build time, when it prerenders).
// https://svelte.dev/docs/kit/hooks#Server-hooks-handle
import type { Handle } from '@sveltejs/kit/hooks';
import { languageTags, sitePath, split } from '#lib/i18n/locales.ts';

// Fonts are found late: the browser reads the HTML, then the CSS, and only then sees
// the @font-face it needs. Until the file arrives, text shows in a fallback font, and
// when it swaps the lines re-wrap and the page jumps (layout shift, CLS in Lighthouse).
// A <link rel="preload"> in the <head> starts the download with the HTML instead.
// Only the Latin files: Fontsource splits each font by alphabet (unicode-range), and
// the browser only downloads the others if a page uses those characters. Preloading
// them all would download every alphabet on every page.
const latin = /-latin-wght-normal\.woff2$/;

// build/404.html, what GitHub Pages sends for any address that isn't a page, is the
// adapter's fallback: an empty page that starts the app, which then shows +error.svelte.
// Without JavaScript it would stay blank, so it gets this. Both languages: the fallback
// is one file for every address, and only the app can read the language from it.
const noscript = `<noscript><main class="sheet" style="margin: 2rem">
<h1>Page not found · Página no encontrada</h1>
<p><a href="${sitePath('/', 'en')}">Home</a> · <a href="${sitePath('/', 'es')}">Inicio</a></p>
</main></noscript>`;

export const handle: Handle = ({ event, resolve }) =>
	resolve(event, {
		// <html lang="%lang%"> in app.html: the page's language, so screen readers
		// pronounce it right and browsers offer to translate only what isn't in yours.
		// app.html is outside the components, so the HTML is edited as it's sent.
		// The fallback (SvelteKit renders it at /[fallback]) also gets the noscript.
		transformPageChunk: ({ html }) => {
			html = html.replace('%lang%', languageTags[split(event.url.pathname).locale]);
			return event.url.pathname.endsWith('/[fallback]')
				? html.replace('</body>', `${noscript}</body>`)
				: html;
		},
		// The default preloads js and css; keep that, and add the Latin fonts.
		preload: (file) =>
			file.type === 'js' ||
			file.type === 'css' ||
			(file.type === 'font' && latin.test(file.filename))
	});
