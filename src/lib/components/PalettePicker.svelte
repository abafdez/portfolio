<script lang="ts">
	import { onMount } from 'svelte';
	import PaletteIcon from '@lucide/svelte/icons/palette';
	import { palettes, defaultPalette, isPalette, type PaletteId } from '#lib/palettes.ts';
	import { transitionPalette } from '#lib/palette-transitions.ts';

	// Unknown until mounted: the prerendered HTML can't know the visitor's choice.
	let current = $state<PaletteId>();

	onMount(() => {
		// app.html has already put a saved palette on <html>, before the first paint.
		const saved = document.documentElement.dataset.palette;
		current = isPalette(saved) ? saved : defaultPalette;
	});

	// A new colour theme, with one of the transitions (palette-transitions.ts), starting
	// from the radio that was picked: by click or by arrow keys, it's that input.
	function choose(id: PaletteId, input: HTMLInputElement) {
		const { left, top, width, height } = input.getBoundingClientRect();
		transitionPalette(() => save(id), { x: left + width / 2, y: top + height / 2 });
	}

	// Like the light/dark toggle: the default removes the attribute and the saved value.
	function save(id: PaletteId) {
		const root = document.documentElement;
		try {
			if (id === defaultPalette) {
				delete root.dataset.palette;
				localStorage.removeItem('palette');
			} else {
				root.dataset.palette = id;
				localStorage.setItem('palette', id);
			}
		} catch {
			// Storage blocked (private mode): the palette still applies for this visit.
		}
	}
</script>

<!-- popovertarget opens and closes the menu with no JS of ours: the Popover API. It
     also closes on Escape or a click outside, and focus goes back to the button. -->
<button
	type="button"
	popovertarget="palettes"
	aria-label="Color theme"
	title="Color theme"
	disabled={!current}
>
	<PaletteIcon aria-hidden="true" />
</button>

<div id="palettes" class="menu" popover>
	<!-- Disabled until mounted: without JS, choosing would do nothing. -->
	<fieldset disabled={!current}>
		<legend>Color theme</legend>
		{#each palettes as palette (palette.id)}
			<!-- Who made it, as a hint on hover (the licence notice is in the theme's CSS). -->
			<label title={'credit' in palette ? `${palette.name} by ${palette.credit.by}` : undefined}>
				<input
					type="radio"
					name="palette"
					value={palette.id}
					bind:group={current}
					onchange={(event) => choose(palette.id, event.currentTarget)}
				/>
				{palette.name}
			</label>
		{/each}
	</fieldset>
</div>

<!-- The glitch's colour split (palette-transitions.ts): the red channel moved left and
     green + blue moved right, blended back with screen, so edges get red and cyan
     fringes. A filter the CSS can point at with url(#palette-rgb-split). -->
<svg class="filters" aria-hidden="true" focusable="false">
	<filter id="palette-rgb-split" color-interpolation-filters="sRGB">
		<feColorMatrix
			in="SourceGraphic"
			values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
			result="red"
		/>
		<feOffset in="red" dx="-6" result="red-left" />
		<feColorMatrix
			in="SourceGraphic"
			values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"
			result="cyan"
		/>
		<feOffset in="cyan" dx="6" result="cyan-right" />
		<feBlend in="red-left" in2="cyan-right" mode="screen" />
	</filter>
</svg>

<style>
	button {
		display: grid;
		place-items: center;
		inline-size: var(--size-8);
		block-size: var(--size-8);
		padding: var(--size-2);
		color: var(--text-2);
		background: none;
		border: none;
		border-radius: var(--radius-round);
		cursor: pointer;
		/* The menu is placed against this button (anchor positioning, below). */
		anchor-name: --palette-button;

		&:is(:hover, :focus-visible) {
			color: var(--text-1);
		}

		& :global(svg) {
			inline-size: 100%;
			block-size: 100%;
		}
	}

	/* A popover lives in the top layer, above everything, centred by default. Anchor
	   positioning puts it under the button instead, lined up with its end edge. */
	.menu {
		position-anchor: --palette-button;
		position-area: block-end span-inline-start;
		inset: auto;
		margin: var(--size-2) 0 0;
		padding: var(--size-3) var(--size-4);
		border: var(--border-size-1) solid var(--surface-3);
		border-radius: var(--radius-3);
		background-color: var(--surface-2);
		color: var(--text-1);
		box-shadow: var(--shadow-float);
	}

	/* Without anchor positioning: the top-right corner, under the header. */
	@supports not (position-area: block-end) {
		.menu {
			inset: var(--header-space) var(--size-3) auto auto;
			margin: 0;
		}
	}

	fieldset {
		display: grid;
		gap: var(--size-1);
		border: none;
		padding: 0;
		margin: 0;
	}

	legend {
		margin-block-end: var(--size-2);
		font-family: var(--font-label);
		font-size: var(--font-size-0);
		color: var(--text-2);
	}

	label {
		display: flex;
		align-items: center;
		gap: var(--size-2);
		cursor: pointer;
	}

	input {
		accent-color: var(--brand);
	}

	/* No size and out of the way, but not display: none, which can switch filters off. */
	.filters {
		position: absolute;
		inline-size: 0;
		block-size: 0;
	}

	/* The transitions (palette-transitions.ts). During a "palette" view transition the
	   browser shows two pictures of the page: the old one (::view-transition-old) under
	   the new one. The old one stays still; the new one does the effect, for as long as
	   the effect needs (--palette-duration, set from JS). */
	:global(:root:active-view-transition-type(palette)::view-transition-old(root)) {
		animation: none;
	}

	:global(:root:active-view-transition-type(palette)::view-transition-new(root)) {
		animation-duration: var(--palette-duration);
		animation-fill-mode: both;
	}

	/* Grid ripple: the new page through a self-animating SVG mask of grid squares. The
	   animation only holds the picture there until the last square is in. */
	:global(:root:active-view-transition-type(ripple)::view-transition-new(root)) {
		mask: var(--palette-mask) 0 0 / 100% 100% no-repeat;
		animation-name: palette-hold;
		animation-timing-function: linear;
	}

	@keyframes -global-palette-hold {
		from,
		to {
			opacity: 1;
		}
	}

	/* Glitch: random bands of the new page, shifted sideways, some frames with the colour
	   split, then a last flash of the whole page split before it settles. steps() makes
	   every frame a jump, not a fade: that's what makes it look broken. */
	:global(:root:active-view-transition-type(glitch)::view-transition-new(root)) {
		animation-name: palette-glitch;
		animation-timing-function: steps(1, end);
	}

	@keyframes -global-palette-glitch {
		0% {
			mask-image: var(--glitch-bands-1);
			translate: var(--glitch-shift-1) 0;
			filter: url(#palette-rgb-split);
		}
		14% {
			mask-image: var(--glitch-bands-2);
			translate: var(--glitch-shift-2) 0;
			filter: none;
		}
		28% {
			mask-image: var(--glitch-bands-3);
			translate: var(--glitch-shift-3) 0;
			filter: url(#palette-rgb-split);
		}
		42% {
			mask-image: var(--glitch-bands-4);
			translate: var(--glitch-shift-4) 0;
			filter: hue-rotate(90deg);
		}
		56% {
			mask-image: var(--glitch-bands-5);
			translate: var(--glitch-shift-5) 0;
			filter: url(#palette-rgb-split);
		}
		70% {
			mask-image: none;
			translate: 0;
			filter: url(#palette-rgb-split);
		}
		85% {
			mask-image: none;
			translate: 3px 0;
			filter: none;
		}
		100% {
			mask-image: none;
			translate: 0;
			filter: none;
		}
	}
</style>
