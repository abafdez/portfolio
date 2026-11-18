import { describe, expect, test } from 'vitest';
import { columns, frame, hash, lines } from './ascii.ts';

describe('ascii', () => {
	test('a frame is `lines` lines of `columns` characters', () => {
		const rows = frame(0).split('\n').slice(0, -1);
		expect(rows).toHaveLength(lines);
		expect(rows.every((row) => row.length === columns)).toBe(true);
	});

	test('the digits are dense and the corners are empty', () => {
		const rows = frame(0).split('\n');
		expect(rows[0][0]).toBe(' ');
		// The top of the first 4's stem: cell (3, 0), 2 cells of margin, 1.5 on top.
		const stem = rows[3][(3 + 2) * 3 + 1];
		expect('+*#%@').toContain(stem);
	});

	test('hash is steady and between 0 and 1', () => {
		expect(hash(1, 2, 3)).toBe(hash(1, 2, 3));
		for (let i = 0; i < 100; i++) {
			const value = hash(i, i * 7, i * 13);
			expect(value).toBeGreaterThanOrEqual(0);
			expect(value).toBeLessThan(1);
		}
	});

	test('the pointer scrambles the characters around it', () => {
		const calm = frame(1);
		const busy = frame(1, { x: columns / 2, y: lines / 2 });
		expect(busy).not.toBe(calm);
		expect(busy).toHaveLength(calm.length);
	});
});
