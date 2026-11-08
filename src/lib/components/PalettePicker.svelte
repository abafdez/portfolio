<script lang="ts">
	import { m } from '#lib/i18n/index.ts';
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
	aria-label={m.paletteLabel()}
	title={m.paletteLabel()}
	disabled={!current}
>
	<PaletteIcon aria-hidden="true" />
</button>

<div id="palettes" class="menu" popover>
	<!-- Disabled until mounted: without JS, choosing would do nothing. -->
	<fieldset disabled={!current}>
		<legend>{m.paletteLabel()}</legend>
		{#each palettes as palette (palette.id)}
			<!-- Who made it, as a hint on hover (the licence notice is in the theme's CSS). -->
			<label
				title={'credit' in palette
					? m.paletteCredit({ name: palette.name, by: palette.credit.by })
					: undefined}
			>
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

<!-- The glitch's colour split (palette-transitions.ts and .css): the red channel moved
     left and green + blue moved right, blended back with screen, so edges get red and
     cyan fringes. A filter the CSS can point at with url(#palette-rgb-split). If you
     remove the glitch, remove this too. -->
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
</style>
