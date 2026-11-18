import { describe, expect, test } from 'vitest';
import {
	bricksLeft,
	height,
	movePaddle,
	newGame,
	paddleY,
	press,
	step,
	width
} from './breakout.ts';
import { cells } from './digits.ts';

describe('breakout', () => {
	test('starts with one brick per cell of the 404, the ball on the paddle', () => {
		const game = newGame();
		expect(bricksLeft(game)).toBe(cells.length);
		expect(game.phase).toBe('ready');
		expect(game.ball.x).toBe(game.paddle);
	});

	test('the ball waits on the paddle and moves with it', () => {
		const game = newGame();
		movePaddle(game, 0.1, -1);
		expect(game.ball.x).toBe(game.paddle);
		step(game, 0.5);
		expect(game.ball.y).toBeLessThan(paddleY);
		expect(game.phase).toBe('ready');
	});

	test('the paddle stays inside the field', () => {
		const game = newGame();
		movePaddle(game, 0, 0, -10);
		expect(game.paddle).toBeGreaterThan(0);
		movePaddle(game, 0, 0, width + 10);
		expect(game.paddle).toBeLessThan(width);
	});

	test('press launches upwards, then pauses and resumes', () => {
		const game = newGame();
		press(game, () => 0.5);
		expect(game.phase).toBe('playing');
		expect(game.ball.vy).toBeLessThan(0);
		press(game);
		expect(game.phase).toBe('paused');
		const y = game.ball.y;
		step(game, 0.1);
		expect(game.ball.y).toBe(y);
		press(game);
		expect(game.phase).toBe('playing');
	});

	test('a ball going straight up breaks a brick and comes back down', () => {
		const game = newGame();
		// Under the middle digit's bottom row.
		movePaddle(game, 0, 0, width / 2 + 0.5);
		press(game, () => 0.5);
		let steps = 0;
		while (game.ball.vy < 0 && steps++ < 100) step(game, 1 / 60);
		expect(bricksLeft(game)).toBe(cells.length - 1);
		expect(game.ball.vy).toBeGreaterThan(0);
	});

	test('a missed ball goes back on the paddle and counts the miss', () => {
		const game = newGame();
		game.phase = 'playing';
		game.paddle = 2;
		game.ball = { x: width - 2, y: height - 1, vx: 0, vy: 15 };
		step(game, 0.2);
		expect(game.phase).toBe('ready');
		expect(game.misses).toBe(1);
	});

	test('breaking the last brick wins, and press starts over', () => {
		const game = newGame();
		game.bricks.forEach((brick, index) => (brick.alive = index === 0));
		const [brick] = game.bricks;
		game.phase = 'playing';
		game.ball = { x: brick.x + 0.5, y: brick.y + 1.5, vx: 0, vy: -15 };
		step(game, 0.1);
		expect(game.phase).toBe('won');
		press(game);
		expect(game.phase).toBe('ready');
		expect(bricksLeft(game)).toBe(cells.length);
	});
});
