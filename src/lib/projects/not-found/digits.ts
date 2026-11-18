// "404" as a bitmap: every 404 variant (the games, the animations) is made of these
// cells. Each digit is 5 × 7, one empty column between them, so the whole number is
// 17 columns by 7 rows. Our own font.
const glyphs: Record<string, string[]> = {
	'4': ['...#.', '..##.', '.#.#.', '#..#.', '#####', '...#.', '...#.'],
	'0': ['.###.', '#...#', '#..##', '#.#.#', '##..#', '#...#', '.###.']
};

export const columns = 17;
export const rows = 7;

export interface Cell {
	x: number;
	y: number;
}

// The filled cells, left to right, top to bottom within each digit.
export const cells: Cell[] = [...'404'].flatMap((digit, index) =>
	glyphs[digit].flatMap((line, y) =>
		[...line].flatMap((pixel, x) => (pixel === '#' ? [{ x: index * 6 + x, y }] : []))
	)
);
