// Turns an icon chosen by name in content into drawable data (glyph.ts): a Lucide icon
// (`icon: sparkles`, https://lucide.dev/icons) or a Simple Icons logo (`logo: svelte`,
// https://simpleicons.org). A name that doesn't exist fails the build, naming the file.
// .server: SvelteKit keeps it out of browser code, with the thousands of icons it imports.
import { icons } from 'lucide';
import * as simpleIcons from 'simple-icons';
import type { Glyph } from './glyph.ts';

const brands = new Map(Object.values(simpleIcons).map((icon) => [icon.slug, icon]));

export function glyphFrom(where: string, choice: { icon?: unknown; logo?: unknown }) {
	const { icon, logo } = choice;
	if (icon !== undefined && logo !== undefined) {
		throw new Error(`${where}: an icon or a logo, not both`);
	}
	if (typeof icon === 'string') {
		// Kebab-case on the website ('code-xml'), PascalCase in the package.
		const key = icon.replace(/(^|-)(\w)/g, (_, __, letter: string) => letter.toUpperCase());
		const node = icons[key as keyof typeof icons];
		if (!node) throw new Error(`${where}: no Lucide icon called "${icon}" (lucide.dev/icons)`);
		return { node: node as [string, Record<string, string>][] } satisfies Glyph;
	}
	if (typeof logo === 'string') {
		const brand = brands.get(logo);
		if (!brand) throw new Error(`${where}: no Simple Icons logo "${logo}" (simpleicons.org)`);
		return { path: brand.path } satisfies Glyph;
	}
	if (icon !== undefined || logo !== undefined) {
		throw new Error(`${where}: icon and logo are names, like icon: sparkles or logo: svelte`);
	}
	return undefined;
}
