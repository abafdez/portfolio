import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { palettes, defaultPalette } from './palettes';

// Every theme's CSS as text, by file name: tokyo-night.css -> 'tokyo-night'. Read from
// disk: Vitest doesn't process CSS by default, so an import ('?raw' too) comes back empty.
const folder = new URL('./styles/themes/', import.meta.url);
const files = Object.fromEntries(
	readdirSync(folder)
		.filter((name) => name.endsWith('.css'))
		.map((name) => [name.replace('.css', ''), readFileSync(new URL(name, folder), 'utf8')])
);

// What a theme must set, so no part of the site keeps the default colours. The rest
// (grid, spotlight, icon tone) is made from these in tokens.css.
const tokens = [
	'surface-1',
	'surface-2',
	'surface-3',
	'text-1',
	'text-2',
	'brand',
	'error',
	'code-string',
	'code-keyword',
	'code-function',
	'code-constant',
	'code-type',
	'code-tag',
	'callout-note',
	'callout-tip',
	'callout-important',
	'callout-warning',
	'callout-caution'
];

const themed = palettes.filter((palette) => palette.id !== defaultPalette);

describe('palettes', () => {
	test('the default has no file, and every file is in the list', () => {
		expect(Object.keys(files).sort()).toEqual(themed.map((palette) => palette.id).sort());
	});

	describe.each(themed)('$name', ({ id }) => {
		const css = files[id];

		test('applies on <html> and on [data-theme] elements, like tokens.css', () => {
			expect(css).toContain(`:root[data-palette='${id}']`);
			expect(css).toContain(`[data-palette='${id}'] [data-theme]`);
			expect(css).toContain(`[data-theme][data-palette='${id}']`);
		});

		test.each(tokens)('sets --%s for light and dark', (token) => {
			expect(css).toMatch(new RegExp(`--${token}: light-dark\\(`));
		});
	});
});
