<script lang="ts">
	// A code block in markdown: a bar with the language and a copy button, then the
	// <pre> Shiki made (the highlight() function in vite.config.ts wraps every block in
	// this). Shiki's HTML comes in as children, through {@html}, so the styles below
	// reach it with :global(). They're still tied to this component's figure.
	import type { Snippet } from 'svelte';

	interface Props {
		// The language after the opening ``` ('text' when there's none).
		lang: string;
		children: Snippet;
	}

	let { lang, children }: Props = $props();

	let figure: HTMLElement;
	// The button only appears once JS runs, and only if the browser can copy: without
	// JS it would be a button that does nothing.
	let canCopy = $state(false);
	let status = $state('');

	$effect(() => {
		canCopy = 'clipboard' in navigator;
	});

	async function copy() {
		// textContent is the code as written: the line numbers are CSS (::before), so
		// they're not in it, and a wrapped line is still one line.
		const code = figure.querySelector('code')?.textContent ?? '';
		try {
			await navigator.clipboard.writeText(code);
			status = 'copied';
		} catch {
			status = "couldn't copy";
		}
		setTimeout(() => (status = ''), 2000);
	}
</script>

<figure bind:this={figure}>
	<figcaption>
		<span>{lang}</span>
		{#if canCopy}
			<!-- role="status": screen readers announce the text when it changes. -->
			<span class="status" role="status">{status}</span>
			<button type="button" onclick={copy}>copy</button>
		{/if}
	</figcaption>
	{@render children()}
</figure>

<style>
	figure {
		border: var(--border-size-1) solid var(--surface-3);
		border-radius: var(--radius-3);
		/* Rounds the corners of the pre's background too. */
		overflow: clip;
	}

	figcaption {
		display: flex;
		align-items: center;
		gap: var(--size-2);
		padding: var(--size-1) var(--size-3);
		border-block-end: var(--border-size-1) solid var(--surface-3);
		background-color: var(--surface-1);
		font-family: var(--font-label);
		font-size: var(--font-size-0);
		color: var(--text-2);
	}

	/* Pushes the status and the button to the end of the bar. */
	.status {
		margin-inline-start: auto;
	}

	button {
		padding: 0 var(--size-2);
		border: var(--border-size-1) solid var(--surface-3);
		border-radius: var(--radius-2);
		background: none;
		color: inherit;
		cursor: pointer;

		&:is(:hover, :focus-visible) {
			color: var(--text-1);
		}
	}

	/* Long lines wrap instead of scrolling, even inside a long word or URL
	   (overflow-wrap: anywhere). Nothing scrolls, so Shiki's tabindex="0" is removed in
	   highlight(): a tab stop that does nothing would only get in the way. */
	figure :global(pre) {
		padding: var(--size-3);
		font-size: var(--font-size-1);
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		/* The code uses tabs, 8 columns wide by default: too much on a phone. */
		tab-size: 2;
	}

	/* Line numbers: a CSS counter, so they're never copied. Each line is a full-width
	   inline-block with room for its number on the left: a line that wraps continues
	   under its own text, not under the number. (inline-block, not block: Shiki puts a
	   newline between the lines, and in a <pre> that would add an empty line after
	   every block.) The number is pulled into that room with a negative margin rather
	   than position: absolute, so an empty line still holds its number and keeps the
	   height of a line. */
	figure :global(code) {
		counter-reset: line;
	}

	figure :global(.line) {
		display: inline-block;
		inline-size: 100%;
		padding-inline-start: 4ch;
	}

	figure :global(.line::before) {
		counter-increment: line;
		content: counter(line);
		display: inline-block;
		inline-size: 2.5ch;
		margin-inline: -4ch 1.5ch;
		text-align: end;
		color: var(--code-comment);
	}

	/* A one-line block (a single command) doesn't need a number. */
	figure :global(.line:only-child) {
		padding-inline-start: 0;
	}

	figure :global(.line:only-child::before) {
		content: none;
	}
</style>
