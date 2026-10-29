import type { RouteId } from '$app/types';

// A link is either a route on this site (checked by the type system and passed
// through resolve()) or an external https URL. Never both.
export type Link = { label: string; route: RouteId } | { label: string; url: `https://${string}` };
