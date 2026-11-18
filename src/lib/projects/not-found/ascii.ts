// The 404 drawn with text characters, as one string per frame (Ascii.svelte puts it in a
// <pre>). Each cell of the bitmap (digits.ts) is 3 characters wide and 2 lines tall,
// about square in a monospace font. Inside the digits the characters are dense, around
// them a glow fades out, and a slow wave runs through both.
import { cells, columns as digitColumns, rows as digitRows } from './digits.ts';

const across = 3;
const down = 2;
const margin = { x: 2, y: 1.5 }; // empty cells around the number
export const columns = (digitColumns + margin.x * 2) * across;
export const lines = (digitRows + margin.y * 2) * down;

// From empty to full. The scramble under the pointer uses code-ish characters instead.
const ramp = ' .,:;-=+*#%@';
const scramble = '01<>/\\{}[]=+*#$';

// A click's ripple: where (in characters) and when (in seconds) it started.
export interface Ripple {
	x: number;
	y: number;
	start: number;
}

// The same position always gives the same number from 0 to 1: random-looking but
// steady, so sparkles stay put for a moment instead of flickering every frame.
export function hash(a: number, b: number, c: number) {
	let h = Math.imul(a, 374761393) + Math.imul(b, 668265263) + Math.imul(c, 1274126177);
	h = Math.imul(h ^ (h >>> 13), 1274126177);
	return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// How far each character is from the number, in cells (0 inside a digit). Worked out
// once: it never changes.
const distances = Array.from({ length: lines }, (_, line) =>
	Array.from({ length: columns }, (_, column) => {
		const u = (column + 0.5) / across - margin.x;
		const v = (line + 0.5) / down - margin.y;
		return Math.min(
			...cells.map(({ x, y }) =>
				Math.hypot(Math.max(x - u, 0, u - x - 1), Math.max(y - v, 0, v - y - 1))
			)
		);
	})
);

// One frame at `time` seconds. `pointer` is where the pointer is, in characters.
export function frame(time: number, pointer?: { x: number; y: number }, ripples: Ripple[] = []) {
	const tick = Math.floor(time * 3);
	let text = '';
	for (let line = 0; line < lines; line++) {
		for (let column = 0; column < columns; column++) {
			const distance = distances[line][column];
			const u = column / across;
			const v = line / down;
			const wave = 0.5 + 0.5 * Math.sin(u * 0.8 - v * 0.6 + time * 2.2);
			let level: number;
			if (distance === 0) level = 0.7 + 0.3 * wave;
			else {
				const glow = Math.max(0, 1 - distance / 1.8);
				level = glow * glow * (0.1 + 0.25 * wave);
				// A few sparkles in the empty space, each lasting a third of a second.
				if (hash(column, line, tick) > 0.993) level = Math.max(level, 0.3);
			}

			// Each ripple is a ring growing 18 lines a second (a character is 0.6 of a line wide),
			// fading out over 1.5 s.
			for (const ripple of ripples) {
				const age = time - ripple.start;
				const away = Math.hypot((column - ripple.x) * 0.6, line - ripple.y);
				const off = Math.abs(away - age * 18);
				if (off < 1.5) level += (1 - off / 1.5) * 0.7 * Math.max(0, 1 - age / 1.5);
			}

			// Near the pointer, characters turn into scrambled code, more so the closer.
			if (pointer) {
				const near = 1 - Math.hypot((column - pointer.x) * 0.6, line - pointer.y) / 5;
				const roll = hash(column, line, Math.floor(time * 12));
				if (near > 0 && roll < near * 0.9) {
					text += scramble[Math.floor(hash(line, column, tick) * scramble.length)];
					continue;
				}
			}
			text += ramp[Math.round(Math.min(1, level) * (ramp.length - 1))];
		}
		text += '\n';
	}
	return text;
}
