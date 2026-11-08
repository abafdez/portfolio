// content/skills.yaml, read and checked at build time.
// .server in the name: SvelteKit refuses to put this file in browser code, so only
// +page.server.ts files can import it. The icon libraries (thousands of icons) stay on
// the build machine, and a page gets only the icons it uses, as data.
// Text (names, descriptions, notes, evidence labels) can be in both languages (readText
// in locales.ts); the data is built once per language, and a page asks for its own.
import { icons } from 'lucide';
import * as simpleIcons from 'simple-icons';
import { parse } from 'yaml';
import text from '/content/skills.yaml?raw';
import { hueOf } from '#lib/hue.ts';
import { locales, readText, type Locale } from '#lib/i18n/locales.ts';
import { hueAndChroma } from './brand-color.ts';
import {
	levels,
	type Evidence,
	type Group,
	type IconData,
	type Level,
	type Logo,
	type Profile,
	type Skill
} from './skills.ts';

// The file as written: icons by name, a level as a plain number, text as plain text
// or { en, es } (unknown until readText has checked it).
interface SkillFile {
	name: unknown;
	logo?: string;
	icon?: string;
	level?: number;
	profiles?: string[];
	note?: unknown;
	// One of entry, tool, list or url (checked below), and a label.
	evidence?: (Record<string, unknown> & { label: unknown })[];
}

interface GroupFile {
	name: unknown;
	id: string;
	description: unknown;
	icon: string;
	skills: SkillFile[];
}

interface SkillsFile {
	profiles: { id: string; name: unknown }[];
	groups: GroupFile[];
}

export interface SkillData {
	profiles: Profile[];
	groups: Group[];
	// Every brand logo the skills use, once, in the order they first appear.
	logos: Logo[];
}

// A logo with its path, for the sprite (src/routes/logos.svg/+server.ts).
type LogoPath = Logo & { path: string };

// The data is ours, but a typo shouldn't ship: every mistake fails the build and says
// which skill it's in. A function declaration, not an arrow in a const: only then does
// TypeScript know the code after `if (!x) fail(…)` has an x.
function fail(where: string, message: string): never {
	throw new Error(`content/skills.yaml, ${where}: ${message}`);
}

const kebab = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// A generic icon has no brand color, so it gets a hue from its skill's name (hue.ts).
// The chroma is one moderate value for all of them.
const genericChroma = 0.13;

// Simple Icons exports one constant per logo (siSvelte…); look them up by slug.
const brands = new Map(Object.values(simpleIcons).map((icon) => [icon.slug, icon]));

// Lucide names are kebab-case on the website ('code-xml'), PascalCase in the package.
function lucide(where: string, name: string): IconData {
	const key = name.replace(/(^|-)(\w)/g, (_, __, letter: string) => letter.toUpperCase());
	const node = icons[key as keyof typeof icons];
	if (!node) fail(where, `no Lucide icon called "${name}" (https://lucide.dev/icons)`);
	return { node: node as [string, Record<string, string>][] };
}

// The skills in one language. The checks run for each language, which costs nothing
// at build time and keeps one function for all of it.
function load(locale: Locale): Omit<SkillData, 'logos'> & { logos: LogoPath[] } {
	const file = parse(text) as SkillsFile;
	// A text field in this language; English for the key and for error messages.
	const read = (value: unknown, where: string) => readText(value, `content/skills.yaml, ${where}`);
	const tr = (value: unknown, where: string) => read(value, where).text[locale];
	const en = (value: unknown, where: string) => read(value, where).text.en;
	const profileIds = new Set(file.profiles.map(({ id }) => id));
	const logos = new Map<string, LogoPath>();
	const names = new Set<string>();

	for (const { id } of file.profiles) {
		if (!kebab.test(id)) fail(`profile "${id}"`, 'ids are kebab-case (they go in URLs)');
	}

	function skill(group: string, entry: SkillFile): Skill {
		const key = en(entry.name, `a skill in ${group}`);
		const where = `"${key}" (${group})`;
		const { logo, icon, level, profiles = [], evidence } = entry;

		// Keyed by its English name (the CV stores edits by it), so two can't share one.
		if (names.has(key)) fail(where, 'two skills with this name');
		names.add(key);

		if (logo && icon) fail(where, 'a logo or an icon, not both');
		if (level !== undefined && !(levels as readonly number[]).includes(level))
			fail(where, `level ${level} isn't 1 to 4`);
		for (const id of profiles) {
			if (!profileIds.has(id)) fail(where, `"${id}" isn't one of the profiles at the top`);
		}
		for (const link of evidence ?? []) {
			const label = en(link.label, `${where} evidence`);
			const kinds = ['entry', 'tool', 'list', 'url'].filter((kind) => kind in link);
			if (kinds.length !== 1) fail(where, `"${label}" needs one of entry, tool, list or url`);
			if ('url' in link && !(typeof link.url === 'string' && link.url.startsWith('https://'))) {
				fail(where, `"${label}" needs an https:// url`);
			}
		}

		const result: Skill = {
			key,
			name: tr(entry.name, where),
			profiles,
			level: level as Level | undefined,
			note: entry.note === undefined ? undefined : tr(entry.note, `${where} note`),
			evidence: evidence?.map((link) => ({
				...link,
				label: tr(link.label, `${where} evidence`)
			})) as Evidence[] | undefined
		};
		if (icon) {
			Object.assign(result, {
				icon: lucide(where, icon),
				// From the key, so the colour is the same in every language.
				hue: hueOf(key),
				chroma: genericChroma
			});
		}
		if (logo) {
			const brand = brands.get(logo) ?? fail(where, `no Simple Icon "${logo}"`);
			const color = hueAndChroma(brand.hex);
			if (!logos.has(logo)) {
				logos.set(logo, { slug: logo, title: brand.title, path: brand.path, ...color });
			}
			Object.assign(result, { icon: { logo }, ...color });
		}
		return result;
	}

	const groups = file.groups.map((group) => {
		const key = en(group.name, `group "${group.id}"`);
		const where = `group "${key}"`;
		if (!kebab.test(group.id)) fail(where, 'ids are kebab-case');
		if (!group.description) fail(where, 'needs a description');
		return {
			key,
			name: tr(group.name, where),
			id: group.id,
			description: tr(group.description, `${where} description`),
			icon: lucide(where, group.icon),
			skills: group.skills.map((entry) => skill(key, entry))
		};
	});

	const profilesIn = file.profiles.map(({ id, name }) => ({
		id,
		name: tr(name, `profile "${id}"`)
	}));
	return { profiles: profilesIn, groups, logos: [...logos.values()] };
}

const byLocale = Object.fromEntries(locales.map((locale) => [locale, load(locale)])) as Record<
	Locale,
	ReturnType<typeof load>
>;

// For the pages, in their language: the logos without their paths (those are only in
// the sprite).
export function skillDataIn(locale: Locale): SkillData {
	const { logos, ...rest } = byLocale[locale];
	return { ...rest, logos: logos.map(({ path: _path, ...logo }) => logo) };
}
// For the sprite: the same logos in every language.
export const logoPaths: LogoPath[] = byLocale.en.logos;
