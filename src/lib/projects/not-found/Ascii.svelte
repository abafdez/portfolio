<script lang="ts">
	// The 404 in text characters, moving (frames from ascii.ts). Decoration: screen readers
	// skip it (the page's heading already says 404). With reduced motion it's one still
	// frame and the pointer does nothing.
	import { onMount } from 'svelte';
	import { prefersReducedMotion } from 'svelte/motion';
	import { m } from '#lib/i18n/index.ts';
	import { loop } from './canvas.ts';
	import { columns, frame, lines, type Ripple } from './ascii.ts';

	let pre: HTMLPreElement;
	let text = $state(frame(0));
	let pointer: { x: number; y: number } | undefined;
	let ripples: Ripple[] = [];
	let time = 0;

	// The pointer's position in characters.
	function at(event: PointerEvent) {
		const box = pre.getBoundingClientRect();
		return {
			x: ((event.clientX - box.left) / box.width) * columns,
			y: ((event.clientY - box.top) / box.height) * lines
		};
	}

	onMount(() => {
		if (prefersReducedMotion.current) return;
		// About 30 frames a second is plenty for text, and half the work.
		let since = 0;
		return loop((seconds) => {
			time += seconds;
			since += seconds;
			if (since < 1 / 30) return;
			since = 0;
			ripples = ripples.filter((ripple) => time - ripple.start < 1.5);
			text = frame(time, pointer, ripples);
		});
	});
</script>

<div class="ascii">
	<pre
		bind:this={pre}
		aria-hidden="true"
		onpointermove={(event) => (pointer = at(event))}
		onpointerleave={() => (pointer = undefined)}
		onpointerdown={(event) => ripples.push({ ...at(event), start: time })}
		style:--columns={columns}>{text}</pre>
	<p class="how sheet">{m.asciiHow()}</p>
</div>

<style>
	.ascii {
		display: grid;
		gap: var(--size-3);
		justify-items: center;
		container-type: inline-size;
	}

	/* As big as fits: one character is about 0.6 of the font size wide in Fira Code. */
	pre {
		margin: 0;
		font-family: var(--font-code);
		font-size: min(1.4rem, 100cqi / (var(--columns) * 0.61));
		line-height: 1;
		/* Fira Code joins == -- <> into one wide glyph: here every character is a pixel. */
		font-variant-ligatures: none;
		font-feature-settings: 'calt' 0;
		color: var(--brand);
		user-select: none;
		-webkit-user-select: none;
		touch-action: pan-y;
	}

	.how {
		color: var(--text-2);
		font-size: var(--font-size-0);
	}
</style>
