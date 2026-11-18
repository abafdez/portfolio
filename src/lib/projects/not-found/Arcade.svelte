<script lang="ts">
	// The frame the 404 games share: the board (the game's canvas, `children`), and under
	// it, on a sheet, how to play, what's happening, the score and the buttons.
	// The status is a live region: a screen reader hears it when the game starts, pauses
	// or ends. The score changes too often for that, so it's plain text.
	import type { Snippet } from 'svelte';

	let {
		how,
		howId,
		status,
		score,
		button,
		boardWidth = '32rem',
		onpress,
		children,
		controls
	}: {
		how: string;
		howId: string; // the canvas points at it with aria-describedby
		status: string;
		score: string;
		button: string;
		boardWidth?: string; // the board's widest, on a big screen
		onpress: () => void;
		children: Snippet;
		controls?: Snippet;
	} = $props();
</script>

<div class="arcade" style:--board-width={boardWidth}>
	{@render children()}
	<div class="panel sheet">
		<p class="how" id={howId}>{how}</p>
		<p class="status" role="status">{status}</p>
		<p class="score">{score}</p>
		<div class="controls">
			{@render controls?.()}
			<button type="button" class="press" onclick={onpress}>{button}</button>
		</div>
	</div>
</div>

<style>
	.arcade {
		display: grid;
		gap: var(--size-3);
		justify-items: center;
	}

	/* The board: the page's own grid shows faintly through it. */
	.arcade :global(canvas) {
		display: block;
		inline-size: 100%;
		max-inline-size: var(--board-width);
		background: color-mix(in oklab, var(--surface-1) 80%, transparent);
		border: var(--border-size-1) solid var(--surface-3);
		border-radius: var(--radius-2);
	}

	.arcade :global(canvas:focus-visible) {
		outline: var(--border-size-2) solid var(--brand);
		outline-offset: var(--size-1);
	}

	.panel {
		inline-size: 100%;
		max-inline-size: var(--board-width);
		display: grid;
		gap: var(--size-2);
	}

	.how,
	.score {
		color: var(--text-2);
		font-size: var(--font-size-0);
	}

	.status {
		font-weight: var(--font-weight-6);
	}

	.score {
		font-family: var(--font-code);
	}

	.controls {
		display: flex;
		flex-wrap: wrap;
		gap: var(--size-2);
		align-items: center;
	}

	.controls :global(button) {
		padding: var(--size-1) var(--size-3);
		border: var(--border-size-1) solid var(--surface-3);
		border-radius: var(--radius-2);
		background: var(--surface-2);
		color: var(--text-1);
		font: inherit;
		/* Held down with a finger: no text selection, no long-press menu. */
		user-select: none;
		-webkit-user-select: none;
		touch-action: manipulation;
	}

	.controls :global(button:hover) {
		background: var(--surface-3);
	}

	.press {
		margin-inline-start: auto;
		border-color: var(--brand) !important;
	}
</style>
