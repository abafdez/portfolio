import type { RouteId } from '$app/types';
import { m, route } from '#lib/i18n/index.ts';

// The routes resolve() can build from the id alone: those without a [param].
// '/devlog/[slug]' needs a slug too, so it's left out.
export type RouteWithoutParams = Exclude<RouteId, `${string}[${string}`>;

// A link is either a route on this site (checked by the type system and passed
// through resolve()) or an external https URL. Never both.
export type Link =
	{ label: string; route: RouteWithoutParams } | { label: string; url: `https://${string}` };

// Shared by the hero and the footer, so a profile URL only lives in one place.
// `satisfies` checks each entry is a valid Link but keeps the exact type, so code
// using profiles knows every entry has a url (with `: Link[]` it could be a route).
export const profiles = [
	{ label: 'GitHub', url: 'https://github.com/abafdez' },
	{ label: 'LinkedIn', url: 'https://www.linkedin.com/in/alfonso-baeza-fdez/' }
] as const satisfies readonly Link[];

// The site's sections, in nav order. The nav links them; the breadcrumbs name the one
// a nested page belongs to. label is a message (a function), so it's in the language of
// the page that calls it, not of whichever page loaded this module first.
export const sections: { href: RouteWithoutParams; label: () => string }[] = [
	{ href: '/', label: m.navHome },
	{ href: '/blog', label: m.navBlog },
	{ href: '/awesome', label: m.navAwesome },
	{ href: '/projects', label: m.navProjects },
	{ href: '/about', label: m.navAbout },
	{ href: '/devlog', label: m.navDevlog }
];

// Is this route a page inside the section, not the section itself? '/projects/cv' and
// '/blog/[slug]' are inside '/projects' and '/blog'. Home isn't a section anything is
// inside: every route starts with /. It compares route ids (page.route.id), not URLs:
// while prerendering, resolve() gives relative links ('../projects') that never match
// page.url.pathname. A route id has no base path and is the same on server and client.
// null is a page with no route (a 404).
export const isInside = (href: RouteWithoutParams, routeId: string | null) =>
	href !== '/' && !!routeId?.startsWith(`${href}/`);

// A blog tag's page. Cards and headers take this as tagHref to link their tags.
// Devlog tags have no pages, so the Devlog doesn't pass it. In the page's language.
export const blogTag = (tag: string) => route('/blog/tags/[tag]', { tag });
