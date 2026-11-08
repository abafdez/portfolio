// What components use: the current page's language, its messages, and links that stay
// in it. Shaped like Paraglide JS (m.blogTitle()), so moving to it later would mostly be
// changing imports. https://paraglidejs.com
import { page } from '$app/state';
import { resolve } from '$app/paths';
import type { ResolvedPathname } from '$app/types';
import { en, type Messages } from './en.ts';
import { es } from './es.ts';
import { baseLocale, languageTags, split, type Locale, type Translated } from './locales.ts';

export {
	baseLocale,
	locales,
	languageTags,
	ogLocales,
	type Locale,
	type Translated
} from './locales.ts';

export const messages: Record<Locale, Messages> = { en, es };

// The language of the page being shown, which the root layout reads from its URL.
// Not a variable we set somewhere: while prerendering, one process renders every page,
// English and Spanish, so a shared "current language" could leak from one page into
// the next. `page` belongs to the page being rendered (and on the client, it's the one
// on screen).
export const getLocale = (): Locale => page.data.locale ?? baseLocale;

// m.blogTitle() gives the text in the current page's language. Each function looks the
// language up when it's called, during rendering, not when this module loads. Outside
// a component (a load function), use messages[locale] instead.
export const m = Object.fromEntries(
	Object.keys(en).map((key) => [
		key,
		(...args: unknown[]) =>
			(messages[getLocale()][key as keyof Messages] as (...args: unknown[]) => string)(...args)
	])
) as Messages;

// How resolve() writes the base path on this page, without the last slash: '.' or '..'
// while prerendering (relative to the page, so it changes with its depth), '/portfolio'
// in the browser, '' in dev. resolve('/') is exactly that part.
const root = () => resolve('/').replace(/\/$/, '');

// A link that stays in a language: localize(resolve('/blog')) is './blog' on an English
// page and './es/blog' on a Spanish one: the language goes right after the base path.
// A link that doesn't start with it (#top, https://) is returned as it is.
export function localize<T extends string>(href: T, locale: Locale = getLocale()): T {
	if (locale === baseLocale) return href;
	const base = root();
	if (href !== base && !href.startsWith(`${base}/`)) return href;
	const rest = href.slice(base.length); // '/blog/x', or '/' for the home page
	return `${base}/${locale}${rest === '/' ? '' : rest}` as T;
}

// This page in another language, for the language switch. split() gives the path
// without the base path or the language ('/blog'); the base goes back in front.
export function translate(locale: Locale) {
	return localize(root() + split(page.url.pathname).path, locale);
}

// A link to a route, in the page's language: route('/blog/[slug]', { slug }) is
// resolve() then localize(), with resolve()'s types, so routes and params are still
// checked. Use it instead of resolve() for every link to a page (a test checks no
// other file imports resolve). Not for files: there's no /es/logos.svg.
export const route: typeof resolve = (...args) =>
	localize((resolve as (...args: unknown[]) => ResolvedPathname)(...args));

// Text that lives with its data rather than in the messages (a project's name): one
// string per language, and text() picks the page's.
export const text = (value: Translated, locale: Locale = getLocale()) => value[locale];

// Numbers the way the page's language writes them: 4.53 in English, 4,53 in Spanish.
export const formatNumber = (value: number, digits: number) =>
	new Intl.NumberFormat(languageTags[getLocale()], {
		minimumFractionDigits: digits,
		maximumFractionDigits: digits
	}).format(value);
