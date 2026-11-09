import { describe, expect, test } from 'vitest';
import {
	cursorSvg,
	cursorValue,
	dataUrl,
	edgeFor,
	hotspotAt,
	keywordGroups,
	shapes
} from './cursors.ts';

describe('keywords', () => {
	const values = keywordGroups.flatMap((g) => g.keywords.map((k) => k.value));

	test('all 36 of CSS’s cursor keywords, once each', () => {
		expect(values).toHaveLength(36);
		expect(new Set(values).size).toBe(36);
	});

	test('each one is a cursor value the browser knows', () => {
		// The CSS keywords from the spec's list (CSS Basic User Interface 4).
		const spec =
			'auto default none context-menu help pointer progress wait cell crosshair text vertical-text alias copy move no-drop not-allowed grab grabbing all-scroll col-resize row-resize n-resize e-resize s-resize w-resize ne-resize nw-resize se-resize sw-resize ew-resize ns-resize nesw-resize nwse-resize zoom-in zoom-out'.split(
				' '
			);
		expect([...values].sort()).toEqual([...spec].sort());
	});

	test('every description in both languages', () => {
		for (const { name, keywords } of keywordGroups) {
			expect(name.es).toBeTruthy();
			for (const { when } of keywords) expect(when.en && when.es).toBeTruthy();
		}
	});
});

describe('your own cursor', () => {
	const options = {
		shape: 'arrow',
		color: '#50fa7b',
		size: 32,
		x: 4,
		y: 3,
		fallback: 'auto'
	} as const;

	test('the SVG has a natural size and single quotes only', () => {
		const svg = cursorSvg(options);
		expect(svg).toContain("width='32' height='32'");
		expect(svg).not.toContain('"');
	});

	test('a dark edge on a light colour, a light one on a dark colour', () => {
		expect(edgeFor('#50fa7b')).toBe('#000');
		expect(edgeFor('#1a1b26')).toBe('#fff');
	});

	test('the hotspot scales with the size', () => {
		expect(hotspotAt('crosshair', 32)).toEqual([16, 16]);
		expect(hotspotAt('crosshair', 16)).toEqual([8, 8]);
		expect(hotspotAt('arrow', 24)).toEqual([3, 2]);
	});

	test('a data URL that decodes back to the SVG', () => {
		const svg = cursorSvg(options);
		const url = dataUrl(svg);
		expect(url.startsWith('data:image/svg+xml,')).toBe(true);
		expect(decodeURIComponent(url.slice('data:image/svg+xml,'.length))).toBe(svg);
	});

	test('the value: image, hotspot, then the fallback keyword last', () => {
		expect(cursorValue(options)).toMatch(/^url\("data:image\/svg\+xml,[^"]+"\) 4 3, auto$/);
	});

	test('every shape has a name in both languages and a hotspot on the grid', () => {
		for (const { name, hotspot } of Object.values(shapes)) {
			expect(name.en && name.es).toBeTruthy();
			for (const n of hotspot) expect(n >= 0 && n <= 32).toBe(true);
		}
	});
});

describe('animated cursors', () => {
	test('every animation has frames, each a cursor value with its own hotspot', async () => {
		const { animatedCursor, animations } = await import('./cursors.ts');
		for (const name of Object.keys(animations) as (keyof typeof animations)[]) {
			const frames = animatedCursor(name, '#50fa7b');
			expect(frames.length, name).toBeGreaterThan(1);
			for (const frame of frames) {
				expect(frame).toMatch(/^url\("data:image\/svg\+xml,[^"]+"\) \d+ \d+, auto$/);
				expect(decodeURIComponent(frame)).toContain("width='32' height='32'");
			}
		}
	});
});
