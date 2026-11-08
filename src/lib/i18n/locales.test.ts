import { describe, expect, test } from 'vitest';
import { en } from './en.ts';
import { es } from './es.ts';
import { delocalize, fileLocale, localizePath, plural, readText, split } from './locales.ts';

// Tests run with the base path of the build that runs them ('' unless BASE_PATH is set),
// so the URLs are built from it too.
const base = import.meta.env.BASE_PATH;

describe('split', () => {
	test.each([
		['/', 'en', '/'],
		['/blog', 'en', '/blog'],
		['/blog/tags/css', 'en', '/blog/tags/css'],
		['/es', 'es', '/'],
		['/es/', 'es', '/'],
		['/es/blog', 'es', '/blog'],
		['/es/blog/tags/css', 'es', '/blog/tags/css'],
		// Only a whole segment is a language.
		['/espresso', 'en', '/espresso'],
		['/blog/es', 'en', '/blog/es']
	])('%s is %s, path %s', (path, locale, rest) => {
		expect(split(base + path)).toEqual({ locale, path: rest });
	});
});

test('delocalize keeps the base path and drops the language', () => {
	expect(delocalize(`${base}/es/blog`)).toBe(`${base}/blog`);
	expect(delocalize(`${base}/blog`)).toBe(`${base}/blog`);
});

test('localizePath puts the language after the base path', () => {
	expect(localizePath(`${base}/blog`, 'es')).toBe(`${base}/es/blog`);
	expect(localizePath(`${base}/`, 'es')).toBe(`${base}/es`);
	expect(localizePath(`${base}/blog`, 'en')).toBe(`${base}/blog`);
	// And back.
	expect(delocalize(localizePath(`${base}/blog/tags/css`, 'es'))).toBe(`${base}/blog/tags/css`);
});

// Intl.PluralRules picks the form: 'one' only for 1, in both languages (0 is plural).
describe('plural', () => {
	test.each([
		[0, ' posts', ' artículos'],
		[1, ' post', ' artículo'],
		[26, ' posts', ' artículos'],
		// Spanish has a 'many' form for millions ("1 millón de artículos"); without one,
		// the message falls back to 'other'.
		[1_000_000, ' posts', ' artículos']
	])('%i', (count, english, spanish) => {
		expect(en.tagPostCount({ count })).toBe(english);
		expect(es.tagPostCount({ count })).toBe(spanish);
	});

	test('falls back to other', () => {
		expect(plural('en', 1, { other: 'x' })).toBe('x');
	});
});

// TypeScript already checks es.ts has every message (satisfies), but not that a
// message gives text: an empty string, or a level missing from a lookup, would pass.
// Every message gets a value for any parameter it might have; the levels need their own.
const sample = { count: 2, total: 3, minutes: 4, name: 'CSS', by: 'Enkia', tag: 'css' };
const more = { phase: '9', file: 'cv.json', profile: 'Web', place: 1, group: 'Web', profiles: 1 };
const levels = { skillLevel: { level: 4 }, contrastLevel: { level: 'large' } };
test.each(Object.keys(en) as (keyof typeof en)[])('%s has text in both languages', (key) => {
	const args = { ...sample, ...more, ...levels[key as keyof typeof levels] };
	for (const messages of [en, es]) {
		const text = (messages[key] as (args: object) => string | undefined)(args);
		expect(text?.trim()).toBeTruthy();
	}
});

describe('readText', () => {
	test('plain text is the same in every language, and not a translation', () => {
		expect(readText('Docker', 'x')).toEqual({
			text: { en: 'Docker', es: 'Docker' },
			translated: false
		});
	});

	test('one text per language is a translation', () => {
		expect(readText({ en: 'Tools', es: 'Herramientas' }, 'x')).toEqual({
			text: { en: 'Tools', es: 'Herramientas' },
			translated: true
		});
	});

	test.each([
		['a missing language', { en: 'Tools' }],
		['an empty one', { en: 'Tools', es: ' ' }],
		['a language the site has not', { en: 'Tools', es: 'Herramientas', fr: 'Outils' }],
		['empty text', ''],
		['a number', 4],
		['nothing', undefined]
	])('fails on %s, saying where', (_, value) => {
		expect(() => readText(value, 'skills.yaml, "Tools"')).toThrow(
			'skills.yaml, "Tools": needs text, or one text for each language: { en: …, es: … }'
		);
	});
});

describe('fileLocale', () => {
	test.each([
		['/content/blog/x/x.md', 'en'],
		['/content/blog/x/x.es.md', 'es'],
		// Not a language the site has: it's the base language's file (and slugOf()
		// rejects its name).
		['/content/blog/x/x.fr.md', 'en']
	])('%s is %s', (path, locale) => {
		expect(fileLocale(path)).toBe(locale);
	});
});
