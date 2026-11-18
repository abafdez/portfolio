import { describe, expect, test } from 'vitest';
import { height, newGame, press, tick, turn, width } from './snake.ts';
import { cells } from './digits.ts';

const playing = () => {
	const game = newGame();
	press(game);
	return game;
};

describe('snake', () => {
	test('starts with every cell of the 404 as food, waiting', () => {
		const game = newGame();
		expect(game.food).toHaveLength(cells.length);
		expect(game.phase).toBe('ready');
		tick(game);
		expect(game.body[0]).toEqual({ x: 3, y: height - 2 });
	});

	test('moves one cell per tick and keeps its length', () => {
		const game = playing();
		tick(game);
		expect(game.body[0]).toEqual({ x: 4, y: height - 2 });
		expect(game.body).toHaveLength(4);
	});

	test('ignores turning back into itself, keeps two quick turns', () => {
		const game = playing();
		turn(game, 'left');
		expect(game.turns).toEqual([]);
		turn(game, 'up');
		turn(game, 'left');
		turn(game, 'down');
		expect(game.turns).toEqual(['up', 'left']);
		tick(game);
		expect(game.direction).toBe('up');
	});

	test('wraps around the walls', () => {
		const game = playing();
		game.body = [{ x: width - 1, y: 0 }];
		tick(game);
		expect(game.body[0]).toEqual({ x: 0, y: 0 });
	});

	test('grows when it eats, and wins when the 404 is gone', () => {
		const game = playing();
		game.food = [{ x: 4, y: height - 2 }];
		tick(game);
		expect(game.body).toHaveLength(5);
		expect(game.phase).toBe('won');
	});

	test('biting itself ends the game; press starts over', () => {
		const game = playing();
		game.body = [
			{ x: 5, y: 5 },
			{ x: 4, y: 5 },
			{ x: 4, y: 6 },
			{ x: 5, y: 6 },
			{ x: 6, y: 6 }
		];
		game.direction = 'down';
		tick(game);
		expect(game.phase).toBe('over');
		press(game);
		expect(game.phase).toBe('ready');
		expect(game.food).toHaveLength(cells.length);
	});
});
