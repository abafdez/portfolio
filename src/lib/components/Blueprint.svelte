<script lang="ts">
	// The page background: a blueprint grid fixed behind everything. Without JS it's a
	// static grid; with a mouse, the grid lights up around the pointer.
	let pointer = $state<{ x: number; y: number } | null>(null);

	function onpointermove(event: PointerEvent) {
		// Touch and pen have no hover, so no spotlight for them.
		if (event.pointerType === 'mouse') pointer = { x: event.clientX, y: event.clientY };
	}

	// relatedTarget is null when the mouse leaves the window, not just an element.
	function onmouseout(event: MouseEvent) {
		if (!event.relatedTarget) pointer = null;
	}
</script>

<svelte:window {onpointermove} {onmouseout} />

<div
	class="blueprint"
	aria-hidden="true"
	style:--x={pointer && `${pointer.x}px`}
	style:--y={pointer && `${pointer.y}px`}
>
	<div class="grid"></div>
	<div class="marks"></div>
	<div class={['grid', 'spot', pointer && 'on']}></div>
</div>

<style>
	/* Fixed behind the content: z-index -1 paints it above the page background
	   (body's color) but below everything in the page. */
	.blueprint {
		position: fixed;
		inset: 0;
		z-index: -1;
		pointer-events: none;

		/* Visible at the top, fading out toward the bottom corners. */
		--fade: radial-gradient(ellipse 120% 100% at 50% 0%, black 30%, transparent 100%);
	}

	.blueprint > * {
		position: absolute;
		inset: 0;
	}

	/* Each linear-gradient draws one 1px line per tile (a hard stop: line color up
	   to 1px, transparent after) and background-size repeats the tile. Two sets:
	   minor lines every cell, major lines every 4 cells. The colors are custom
	   properties, so the spotlight reuses the same grid in another color. */
	.grid {
		--line: var(--grid-line);
		--line-major: var(--grid-line-major);
		--major: calc(var(--grid-size) * 4);

		background-image:
			linear-gradient(var(--line-major) 1px, transparent 1px),
			linear-gradient(90deg, var(--line-major) 1px, transparent 1px),
			linear-gradient(var(--line) 1px, transparent 1px),
			linear-gradient(90deg, var(--line) 1px, transparent 1px);
		background-size:
			var(--major) var(--major),
			var(--major) var(--major),
			var(--grid-size) var(--grid-size),
			var(--grid-size) var(--grid-size);
		mask-image: var(--fade);
	}

	/* A "+" at every major crossing. The SVG only says where to paint (a mask);
	   the color comes from background-color, so it follows the theme. The plus sits
	   in the middle of its tile, so the tile shifts by half to center it on the crossing.
	   Two masks, intersected: the pluses, and the same fade as the grid. */
	.marks {
		background-color: var(--grid-mark);
		mask-image:
			url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'%3E%3Cpath d='M48 42v12M42 48h12' stroke='black' stroke-width='1.5'/%3E%3C/svg%3E"),
			var(--fade);
		mask-size:
			calc(var(--grid-size) * 4) calc(var(--grid-size) * 4),
			100% 100%;
		mask-position:
			calc(var(--grid-size) * -2) calc(var(--grid-size) * -2),
			0 0;
		mask-repeat: repeat, no-repeat;
		mask-composite: intersect;
	}

	/* The spotlight: the same grid in the accent color, only visible in a circle
	   around the pointer, plus a faint glow. Hidden until the mouse moves. */
	.spot {
		display: none;
		--line: color-mix(in oklch, var(--brand) 25%, transparent);
		--line-major: color-mix(in oklch, var(--brand) 45%, transparent);
		mask-image: radial-gradient(circle 14rem at var(--x) var(--y), black, transparent);
		opacity: 0;
		transition: opacity 300ms ease-out;

		&::after {
			content: '';
			position: absolute;
			inset: 0;
			background: radial-gradient(
				circle 14rem at var(--x) var(--y),
				color-mix(in oklch, var(--brand) 8%, transparent),
				transparent
			);
		}

		&.on {
			opacity: 1;
		}
	}

	/* Only where there is a real hovering pointer (a mouse or trackpad). */
	@media (hover: hover) and (pointer: fine) {
		.spot {
			display: block;
		}
	}
</style>
