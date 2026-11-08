import { resolve } from '$app/paths';
import { baseLocale, languageTags, locales, localizePath } from '#lib/i18n/locales.ts';
import { allLists } from '#lib/awesome/awesome.ts';
import { allLog, allPosts, isTranslated, postTags } from '#lib/content.ts';
import { sections } from '#lib/links.ts';
import { projects } from '#lib/projects/projects.ts';
import type { RequestHandler } from './$types';

// Every page search engines should know about, as a sitemap (sitemaps.org). Built from
// the same lists the pages are made from, so a new post or entry is in it without
// touching this file. /mascot is left out: it's noindex.
// Not route() for the links: that takes the language from the page being rendered, and
// this is an endpoint, not a page. `pages` is built when this module loads, outside any
// request, where resolve() writes absolute paths ('/portfolio/blog'), and localizePath()
// puts each language into them.
// Prerendered like /logos.svg (see there): build/sitemap.xml.
export const prerender = true;

// A page's English path, the day it last changed when we know it ('YYYY-MM-DD'), and
// whether it's in every language. The UI pages are; content is only once it's translated
// (until then its /es/ copy points at the English page, see Seo.svelte).
type Page = { path: string; updated?: string; translated: boolean };

const pages: Page[] = [
	...sections.map(({ href }) => ({ path: resolve(href), translated: true })),
	// Every project is at /projects/<slug>, whether [tool] builds it or it has a route of
	// its own (/projects/cv).
	...projects.map(({ slug }) => ({ path: `${resolve('/projects')}/${slug}`, translated: true })),
	...allLists.map(({ slug, updated, translated }) => ({
		path: resolve('/awesome/[list]', { list: slug }),
		updated,
		translated
	})),
	...allPosts.map((post) => ({
		path: resolve('/blog/[slug]', { slug: post.slug }),
		updated: post.date,
		translated: isTranslated(post)
	})),
	...postTags.map((tag) => ({ path: resolve('/blog/tags/[tag]', { tag }), translated: true })),
	...allLog.map((entry) => ({
		path: resolve('/bitacora/[slug]', { slug: entry.slug }),
		updated: entry.date,
		translated: isTranslated(entry)
	}))
];

// url.origin is the site's public origin while prerendering (paths.origin in
// vite.config.ts). A sitemap needs absolute URLs.
// A translated page is one <url> per language, and each lists every version of itself
// (itself included) as an xhtml:link, the sitemap's way of saying hreflang.
// https://developers.google.com/search/docs/specialty/international/localized-versions#sitemap
export const GET: RequestHandler = ({ url }) => {
	const entries = pages.flatMap(({ path, updated, translated }) => {
		const lastmod = updated ? `<lastmod>${updated}</lastmod>` : '';
		const at = (locale: (typeof locales)[number]) =>
			new URL(localizePath(path, locale), url.origin);
		if (!translated) return [`<url><loc>${at(baseLocale)}</loc>${lastmod}</url>`];
		const alternates = [
			...locales.map(
				(locale) =>
					`<xhtml:link rel="alternate" hreflang="${languageTags[locale]}" href="${at(locale)}"/>`
			),
			`<xhtml:link rel="alternate" hreflang="x-default" href="${at(baseLocale)}"/>`
		].join('');
		return locales.map((locale) => `<url><loc>${at(locale)}</loc>${lastmod}${alternates}</url>`);
	});
	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${entries.join('')}</urlset>`,
		{ headers: { 'content-type': 'application/xml' } }
	);
};
