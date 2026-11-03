// content/skills.yaml, read and checked at build time.
// .server in the name: SvelteKit refuses to put this file in browser code, so only
// +page.server.ts files can import it. The icon libraries (thousands of icons) stay on
// the build machine, and a page gets only the icons it uses, as data.
import { icons } from 'lucide';
import * as simpleIcons from 'simple-icons';
import { parse } from 'yaml';
import text from '/content/skills.yaml?raw';
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

// The file as written: icons by name, a level as a plain number.
interface SkillFile {
	name: string;
	logo?: string;
	icon?: string;
	level?: number;
	profiles?: string[];
	note?: string;
	evidence?: Evidence[];
}

interface GroupFile {
	name: string;
	id: string;
	description: string;
	icon: string;
	skills: SkillFile[];
}

interface SkillsFile {
	profiles: Profile[];
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

// A generic icon has no brand color, so it gets a hue from its skill's name: a small
// hash, so the same name always gives the same hue, on every build, on the server and
// in the browser. The chroma is one moderate value for all of them.
function hueOf(name: string): number {
	let hash = 0;
	for (const char of name) hash = (hash * 31 + char.codePointAt(0)!) % 360;
	return hash;
}

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

function load(): Omit<SkillData, 'logos'> & { logos: LogoPath[] } {
	const file = parse(text) as SkillsFile;
	const profileIds = new Set(file.profiles.map(({ id }) => id));
	const logos = new Map<string, LogoPath>();
	const names = new Set<string>();

	for (const { id } of file.profiles) {
		if (!kebab.test(id)) fail(`profile "${id}"`, 'ids are kebab-case (they go in URLs)');
	}

	function skill(group: string, entry: SkillFile): Skill {
		const where = `"${entry.name}" (${group})`;
		const { logo, icon, level, profiles = [], evidence, ...rest } = entry;

		// Keyed by name on the page, so two skills can't share one.
		if (names.has(entry.name)) fail(where, 'two skills with this name');
		names.add(entry.name);

		if (logo && icon) fail(where, 'a logo or an icon, not both');
		if (level !== undefined && !(level in levels)) fail(where, `level ${level} isn't 1 to 4`);
		for (const id of profiles) {
			if (!profileIds.has(id)) fail(where, `"${id}" isn't one of the profiles at the top`);
		}
		for (const link of evidence ?? []) {
			const kinds = ['entry', 'tool', 'list', 'url'].filter((kind) => kind in link);
			if (kinds.length !== 1) fail(where, `"${link.label}" needs one of entry, tool, list or url`);
			if ('url' in link && !link.url.startsWith('https://')) {
				fail(where, `"${link.label}" needs an https:// url`);
			}
		}

		const result: Skill = { ...rest, profiles, evidence, level: level as Level | undefined };
		if (icon) {
			Object.assign(result, {
				icon: lucide(where, icon),
				hue: hueOf(entry.name),
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
		if (!kebab.test(group.id)) fail(`group "${group.name}"`, 'ids are kebab-case');
		if (!group.description) fail(`group "${group.name}"`, 'needs a description');
		return {
			name: group.name,
			id: group.id,
			description: group.description,
			icon: lucide(`group "${group.name}"`, group.icon),
			skills: group.skills.map((entry) => skill(group.name, entry))
		};
	});

	return { profiles: file.profiles, groups, logos: [...logos.values()] };
}

const { logos, ...rest } = load();

// For the pages: the logos without their paths (those are only in the sprite).
export const skillData: SkillData = {
	...rest,
	logos: logos.map(({ path: _path, ...logo }) => logo)
};
export const logoPaths: LogoPath[] = logos;
