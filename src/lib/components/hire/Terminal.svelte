<script lang="ts">
	// Look 1: a terminal window. The commands type themselves one line after another, and
	// the photo comes into focus from big pixels while they do. Screen readers get the
	// finished text at once (the typing is aria-hidden).
	import { onMount } from 'svelte';
	import { m } from '#lib/i18n/index.ts';
	import { tilt } from './tilt.ts';
	import type { LookProps } from './looks.ts';

	let { photo, linkedin }: LookProps = $props();

	const lines = [
		{ command: 'whoami', output: `Alfonso Baeza · ${m.hireRole()}` },
		{ command: 'cat hire.txt', output: m.footerHireText() },
		{ command: 'contact --linkedin', output: m.footerHireHow() }
	];
	// The whole text, typed: each line is the command and its output.
	const script = lines.map(({ command, output }) => `$ ${command}\n${output}`).join('\n');

	let typed = $state(0); // characters shown so far
	let done = $derived(typed >= script.length);
	let frame = $state<HTMLElement>();
	let canvas = $state<HTMLCanvasElement>();

	onMount(() => {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
			typed = script.length;
			return;
		}
		// About 150 characters a second (all of it in about 2 s), a pause after each line.
		let timer = 0;
		const next = () => {
			typed++;
			if (typed < script.length) {
				timer = window.setTimeout(next, script[typed - 1] === '\n' ? 140 : 6);
			}
		};
		timer = window.setTimeout(next, 250);
		pixelate();
		return () => clearTimeout(timer);
	});

	// The photo drawn at 6, 12, 24 and 48 pixels across, each blown up without smoothing,
	// then the canvas fades and the real photo is underneath.
	async function pixelate() {
		const img = frame?.querySelector('img');
		const context = canvas?.getContext('2d');
		if (!img || !canvas || !context) return;
		await img.decode().catch(() => {});
		const size = canvas.width;
		for (const pixels of [6, 12, 24, 48]) {
			context.imageSmoothingEnabled = true;
			context.clearRect(0, 0, size, size);
			context.drawImage(img, 0, 0, pixels, pixels);
			context.imageSmoothingEnabled = false;
			context.drawImage(canvas, 0, 0, pixels, pixels, 0, 0, size, size);
			await new Promise((resolve) => setTimeout(resolve, 170));
		}
		canvas.dataset.done = '';
	}

	// The typed text split back into lines, each marked as a command or an output.
	const shown = $derived(
		script
			.slice(0, typed)
			.split('\n')
			.map((text) => ({ text, command: text.startsWith('$ ') }))
	);
</script>

<div class="window tilt-card" {@attach tilt(6)}>
	<div class="bar" aria-hidden="true">
		<span class="light"></span><span class="light"></span><span class="light"></span>
		<span class="title">alfonso@portfolio: ~/hire</span>
	</div>
	<div class="body">
		<div class="photo" bind:this={frame}>
			<enhanced:img src={photo} alt="" sizes="8rem" />
			<canvas width="128" height="128" bind:this={canvas} aria-hidden="true"></canvas>
		</div>
		<div class="screen">
			<p class="visually-hidden">Alfonso Baeza, {m.hireRole()}. {m.footerHireText()}</p>
			<pre aria-hidden="true">{#each shown as line, index (index)}<span class:command={line.command}
						>{line.text}</span
					>{#if index < shown.length - 1}{'\n'}{/if}{/each}<span class="cursor" class:blink={done}
				></span></pre>
			<a class="cta" class:shown={done} href={linkedin} rel="external">{m.aboutAskLinkedIn()}</a>
		</div>
	</div>
</div>

<style>
	.window {
		overflow: hidden;
		border: var(--border-size-1) solid var(--surface-3);
		border-radius: var(--radius-3);
		background: var(--surface-2);
		font-family: var(--font-code);
	}

	.bar {
		display: flex;
		align-items: center;
		gap: var(--size-1);
		padding: var(--size-2) var(--size-3);
		border-block-end: var(--border-size-1) solid var(--surface-3);
		font-size: var(--font-size-0);
		color: var(--text-2);
	}

	.light {
		inline-size: 0.7rem;
		block-size: 0.7rem;
		border-radius: 50%;
		background: var(--surface-3);

		&:nth-child(2) {
			background: var(--window-minimize);
		}

		&:nth-child(3) {
			background: var(--window-zoom);
		}
	}

	.title {
		margin-inline-start: var(--size-2);
	}

	.body {
		display: flex;
		flex-wrap: wrap;
		gap: var(--size-4);
		padding: var(--size-4);
	}

	.photo {
		position: relative;
		flex: none;
		inline-size: 8rem;
		block-size: 8rem;
		overflow: hidden;
		border-radius: var(--radius-2);
		border: var(--border-size-2) solid var(--brand);

		& :global(img),
		& canvas {
			position: absolute;
			inset: 0;
			inline-size: 100%;
			block-size: 100%;
			object-fit: cover;
		}

		& canvas {
			transition: opacity 400ms var(--ease-out-3);
		}

		& canvas:global([data-done]) {
			opacity: 0;
		}
	}

	.screen {
		flex: 1 1 18rem;
		min-inline-size: 0;
	}

	pre {
		margin: 0;
		font: inherit;
		font-size: var(--font-size-1);
		line-height: 1.6;
		white-space: pre-wrap;
		color: var(--text-1);
	}

	.command {
		color: var(--brand);
	}

	.cursor {
		display: inline-block;
		inline-size: 0.6em;
		block-size: 1.1em;
		vertical-align: text-bottom;
		background: var(--brand);
	}

	@media (prefers-reduced-motion: no-preference) {
		.cursor.blink {
			animation: blink 1s steps(1) infinite;
		}
	}

	@keyframes blink {
		50% {
			opacity: 0;
		}
	}

	.cta {
		display: inline-block;
		margin-block-start: var(--size-3);
		padding: var(--size-2) var(--size-4);
		border-radius: var(--radius-2);
		background: var(--brand);
		color: var(--surface-1);
		text-decoration: none;
		opacity: 0;
		translate: 0 var(--size-2);
		transition:
			opacity 300ms var(--ease-out-3),
			translate 300ms var(--ease-out-3);

		/* Shown once the typing ends, or at once if it gets the keyboard focus first. */
		&.shown,
		&:focus-visible {
			opacity: 1;
			translate: 0;
		}
	}
</style>
