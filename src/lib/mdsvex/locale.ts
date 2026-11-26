// The language links in a body are made for (Link.svelte): the page's, which isn't
// always the file's (an untranslated post shows its English file on the Spanish page).
// A context, not getLocale(): that reads SvelteKit's page state, which the CMS preview
// doesn't have. The [slug] pages give the page's language, the preview the file's.
import { getContext, setContext } from 'svelte';
import type { Locale } from '#lib/i18n/locales.ts';

const key = Symbol('markdown locale');

export const setMarkdownLocale = (locale: () => Locale) => setContext(key, locale);
export const markdownLocale = (): Locale => getContext<() => Locale>(key)?.() ?? 'en';
// The same context for mount() (the CMS preview mounts the body itself).
export const markdownLocaleContext = (locale: () => Locale) => [key, locale] as const;
