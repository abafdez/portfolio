import { describe, expect, test } from 'vitest';
import { isScale, scales, step } from './text-size.ts';

describe('text size', () => {
	test('steps up and down through the list, and stops at its ends', () => {
		expect(step(1, 1)).toBe(1.125);
		expect(step(1, -1)).toBe(0.875);
		expect(step(scales[0], -1)).toBe(scales[0]);
		expect(step(scales.at(-1)!, 1)).toBe(scales.at(-1));
	});

	test('an unknown value steps from the default', () => {
		expect(step(3, 1)).toBe(1.125);
	});

	test('only the listed values are scales', () => {
		expect(isScale(1.25)).toBe(true);
		expect(isScale(2)).toBe(false);
		expect(isScale('1')).toBe(false);
	});
});
