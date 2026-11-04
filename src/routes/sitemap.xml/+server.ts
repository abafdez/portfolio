import { resolve } from '$app/paths';
import { allLists } from '#lib/awesome/awesome.ts';
import { allLog, allPosts, postTags } from '#lib/content.ts';
import { sections } from '#lib/links.ts';
import { projects } from '#lib/projects/projects.ts';
import type { RequestHandler } from './$types';

// Every page search engines should know about, as a sitemap (sitemaps.org). Built from
// the same lists the pages are made from, so a new post or entry is in it without
// touching this file. /mascot is left out: it's noindex.
// Prerendered like /logos.svg (see there): build/sitemap.xml.
export const prerender = true;

// A page's path, and the day it last changed when we know it ('YYYY-MM-DD').
type Page = { path: string; updated?: string };

const pages: Page[] = [
	...sections.map(({ href }) => ({ path: resolve(href) })),
	// Every project is at /projects/<slug>, whether [tool] builds it or it has a route of
	// its own (/projects/cv).
	...projects.map(({ slug }) => ({ path: `${resolve('/projects')}/${slug}` })),
	...allLists.map(({ slug, updated }) => ({
		path: resolve('/awesome/[list]', { list: slug }),
		updated
	})),
	...allPosts.map(({ slug, date }) => ({ path: resolve('/blog/[slug]', { slug }), updated: date })),
	...postTags.map((tag) => ({ path: resolve('/blog/tags/[tag]', { tag }) })),
	...allLog.map(({ slug, date }) => ({
		path: resolve('/bitacora/[slug]', { slug }),
		updated: date
	}))
];

// url.origin is the site's public origin while prerendering (paths.origin in
// vite.config.ts). A sitemap needs absolute URLs.
export const GET: RequestHandler = ({ url }) => {
	const entries = pages.map(({ path, updated }) => {
		const lastmod = updated ? `<lastmod>${updated}</lastmod>` : '';
		return `<url><loc>${new URL(path, url.origin)}</loc>${lastmod}</url>`;
	});
	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.join('')}</urlset>`,
		{ headers: { 'content-type': 'application/xml' } }
	);
};
