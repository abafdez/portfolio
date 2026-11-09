import { describe, expect, test } from 'vitest';
import { blocks, forms, label, search, symbols, unicodeVersion } from './symbols.ts';

const find = (codePoint: number) => symbols.find((s) => s.codePoint === codePoint)!;

describe('the data', () => {
	test('a Unicode version and the blocks the tool offers', () => {
		expect(unicodeVersion).toMatch(/^\d+\.\d+\.\d+$/);
		expect(blocks.map((b) => b.name)).toContain('Arrows');
	});

	test('every character is in a picked block or has an HTML name', () => {
		for (const s of symbols) expect(s.block >= 0 || s.entities.length > 0).toBe(true);
	});

	test('no controls or combining marks', () => {
		expect(symbols.some((s) => s.codePoint < 0x20)).toBe(false);
		// COMBINING ACUTE ACCENT
		expect(symbols.some((s) => s.codePoint === 0x301)).toBe(false);
	});

	test('entity names, shortest first', () => {
		expect(find(0xa9).entities).toEqual(['copy', 'COPY']);
		expect(find(0x2192).entities[0]).toBe('rarr');
	});
});

describe('forms', () => {
	test('a Latin-1 character', () => {
		expect(forms(find(0xa9))).toEqual({
			char: '©',
			unicode: 'U+00A9',
			entities: ['&copy;', '&COPY;'],
			decimal: '&#169;',
			hex: '&#xA9;',
			css: '\\00A9',
			js: '\\u00A9',
			url: '%C2%A9',
			utf8: 'C2 A9',
			utf16: '00A9'
		});
	});

	test('beyond FFFF: four UTF-8 bytes, two UTF-16 units, braces in JS', () => {
		const smile = forms(find(0x1f600));
		expect(smile.utf8).toBe('F0 9F 98 80');
		expect(smile.utf16).toBe('D83D DE00');
		expect(smile.js).toBe('\\u{1F600}');
		expect(smile.css).toBe('\\1F600');
		expect(smile.entities).toEqual([]);
	});
});

test('label', () => {
	expect(label('COPYRIGHT SIGN')).toBe('Copyright sign');
});

describe('search', () => {
	const names = (query: string) => search(query).map((s) => s.name);

	test('empty: everything', () => {
		expect(search('  ')).toHaveLength(symbols.length);
	});

	test('words, any order and case, from the start of a word', () => {
		expect(names('copyright')).toContain('COPYRIGHT SIGN');
		expect(names('ARROW right')).toContain('RIGHTWARDS ARROW');
		expect(names('row')).not.toContain('RIGHTWARDS ARROW');
	});

	test('a pasted character', () => {
		expect(names('→')).toEqual(['RIGHTWARDS ARROW']);
	});

	test('a single ASCII letter is the start of a word, not the letter', () => {
		expect(search('a').length).toBeGreaterThan(1);
	});

	test('a code point', () => {
		expect(names('U+2192')).toEqual(['RIGHTWARDS ARROW']);
		expect(names('u+a9')).toEqual(['COPYRIGHT SIGN']);
	});

	test('an entity, with or without & and ;', () => {
		expect(names('&rarr;')).toEqual(['RIGHTWARDS ARROW']);
		expect(names('&rarr')).toEqual(['RIGHTWARDS ARROW']);
		expect(names('copy;')).toEqual(['COPYRIGHT SIGN']);
	});
});

test('every block has a name in both languages', async () => {
	const { blockNames } = await import('./names.ts');
	for (const { name } of blocks) {
		expect(blockNames[name]?.en, name).toBeTruthy();
		expect(blockNames[name]?.es, name).toBeTruthy();
	}
});

test("every block's icon is one of its own characters", async () => {
	const { blockIcons } = await import('./names.ts');
	for (const { name, start, end } of blocks) {
		const codePoint = blockIcons[name]?.codePointAt(0);
		expect(codePoint, name).toBeGreaterThanOrEqual(start);
		expect(codePoint, name).toBeLessThanOrEqual(end);
	}
});
