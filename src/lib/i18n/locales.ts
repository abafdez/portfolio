// The site's languages, and which one a URL is in. Plain TypeScript with no SvelteKit
// imports, so the reroute hook, the server hooks and the tests can all use it.

// English is the default, at the root (/portfolio/blog). Every other language has its
// own prefix (/portfolio/es/blog).
export const locales = ['en', 'es'] as const;
export type Locale = (typeof locales)[number];
export const baseLocale: Locale = 'en';

// What <html lang> and hreflang say: the language, and for Spanish the country, since
// the site is written in Spain's Spanish (tú, ordenador). https://www.rfc-editor.org/info/bcp47
export const languageTags = { en: 'en', es: 'es-ES' } as const satisfies Record<Locale, string>;

// The same for link previews (og:locale), which want language_COUNTRY. The UI's English
// is American (color, not colour).
export const ogLocales = { en: 'en_US', es: 'es_ES' } as const satisfies Record<Locale, string>;

// The base path ('/portfolio', or '' in dev). `?.`: vite.config.ts imports the callout
// plugin, which imports this file for fileLocale(), and while Vite loads its config
// there's no import.meta.env yet (the config is what defines BASE_PATH). Nothing that
// runs then needs the base.
const base = import.meta.env?.BASE_PATH ?? '';

// Text in every language: { en: 'Contrast checker', es: 'Comprobador de contraste' }.
export type Translated = Record<Locale, string>;

// A text field in the YAML content (skills, Awesome lists): plain text is the same in
// every language (Docker is Docker), or it's one text per language, { en: …, es: … },
// with every language there. Anything else fails the build, saying where.
// `translated` says which one it was: a list counts as translated once its text is.
export function readText(value: unknown, where: string): { text: Translated; translated: boolean } {
	if (typeof value === 'string' && value.trim()) {
		const text = Object.fromEntries(locales.map((locale) => [locale, value])) as Translated;
		return { text, translated: false };
	}
	if (value && typeof value === 'object') {
		const entries = Object.entries(value);
		const complete = locales.every((locale) => {
			const text = (value as Record<string, unknown>)[locale];
			return typeof text === 'string' && text.trim();
		});
		if (complete && entries.length === locales.length) {
			return { text: value as Translated, translated: true };
		}
	}
	throw new Error(
		`${where}: needs text, or one text for each language: { ${locales.map((l) => `${l}: …`).join(', ')} }`
	);
}

// A content file's language, from its name: <slug>.md is English (the base language),
// <slug>.es.md Spanish.
export function fileLocale(path: string): Locale {
	const suffix = /\.([a-z]{2})\.md$/.exec(path)?.[1];
	return locales.find((locale) => locale !== baseLocale && locale === suffix) ?? baseLocale;
}

// Splits a URL's pathname into its language and the path without the language prefix:
// '/portfolio/es/blog' -> { locale: 'es', path: '/blog' }, '/portfolio/blog' ->
// { locale: 'en', path: '/blog' }. The path has no base path either, so resolve() can
// take it. Only a whole segment counts: '/portfolio/espresso' is English.
export function split(pathname: string): { locale: Locale; path: string } {
	const path = pathname.slice(base.length) || '/';
	for (const locale of locales) {
		if (locale === baseLocale) continue;
		if (path === `/${locale}` || path.startsWith(`/${locale}/`)) {
			return { locale, path: path.slice(locale.length + 1) || '/' };
		}
	}
	return { locale: baseLocale, path };
}

// A load function's language, from its url: load functions don't render a page, so
// getLocale() (index.ts) isn't for them.
export const localeOf = (url: URL) => split(url.pathname).locale;

// The pathname a route is found by: the same URL without the language. Used by the
// reroute hook.
export const delocalize = (pathname: string) => base + split(pathname).path;

// The other way: an absolute pathname ('/portfolio/blog') in a language
// ('/portfolio/es/blog'). For code that isn't rendering a page (the sitemap), where
// localize() in index.ts can't be used: it follows how resolve() writes the base for the
// page being rendered.
export function localizePath(pathname: string, locale: Locale) {
	if (locale === baseLocale) return pathname;
	const path = pathname.slice(base.length);
	return `${base}/${locale}${path === '/' ? '' : path}`;
}

// A path on this site in a language, with the base path: sitePath('/blog', 'es') is
// '/portfolio/es/blog'. For code that renders outside a page (render.server.ts), where
// route() can't read the page's language.
export const sitePath = (path: string, locale: Locale) => localizePath(`${base}${path}`, locale);

// Plurals: "1 post", "26 posts". Languages have different rules (some have forms for
// two, or for few); Intl.PluralRules knows them and answers with a category, and each
// message gives the text for the categories its language uses. 'other' is always there.
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/PluralRules
type PluralForms = Partial<Record<Intl.LDMLPluralRule, string>> & { other: string };
const pluralRules = {
	en: new Intl.PluralRules(languageTags.en),
	es: new Intl.PluralRules(languageTags.es)
};
export const plural = (locale: Locale, count: number, forms: PluralForms) =>
	forms[pluralRules[locale].select(count)] ?? forms.other;
