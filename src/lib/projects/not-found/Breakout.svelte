<script lang="ts">
	// Breakout on the 404 (rules in breakout.ts). This file only draws and listens:
	// arrow keys (on the focused board), the pointer over the board, a finger dragging,
	// or holding the ← → buttons.
	import { onMount } from 'svelte';
	import { m } from '#lib/i18n/index.ts';
	import Arcade from './Arcade.svelte';
	import { fit, grid, loop, onColoursChange, readColours } from './canvas.ts';
	import * as rules from './breakout.ts';

	const { width, height, paddleY, paddleWidth, radius } = rules;
	const game = rules.newGame();
	let canvas: HTMLCanvasElement;

	// What the page shows in text, copied from the game after each frame. The game itself
	// isn't $state: it changes 60 times a second, and only these few values are on show.
	let phase = $state(game.phase);
	let left = $state(rules.bricksLeft(game));
	let misses = $state(0);

	// Where the paddle wants to go: keys and buttons give a direction, the pointer a column.
	const keys = new Set<'left' | 'right'>();
	let held = 0;
	let target: number | undefined;

	const status = $derived(
		{
			ready: misses ? m.breakoutMissed() : m.breakoutReady(),
			playing: m.breakoutPlaying(),
			paused: m.gamePaused(),
			won: m.breakoutWon()
		}[phase]
	);
	const button = $derived(
		{ ready: m.gameStart(), playing: m.gamePause(), paused: m.gameResume(), won: m.gameAgain() }[
			phase
		]
	);

	function press() {
		rules.press(game);
		sync();
	}

	function sync() {
		phase = game.phase;
		left = rules.bricksLeft(game);
		misses = game.misses;
	}

	function keydown(event: KeyboardEvent) {
		const key = event.key.toLowerCase();
		if (key === ' ' || key === 'enter') press();
		else if (key === 'escape' && game.phase === 'playing') press();
		else if (key === 'arrowleft' || key === 'a') keys.add('left');
		else if (key === 'arrowright' || key === 'd') keys.add('right');
		else return;
		// Keys the game uses don't scroll the page.
		event.preventDefault();
		target = undefined;
	}

	function keyup(event: KeyboardEvent) {
		const key = event.key.toLowerCase();
		if (key === 'arrowleft' || key === 'a') keys.delete('left');
		if (key === 'arrowright' || key === 'd') keys.delete('right');
	}

	// The pointer's column over the board (a mouse moving, or a finger dragging).
	function point(event: PointerEvent) {
		target = (event.offsetX / canvas.clientWidth) * width;
	}

	// A tap or click on the board launches the ball (and starts over after a win), but
	// never pauses: a click while playing is just aiming.
	function tap() {
		canvas.focus();
		if (game.phase === 'ready' || game.phase === 'won') press();
	}

	// The ← → buttons move the paddle while held down.
	const hold = (direction: number) => ({
		onpointerdown: () => {
			held = direction;
			target = undefined;
		},
		onpointerup: () => (held = 0),
		onpointerleave: () => (held = 0),
		onpointercancel: () => (held = 0)
	});

	onMount(() => {
		const context = canvas.getContext('2d')!;
		const tokens = { brick: '--brand', paddle: '--text-1', line: '--surface-3' };
		let colours = readColours(canvas, tokens);

		function draw() {
			context.clearRect(0, 0, width, height);
			// The game's own grid, faint: one line per cell.
			context.strokeStyle = colours.line;
			context.lineWidth = 0.03;
			grid(context, width, height);
			context.stroke();

			context.fillStyle = colours.brick;
			context.beginPath();
			for (const brick of game.bricks) {
				if (brick.alive) context.roundRect(brick.x + 0.1, brick.y + 0.1, 0.8, 0.8, 0.15);
			}
			context.fill();

			context.fillStyle = colours.paddle;
			context.beginPath();
			context.roundRect(game.paddle - paddleWidth / 2, paddleY, paddleWidth, 0.5, 0.25);
			context.arc(game.ball.x, game.ball.y, radius, 0, Math.PI * 2);
			context.fill();
		}

		const stopFit = fit(canvas, width, draw);
		const stopColours = onColoursChange(() => {
			colours = readColours(canvas, tokens);
			draw();
		});
		const stopLoop = loop((seconds) => {
			const direction = (keys.has('right') ? 1 : 0) - (keys.has('left') ? 1 : 0) + held;
			rules.movePaddle(game, seconds, direction, direction ? undefined : target);
			rules.step(game, seconds);
			draw();
			if (game.phase !== phase || game.misses !== misses || rules.bricksLeft(game) !== left) sync();
		});
		return () => {
			stopFit();
			stopColours();
			stopLoop();
		};
	});
</script>

<Arcade
	how={m.breakoutHow()}
	howId="breakout-how"
	{status}
	score={m.breakoutScore({ count: left, misses })}
	{button}
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
		aria-label={m.breakoutLabel()}
		aria-describedby="breakout-how"
		tabindex="0"
		onkeydown={keydown}
		onkeyup={keyup}
		onblur={() => keys.clear()}
		onpointermove={point}
		onpointerdown={point}
		onclick={tap}
	></canvas>
	{#snippet controls()}
		<button type="button" aria-label={m.gameLeft()} {...hold(-1)}>←</button>
		<button type="button" aria-label={m.gameRight()} {...hold(1)}>→</button>
	{/snippet}
</Arcade>

<style>
	canvas {
		/* A finger dragging sideways moves the paddle; up and down still scrolls the page. */
		touch-action: pan-y;
	}
</style>
