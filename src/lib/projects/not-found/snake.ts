// Snake, where the food is the 404 (digits.ts): eat every cell of the number. The rules
// only; Snake.svelte draws the state and calls these. The walls wrap around (leave on
// the right, come back on the left), so the only way to lose is biting yourself.
import { cells, columns as digitColumns, rows as digitRows, type Cell } from './digits.ts';

export const width = 23;
export const height = 13;
const left = (width - digitColumns) / 2;
const top = (height - digitRows) / 2 - 1;

export type Phase = 'ready' | 'playing' | 'paused' | 'over' | 'won';
export type Direction = 'up' | 'down' | 'left' | 'right';

const moves: Record<Direction, Cell> = {
	up: { x: 0, y: -1 },
	down: { x: 0, y: 1 },
	left: { x: -1, y: 0 },
	right: { x: 1, y: 0 }
};
const opposite: Record<Direction, Direction> = {
	up: 'down',
	down: 'up',
	left: 'right',
	right: 'left'
};

export interface Snake {
	body: Cell[]; // the head first
	direction: Direction;
	// Turns pressed since the last move, at most two: a quick "up, left" at a corner
	// isn't lost, but holding keys can't pile up moves.
	turns: Direction[];
	food: Cell[];
	phase: Phase;
}

const key = ({ x, y }: Cell) => `${x},${y}`;

export function newGame(): Snake {
	const y = height - 2;
	return {
		body: [3, 2, 1, 0].map((x) => ({ x, y })),
		direction: 'right',
		turns: [],
		food: cells.map(({ x, y }) => ({ x: x + left, y: y + top })),
		phase: 'ready'
	};
}

// Space or the Start button.
export function press(game: Snake) {
	if (game.phase === 'ready' || game.phase === 'paused') game.phase = 'playing';
	else if (game.phase === 'playing') game.phase = 'paused';
	else Object.assign(game, newGame());
}

// A turn is ignored if it's where the snake already goes, or straight back into itself.
export function turn(game: Snake, direction: Direction) {
	const last = game.turns.at(-1) ?? game.direction;
	if (direction === last || direction === opposite[last] || game.turns.length >= 2) return;
	game.turns.push(direction);
}

// How long a move takes: a little faster with every cell eaten.
export const interval = (game: Snake) => 140 - (cells.length - game.food.length) * 1.2;

// One move. The tail moves out of the way first, so the head may take its cell.
export function tick(game: Snake) {
	if (game.phase !== 'playing') return;
	game.direction = game.turns.shift() ?? game.direction;
	const { x, y } = moves[game.direction];
	const [head] = game.body;
	const next = {
		x: (head.x + x + width) % width,
		y: (head.y + y + height) % height
	};
	const eaten = game.food.findIndex((cell) => key(cell) === key(next));
	if (eaten >= 0) game.food.splice(eaten, 1);
	else game.body.pop();
	if (game.body.some((cell) => key(cell) === key(next))) {
		game.phase = 'over';
		return;
	}
	game.body.unshift(next);
	if (!game.food.length) game.phase = 'won';
}
