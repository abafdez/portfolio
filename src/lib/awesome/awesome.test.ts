import { describe, expect, test } from 'vitest';
import { listIn, readList } from './awesome.ts';

// A list as the YAML gives it, with one link. Text fields are plain or { en, es }.
const list = (description: unknown, linkDescription: unknown) => ({
	title: 'Modern CSS',
	description,
	updated: '2026-11-02',
	categories: [
		{
			name: { en: 'Dark mode', es: 'Modo oscuro' },
			links: [
				{
					title: 'light-dark()',
					url: 'https://developer.mozilla.org' as const,
					description: linkDescription,
					tags: ['docs']
				}
			]
		}
	]
});

describe('readList', () => {
	test('a list in one language is not translated', () => {
		expect(readList('modern-css.yaml', list('CSS links.', 'One color each.')).translated).toBe(
			false
		);
	});

	test('a list is translated once its description is in every language', () => {
		const data = readList(
			'modern-css.yaml',
			list({ en: 'CSS links.', es: 'Enlaces de CSS.' }, { en: 'One color.', es: 'Un color.' })
		);
		expect(data.translated).toBe(true);
		// The heading id is from the English name, the same in both languages.
		expect(data.categories[0].id).toBe('dark-mode');
		const spanish = listIn({ ...data, slug: 'modern-css' }, 'es');
		expect(spanish.description).toBe('Enlaces de CSS.');
		expect(spanish.categories[0]).toMatchObject({ id: 'dark-mode', name: 'Modo oscuro' });
		expect(spanish.categories[0].links[0]).toMatchObject({
			title: 'light-dark()', // plain: the same in every language
			description: 'Un color.'
		});
	});

	test('a translated list with a link in one language fails: half English', () => {
		expect(() =>
			readList('modern-css.yaml', list({ en: 'CSS links.', es: 'Enlaces de CSS.' }, 'One color.'))
		).toThrow('modern-css.yaml: "https://developer.mozilla.org" description is in one language');
	});
});
