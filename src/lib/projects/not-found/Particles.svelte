<script lang="ts">
	// The 404 made of loose dots: they fly in, the pointer pushes them away, a click
	// scatters them, and they always find their way home. Decoration: screen readers skip
	// it. It only draws while something moves. With reduced motion the dots are simply
	// in place.
	import { onMount } from 'svelte';
	import { prefersReducedMotion } from 'svelte/motion';
	import { m } from '#lib/i18n/index.ts';
	import { fit, loop, onColoursChange, readColours } from './canvas.ts';
	import { cells, columns as digitColumns, rows as digitRows } from './digits.ts';

	// Measured in cells of the bitmap (digits.ts), 2 cells of margin all round.
	const margin = 2;
	const width = digitColumns + margin * 2;
	const height = digitRows + margin * 2;
	const split = 3; // dots per cell, each way
	const size = 0.26;
	const reach = 2.2; // how far the pointer pushes

	interface Dot {
		x: number;
		y: number;
		vx: number;
		vy: number;
		homeX: number;
		homeY: number;
	}

	const dots: Dot[] = cells.flatMap(({ x, y }) =>
		Array.from({ length: split * split }, (_, index) => {
			const homeX = margin + x + ((index % split) + 0.5) / split;
			const homeY = margin + y + (Math.floor(index / split) + 0.5) / split;
			return { x: homeX, y: homeY, vx: 0, vy: 0, homeX, homeY };
		})
	);

	let canvas: HTMLCanvasElement;
	let pointer: { x: number; y: number } | undefined;
	let wake = () => {};

	function at(event: PointerEvent) {
		return {
			x: (event.offsetX / canvas.clientWidth) * width,
			y: (event.offsetY / canvas.clientHeight) * height
		};
	}

	function scatter(event: PointerEvent) {
		const click = at(event);
		for (const dot of dots) {
			const dx = dot.x - click.x;
			const dy = dot.y - click.y;
			const distance = Math.hypot(dx, dy) || 1;
			const push = 1.2 / (distance + 0.5);
			dot.vx += (dx / distance) * push + (Math.random() - 0.5) * 0.2;
			dot.vy += (dy / distance) * push + (Math.random() - 0.5) * 0.2;
		}
		wake();
	}

	onMount(() => {
		const context = canvas.getContext('2d')!;
		const tokens = { dot: '--brand', fast: '--text-1' };
		let colours = readColours(canvas, tokens);
		const still = prefersReducedMotion.current;

		function draw() {
			context.clearRect(0, 0, width, height);
			for (const dot of dots) {
				const fast = Math.abs(dot.vx) + Math.abs(dot.vy) > 0.08;
				context.fillStyle = fast ? colours.fast : colours.dot;
				context.fillRect(dot.x - size / 2, dot.y - size / 2, size, size);
			}
		}

		// Each frame: a spring pulls every dot home, friction slows it, the pointer pushes.
		// Steps are per 1/60 s, whatever the screen's refresh rate.
		function move(seconds: number) {
			const steps = Math.max(1, Math.round(seconds * 60));
			let moving = false;
			for (let i = 0; i < steps; i++) {
				for (const dot of dots) {
					dot.vx = (dot.vx + (dot.homeX - dot.x) * 0.02) * 0.9;
					dot.vy = (dot.vy + (dot.homeY - dot.y) * 0.02) * 0.9;
					if (pointer) {
						const dx = dot.x - pointer.x;
						const dy = dot.y - pointer.y;
						const distance = Math.hypot(dx, dy) || 1;
						if (distance < reach) {
							dot.vx += (dx / distance) * (1 - distance / reach) * 0.08;
							dot.vy += (dy / distance) * (1 - distance / reach) * 0.08;
						}
					}
					dot.x += dot.vx;
					dot.y += dot.vy;
					moving ||=
						Math.abs(dot.vx) + Math.abs(dot.vy) > 0.001 ||
						Math.abs(dot.homeX - dot.x) + Math.abs(dot.homeY - dot.y) > 0.01;
				}
			}
			draw();
			// Everything home and the pointer gone: stop asking for frames.
			if (!moving && !pointer) sleep();
		}

		let stop: (() => void) | undefined;
		const sleep = () => {
			stop?.();
			stop = undefined;
		};
		wake = () => {
			if (!still) stop ??= loop(move);
		};

		const stopFit = fit(canvas, width, draw);
		const stopColours = onColoursChange(() => {
			colours = readColours(canvas, tokens);
			draw();
		});

		// The entrance: every dot starts somewhere random and flies home.
		if (!still) {
			for (const dot of dots) {
				dot.x = Math.random() * width;
				dot.y = Math.random() * height;
			}
			wake();
		}
		return () => {
			sleep();
			stopFit();
			stopColours();
		};
	});
</script>

<div class="particles">
	<canvas
		bind:this={canvas}
		aria-hidden="true"
		style:aspect-ratio="{width} / {height}"
		onpointermove={(event) => {
			pointer = at(event);
			wake();
		}}
		onpointerleave={() => (pointer = undefined)}
		onpointerdown={scatter}
	></canvas>
	<p class="how sheet">{m.particlesHow()}</p>
</div>

<style>
	.particles {
		display: grid;
		gap: var(--size-3);
		justify-items: center;
	}

	canvas {
		display: block;
		inline-size: 100%;
		max-inline-size: 48rem;
		touch-action: pan-y;
	}

	.how {
		color: var(--text-2);
		font-size: var(--font-size-0);
	}
</style>
