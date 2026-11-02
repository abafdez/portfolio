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

// A blog tag's page. Cards and headers take this as tagHref to link their tags.
// Bitácora tags have no pages, so the Bitácora doesn't pass it.
export const blogTag = (tag: string) => resolve('/blog/tags/[tag]', { tag });
