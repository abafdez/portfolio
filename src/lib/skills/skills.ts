// What I know, for /about. The data is content/skills.yaml, read and checked at build
// time by skills.server.ts; this file has what the page needs in the browser too: the
// types, the level words and the evidence links.
import { route } from '#lib/i18n/index.ts';

// How well I know it, 1 to 4. The page shows it in words (m.skillLevel in the messages):
// "73% CSS" means nothing.
export const levels = [1, 2, 3, 4] as const;
export type Level = (typeof levels)[number];

// Where a skill shows on this site (or off it). One key per kind of page, so each
// href is built by resolve() with its own route, and TypeScript checks the params.
export type Evidence = { label: string } & (
	| { entry: string } // a Devlog entry: /devlog/<slug>
	| { tool: string } // a project: /projects/<tool>
	| { list: string } // an Awesome list: /awesome/<list>
	| { url: `https://${string}` }
);

// An icon as data, so a server load can send it to the page: a brand logo, drawn from
// the logos.svg sprite by its Simple Icons slug, or a generic Lucide icon, as the few
// SVG elements it's made of ([tag, attributes] pairs).
export type IconData = { logo: string } | { node: [string, Record<string, string>][] };

// A brand logo, for the marquee. hue and chroma are the brand color in OKLCH
// (brand-color.ts); the page takes the lightness from the theme. Its path isn't here:
// it's in the logos.svg sprite.
export interface Logo {
	slug: string;
	title: string;
	hue: number;
	chroma: number;
}

// A kind of job I apply for: web, support, mainframe… Skills list the ones they matter
// for, so a page can show only those.
export interface Profile {
	id: string;
	name: string;
}

export interface Skill {
	// Its English name: the same in every language, for whatever stores or colours it
	// (the CV's edits, the icon's hue). name is the one to show.
	key: string;
	name: string;
	icon?: IconData;
	// The icon's color in OKLCH: the brand's for a logo, one from the name for a
	// generic icon (skills.server.ts).
	hue?: number;
	chroma?: number;
	// No level for things a level doesn't fit (spoken languages say it in the note).
	level?: Level;
	profiles: string[];
	// How I use it, in one line.
	note?: string;
	evidence?: Evidence[];
}

export interface Group {
	// Its English name, the same in every language (the CV stores its order by it).
	key: string;
	name: string;
	// For the heading's id and the "on this page" nav.
	id: string;
	// One line under the heading, also shown when the window is collapsed.
	description: string;
	// Next to the heading. Always a generic one: a group isn't a brand.
	icon: IconData;
	skills: Skill[];
}

// Built when the page renders, not here: under a base path, resolve() gives a
// different (relative) href on each prerendered page.
export function evidenceHref(evidence: Evidence): string {
	if ('entry' in evidence) return route('/devlog/[slug]', { slug: evidence.entry });
	if ('tool' in evidence) return route('/projects/[tool]', { tool: evidence.tool });
	if ('list' in evidence) return route('/awesome/[list]', { list: evidence.list });
	return evidence.url;
}
