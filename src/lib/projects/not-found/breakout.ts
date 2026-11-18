// Breakout, where the bricks are the 404 (digits.ts). The rules only: no canvas, no keys.
// Breakout.svelte draws the state and calls these. Everything is measured in grid cells.
import { cells, columns as digitColumns } from './digits.ts';

export const width = 23;
export const height = 24;
export const paddleY = height - 2; // the top of the paddle
export const paddleWidth = 3.5;
export const radius = 0.35;
const speed = 15; // cells per second
const paddleSpeed = 20;
const left = (width - digitColumns) / 2;
const top = 2;

export type Phase = 'ready' | 'playing' | 'paused' | 'won';

export interface Brick {
	x: number;
	y: number;
	alive: boolean;
}

export interface Breakout {
	bricks: Brick[];
	paddle: number; // the paddle's middle
	ball: { x: number; y: number; vx: number; vy: number };
	phase: Phase;
	misses: number;
}

export function newGame(): Breakout {
	const game: Breakout = {
		bricks: cells.map(({ x, y }) => ({ x: x + left, y: y + top, alive: true })),
		paddle: width / 2,
		ball: { x: 0, y: 0, vx: 0, vy: 0 },
		phase: 'ready',
		misses: 0
	};
	onPaddle(game);
	return game;
}

export const bricksLeft = (game: Breakout) => game.bricks.filter((brick) => brick.alive).length;

// Waiting to be launched: the ball sits on the paddle and moves with it.
function onPaddle(game: Breakout) {
	game.ball = { x: game.paddle, y: paddleY - radius, vx: 0, vy: 0 };
}

// Space or the Start button: launch, pause, go on, or start over.
export function press(game: Breakout, random = Math.random) {
	if (game.phase === 'ready') {
		// Up, leaning up to 25° either way, so no two games start the same.
		const angle = (random() - 0.5) * (Math.PI / 3.6);
		game.ball.vx = speed * Math.sin(angle);
		game.ball.vy = -speed * Math.cos(angle);
		game.phase = 'playing';
	} else if (game.phase === 'playing') game.phase = 'paused';
	else if (game.phase === 'paused') game.phase = 'playing';
	else Object.assign(game, newGame());
}

// The paddle follows the pointer (`target`, a column) or the arrow keys (`direction`).
export function movePaddle(game: Breakout, seconds: number, direction: number, target?: number) {
	if (game.phase === 'paused' || game.phase === 'won') return;
	const wanted = target ?? game.paddle + direction * paddleSpeed * seconds;
	const half = paddleWidth / 2;
	game.paddle = Math.min(width - half, Math.max(half, wanted));
	if (game.phase === 'ready') onPaddle(game);
}

// Does the ball overlap this cell? The point of the cell closest to the ball's centre
// is within the radius.
function touches(ball: Breakout['ball'], brick: Brick) {
	const dx = ball.x - Math.min(brick.x + 1, Math.max(brick.x, ball.x));
	const dy = ball.y - Math.min(brick.y + 1, Math.max(brick.y, ball.y));
	return dx * dx + dy * dy < radius * radius;
}

// Breaks the first brick the ball touches; true if it did.
function hitBrick(game: Breakout) {
	const brick = game.bricks.find((brick) => brick.alive && touches(game.ball, brick));
	if (brick) brick.alive = false;
	return !!brick;
}

// Moves the ball on. In small steps, so a fast ball can't jump over a brick: each step
// moves less than a radius. Across first, then down: whichever move made it touch a brick
// or a wall tells which way to bounce.
export function step(game: Breakout, seconds: number) {
	if (game.phase !== 'playing') return;
	const { ball } = game;
	const steps = Math.ceil((speed * seconds) / (radius / 2));
	const dt = seconds / steps;
	for (let i = 0; i < steps; i++) {
		ball.x += ball.vx * dt;
		if (ball.x < radius || ball.x > width - radius || hitBrick(game)) {
			ball.x -= ball.vx * dt;
			ball.vx = -ball.vx;
		}
		ball.y += ball.vy * dt;
		if (ball.y < radius || hitBrick(game)) {
			ball.y -= ball.vy * dt;
			ball.vy = -ball.vy;
		}

		// The paddle: where it hits sets the new angle, up to 60° at the ends, so the
		// player can aim.
		const offset = (ball.x - game.paddle) / (paddleWidth / 2);
		if (ball.vy > 0 && ball.y + radius >= paddleY && ball.y < paddleY && Math.abs(offset) <= 1.1) {
			const angle = Math.max(-1, Math.min(1, offset)) * (Math.PI / 3);
			ball.vx = speed * Math.sin(angle);
			ball.vy = -speed * Math.cos(angle);
			ball.y = paddleY - radius;
		}

		if (ball.y - radius > height) {
			game.misses++;
			game.phase = 'ready';
			onPaddle(game);
			return;
		}
		if (!bricksLeft(game)) {
			game.phase = 'won';
			return;
		}
	}
}
