import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { palettes, defaultPalette } from './palettes';
import { contrast } from './projects/contrast/contrast';

// Every theme's CSS as text, by file name: tokyo-night.css -> 'tokyo-night'. Read from
// disk: Vitest doesn't process CSS by default, so an import ('?raw' too) comes back empty.
const folder = new URL('./styles/themes/', import.meta.url);
const files = Object.fromEntries(
	readdirSync(folder)
		.filter((name) => name.endsWith('.css') && !name.startsWith('_')) // _licences.css
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

		// The pairs the site really draws, at WCAG AA (4.5:1). Lighthouse only checks what's
		// on screen when it runs; this checks every theme, both halves, every time.
		describe.each(['light', 'dark'] as const)('%s', (half) => {
			const colour = (token: string) => hex(valuesOf(css, token)[half === 'light' ? 0 : 1]);
			const surfaces = ['surface-1', 'surface-2', 'surface-3'].map(colour);
			// The spotlight's brightest point (tokens.css): a 4% glow and a 15% grid line in
			// the brand colour, over the page.
			const brand = colour('brand');
			const spotlight = over(brand, 0.15, over(brand, 0.04, surfaces[0]));
			const pairs: [string, RGB[]][] = [
				['text-1', [...surfaces, spotlight]],
				['text-2', [...surfaces, spotlight]],
				['brand', [...surfaces, spotlight]],
				['error', surfaces.slice(0, 2)],
				// Code blocks and callouts sit on --surface-2.
				...tokens
					.filter((token) => /^(code|callout)-/.test(token))
					.map((token): [string, RGB[]] => [token, [surfaces[1]]])
			];

			test.each(pairs)('--%s is at least 4.5:1 on what it sits on', (token, backgrounds) => {
				const lowest = Math.min(...backgrounds.map((bg) => contrast(colour(token), bg)));
				expect(lowest).toBeGreaterThanOrEqual(4.5);
			});
		});
	});
});

type RGB = [number, number, number];

// The two values of '--token: light-dark(#light, #dark);'. Themes write their colours
// as hex, so the test can read them without a browser.
function valuesOf(css: string, token: string): [string, string] {
	const match = new RegExp(`--${token}: light-dark\\((#[0-9a-f]{6}), (#[0-9a-f]{6})\\)`, 'i').exec(
		css
	);
	if (!match) throw new Error(`--${token} isn't light-dark(#hex, #hex)`);
	return [match[1], match[2]];
}

function hex(value: string): RGB {
	return [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16)) as RGB;
}

// A colour at some opacity over another, as the browser composites it (in sRGB).
function over(top: RGB, alpha: number, bottom: RGB): RGB {
	return top.map((c, i) => c * alpha + bottom[i] * (1 - alpha)) as RGB;
}
