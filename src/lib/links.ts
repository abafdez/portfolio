import { resolve } from '$app/paths';
import type { RouteId } from '$app/types';

// The routes resolve() can build from the id alone: those without a [param].
// '/bitacora/[slug]' needs a slug too, so it's left out.
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
// a nested page belongs to.
export const sections: { href: RouteWithoutParams; label: string }[] = [
	{ href: '/', label: 'Home' },
	{ href: '/blog', label: 'Blog' },
	{ href: '/awesome', label: 'Awesome' },
	{ href: '/projects', label: 'Projects' },
	{ href: '/about', label: 'About' },
	{ href: '/bitacora', label: 'Bitacora' }
];

// Is this route a page inside the section, not the section itself? '/projects/cv' and
// '/blog/[slug]' are inside '/projects' and '/blog'. Home isn't a section anything is
// inside: every route starts with /. It compares route ids (page.route.id), not URLs:
// while prerendering, resolve() gives relative links ('../projects') that never match
// page.url.pathname. A route id has no base path and is the same on server and client.
// null is a page with no route (a 404).
export const isInside = (href: RouteWithoutParams, route: string | null) =>
	href !== '/' && !!route?.startsWith(`${href}/`);

// A blog tag's page. Cards and headers take this as tagHref to link their tags.
// Bitácora tags have no pages, so the Bitácora doesn't pass it.
export const blogTag = (tag: string) => resolve('/blog/tags/[tag]', { tag });
