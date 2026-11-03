import { logoPaths } from '#lib/skills/skills.server.ts';

// Every brand logo the skills use, as one SVG sprite file: a path per logo, with the
// logo's slug as its id. Pages draw a logo with <use href="…/logos.svg#svelte">, so no
// path is written into their HTML, and the browser downloads (and caches) them once.
// Prerendered like the pages: at build time this becomes build/logos.svg. It says so
// itself because the root layout's prerender only reaches pages, not endpoints, and
// it's listed in prerender.entries (vite.config.ts): the crawler follows links, and a
// <use href> isn't one.
export const prerender = true;

const paths = logoPaths.map(({ slug, path }) => `<path id="${slug}" d="${path}"/>`).join('');

export const GET = () =>
	new Response(`<svg xmlns="http://www.w3.org/2000/svg"><defs>${paths}</defs></svg>`, {
		headers: { 'content-type': 'image/svg+xml' }
	});
