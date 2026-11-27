// What a compiled body's components get from the page around them, as contexts. Not
// SvelteKit's page state: the CMS preview mounts bodies without SvelteKit. The [slug]
// pages set them; the preview passes the same keys to mount() (markdownContext).
// - locale: the language links are made for (Link.svelte), the page's, which isn't
//   always the file's (an untranslated post shows its English file on the Spanish page).
// - media: the files next to the post (media.ts on the site, Sveltia's in the CMS).
import { getContext, setContext } from 'svelte';
import type { Locale } from '#lib/i18n/locales.ts';
import type { Media } from '#lib/markdown/media.ts';

const localeKey = Symbol('markdown locale');
const mediaKey = Symbol('markdown media');

export const setMarkdownLocale = (locale: () => Locale) => setContext(localeKey, locale);
export const markdownLocale = (): Locale => getContext<() => Locale>(localeKey)?.() ?? 'en';

export const setMarkdownMedia = (media: () => Media) => setContext(mediaKey, media);
// A getter: call it when the component starts, read it in the template (the page's media
// change when it shows another post).
export function markdownMedia(): () => Media {
	const media = getContext<(() => Media) | undefined>(mediaKey);
	if (!media) throw new Error('A block with files needs the page to set the markdown media');
	return media;
}

// Both, for mount().
export const markdownContext = (locale: () => Locale, media: () => Media) =>
	new Map<symbol, unknown>([
		[localeKey, locale],
		[mediaKey, media]
	]);
