<script lang="ts">
	// Snake on the 404 (rules in snake.ts). This file only draws and listens: arrow keys
	// or WASD (on the focused board), a swipe on the board, or the arrow buttons.
	import { onMount } from 'svelte';
	import { m } from '#lib/i18n/index.ts';
	import Arcade from './Arcade.svelte';
	import { fit, grid, loop, onColoursChange, readColours } from './canvas.ts';
	import * as rules from './snake.ts';
	import type { Direction } from './snake.ts';

	const { width, height } = rules;
	const game = rules.newGame();
	let canvas: HTMLCanvasElement;

	// Copied from the game after each move (see Breakout.svelte).
	let phase = $state(game.phase);
	let left = $state(game.food.length);

	const status = $derived(
		{
			ready: m.snakeReady(),
			playing: m.snakePlaying(),
			paused: m.gamePaused(),
			over: m.snakeOver(),
			won: m.snakeWon()
		}[phase]
	);
	const button = $derived(
		{
			ready: m.gameStart(),
			playing: m.gamePause(),
			paused: m.gameResume(),
			over: m.gameAgain(),
			won: m.gameAgain()
		}[phase]
	);

	function sync() {
		phase = game.phase;
		left = game.food.length;
	}

	function press() {
		rules.press(game);
		sync();
	}

	// Steering also starts a game that's waiting: no need to find Space first.
	function steer(direction: Direction) {
		if (game.phase === 'ready') press();
		rules.turn(game, direction);
	}

	const keyMap: Record<string, Direction> = {
		arrowup: 'up',
		w: 'up',
		arrowdown: 'down',
		s: 'down',
		arrowleft: 'left',
		a: 'left',
		arrowright: 'right',
		d: 'right'
	};

	function keydown(event: KeyboardEvent) {
		const key = event.key.toLowerCase();
		if (key === ' ' || key === 'enter') press();
		else if (key === 'escape' && game.phase === 'playing') press();
		else if (keyMap[key]) steer(keyMap[key]);
		else return;
		event.preventDefault();
	}

	// A swipe is a pointer that moved at least 24px between down and up; its longer side
	// says which way. Anything shorter is a tap, which starts, or starts over.
	let start: { x: number; y: number } | undefined;
	function pointerdown(event: PointerEvent) {
		canvas.focus();
		start = { x: event.clientX, y: event.clientY };
	}
	function pointerup(event: PointerEvent) {
		if (!start) return;
		const dx = event.clientX - start.x;
		const dy = event.clientY - start.y;
		start = undefined;
		if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) {
			if (game.phase !== 'playing') press();
		} else if (Math.abs(dx) > Math.abs(dy)) steer(dx > 0 ? 'right' : 'left');
		else steer(dy > 0 ? 'down' : 'up');
	}

	onMount(() => {
		const context = canvas.getContext('2d')!;
		const tokens = { food: '--brand', snake: '--text-1', line: '--surface-3' };
		let colours = readColours(canvas, tokens);

		function draw() {
			context.clearRect(0, 0, width, height);
			context.strokeStyle = colours.line;
			context.lineWidth = 0.03;
			grid(context, width, height);
			context.stroke();

			context.fillStyle = colours.food;
			context.beginPath();
			for (const { x, y } of game.food) context.roundRect(x + 0.15, y + 0.15, 0.7, 0.7, 0.15);
			context.fill();

			// The body fades towards the tail; the head is solid and a little bigger.
			context.fillStyle = colours.snake;
			game.body.forEach(({ x, y }, index) => {
				context.globalAlpha = Math.max(0.35, 1 - index / (game.body.length + 4));
				const inset = index ? 0.1 : 0.03;
				context.beginPath();
				context.roundRect(x + inset, y + inset, 1 - inset * 2, 1 - inset * 2, 0.2);
				context.fill();
			});
			context.globalAlpha = 1;
		}

		const stopFit = fit(canvas, width, draw);
		const stopColours = onColoursChange(() => {
			colours = readColours(canvas, tokens);
			draw();
		});
		// Moves happen every interval() milliseconds, however often frames come.
		let waited = 0;
		const stopLoop = loop((seconds) => {
			waited = game.phase === 'playing' ? waited + seconds * 1000 : 0;
			while (waited >= rules.interval(game) && game.phase === 'playing') {
				waited -= rules.interval(game);
				rules.tick(game);
			}
			draw();
			if (game.phase !== phase || game.food.length !== left) sync();
		});
		return () => {
			stopFit();
			stopColours();
			stopLoop();
		};
	});
</script>

<Arcade
	how={m.snakeHow()}
	howId="snake-how"
	{status}
	score={m.snakeScore({ count: left })}
	{button}
	boardWidth="44rem"
	onpress={() => {
		press();
		canvas.focus();
	}}
>
	<!-- role="application": a screen reader passes the arrow keys and Space to the game
	     instead of using them to read the page. Svelte's list counts it as a
	     non-interactive role, hence the warning; for a game it's the right one. -->
	<!-- svelte-ignore a11y_no_interactive_element_to_noninteractive_role -->
	<canvas
		bind:this={canvas}
		style:aspect-ratio="{width} / {height}"
		role="application"
		aria-label={m.snakeLabel()}
		aria-describedby="snake-how"
		tabindex="0"
		onkeydown={keydown}
		onpointerdown={pointerdown}
		onpointerup={pointerup}
		onpointercancel={() => (start = undefined)}
	></canvas>
	{#snippet controls()}
		<button type="button" aria-label={m.gameUp()} onclick={() => steer('up')}>↑</button>
		<button type="button" aria-label={m.gameLeft()} onclick={() => steer('left')}>←</button>
		<button type="button" aria-label={m.gameDown()} onclick={() => steer('down')}>↓</button>
		<button type="button" aria-label={m.gameRight()} onclick={() => steer('right')}>→</button>
	{/snippet}
</Arcade>

<style>
	canvas {
		/* Swipes on the board steer: the page doesn't scroll under a finger here. */
		touch-action: none;
	}
</style>
