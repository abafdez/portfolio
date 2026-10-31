<script module lang="ts">
	// One costume per section. No costume is the plain mascot (the home page).
	export type Costume = 'suit' | 'glasses' | 'robe' | 'beret' | 'shades';
</script>

<script lang="ts">
	interface Props {
		costume?: Costume;
		// Without a label the mascot is decorative and hidden from screen readers.
		label?: string;
	}

	let { costume, label }: Props = $props();

	// A unique id per instance: two mascots on one page must not share a clipPath id.
	const uid = $props.id();
	const hasHat = $derived(costume === 'robe' || costume === 'beret');
</script>

<!-- Drawn back to front: things later in the markup paint on top. -->
<svg
	viewBox="0 0 120 128"
	class="mascot"
	role={label ? 'img' : undefined}
	aria-label={label}
	aria-hidden={label ? undefined : 'true'}
>
	<defs>
		<!-- Same shape as the body: clothes drawn through it never spill outside. -->
		<clipPath id="body-{uid}">
			<rect x="14" y="34" width="92" height="80" rx="30" />
		</clipPath>
	</defs>

	<ellipse class="shadow" cx="60" cy="122" rx="34" ry="4" />

	<g class="bob">
		{#if costume === 'robe'}
			<path
				class="cloth"
				d="M8 104 C4 50 18 28 46 20 Q58 16 64 6 Q72 18 80 21 C104 30 116 50 112 104 Z"
			/>
		{/if}

		<ellipse class="body" cx="42" cy="115" rx="11" ry="6" />
		<ellipse class="body" cx="78" cy="115" rx="11" ry="6" />

		<!-- Arms: a thick ink stroke with a thinner body-colored stroke on top. -->
		<path class="limb-ink" d="M16 82 Q4 86 6 98 M104 82 Q116 86 114 98" />
		<path class="limb" d="M16 82 Q4 86 6 98 M104 82 Q116 86 114 98" />

		<rect class="body" x="14" y="34" width="92" height="80" rx="30" />
		<path class="shine" d="M26 54 Q27 43 38 39" />

		{#if costume === 'suit'}
			<g clip-path="url(#body-{uid})">
				<path class="cloth" d="M0 94 H46 L60 116 L74 94 H120 V128 H0 Z" />
				<path class="light" d="M46 94 L60 116 L74 94 Z" />
				<path class="ink-fill" d="M57 95 H63 L65 106 L60 113 L55 106 Z" />
			</g>
		{:else if costume === 'robe'}
			<g clip-path="url(#body-{uid})">
				<rect class="cloth" x="0" y="96" width="120" height="32" />
				<path class="seam" d="M14 100 H106 M60 100 V116" />
			</g>
		{/if}

		<ellipse class="blush" cx="33" cy="76" rx="5" ry="3" />
		<ellipse class="blush" cx="88" cy="74" rx="5" ry="3" />

		<!-- Half-closed lids over side-eye pupils: the smug look. The shades cover them. -->
		{#if costume !== 'shades'}
			<g class="eyes">
				<ellipse class="eye" cx="44" cy="64" rx="9" ry="8" />
				<ellipse class="eye" cx="76" cy="64" rx="9" ry="8" />
				<circle class="ink-fill" cx="47.5" cy="66.5" r="3.5" />
				<circle class="ink-fill" cx="79.5" cy="66.5" r="3.5" />
				<path class="lid" d="M33.5 64 A10 9 0 0 1 54.5 64 Z M65.5 64 A10 9 0 0 1 86.5 64 Z" />
				<path class="line" d="M34 63 L54 64.5 M66 64.5 L86 63" />
			</g>
		{/if}

		<path class="line" d="M35 51 Q44 49 53 52" />
		<path class="line brow-up" d="M67 48 Q76 41 86 47" />
		<path class="line" d="M48 82 Q62 88 74 79 Q77 78 78 75" />

		{#if costume === 'glasses'}
			<g class="frames">
				<rect x="32" y="55" width="24" height="19" rx="4" />
				<rect x="64" y="55" width="24" height="19" rx="4" />
				<path d="M56 62 Q60 59 64 62 M32 61 L16 58 M88 61 L104 58" />
			</g>
		{:else if costume === 'shades'}
			<path
				class="ink-fill"
				d="M24 55 H96 V60 H91 V68 H86 V73 H70 V68 H65 V61 H55 V68 H50 V73 H34 V68 H29 V60 H24 Z"
			/>
			<path class="light" d="M34 60 h5 v4 h-5 Z M70 60 h5 v4 h-5 Z" />
		{:else if costume === 'robe'}
			<path
				class="cloth"
				d="M14 62 C16 34 36 26 60 26 C84 26 104 34 106 62 C100 46 84 37 60 37 C36 37 20 46 14 62 Z"
			/>
		{:else if costume === 'beret'}
			<path class="cloth" d="M20 44 C16 28 42 16 66 21 C84 25 90 34 82 39 C64 35 40 37 20 44 Z" />
			<path class="nub" d="M58 20 L61 14" />
		{/if}

		{#if !hasHat}
			<!-- The antenna is a terminal cursor: a block that blinks. -->
			<path class="antenna-ink" d="M60 35 V25" />
			<path class="antenna" d="M60 35 V25" />
			<rect class="body cursor" x="55" y="13" width="10" height="13" rx="1.5" />
		{/if}
	</g>
</svg>

<style>
	.mascot {
		inline-size: 100%;
		block-size: auto;
		overflow: visible;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.body,
	.eye,
	.cloth,
	.light,
	.ink-fill {
		stroke: var(--mascot-ink);
		stroke-width: 2.5;
	}

	.body,
	.lid,
	.limb {
		fill: var(--mascot-body);
	}

	.eye,
	.light {
		fill: var(--mascot-light);
	}

	.cloth {
		fill: var(--mascot-cloth);
	}

	.ink-fill {
		fill: var(--mascot-ink);
	}

	.line,
	.seam,
	.frames {
		fill: none;
		stroke: var(--mascot-ink);
		stroke-width: 2.5;
	}

	.seam {
		stroke-width: 2;
	}

	.frames {
		stroke-width: 3.5;

		& rect {
			fill: color-mix(in oklch, var(--mascot-light) 25%, transparent);
		}
	}

	.limb-ink,
	.limb {
		fill: none;
		stroke-width: 11;
		stroke: var(--mascot-ink);
	}

	.limb {
		stroke-width: 6;
		stroke: var(--mascot-body);
	}

	.shine {
		fill: none;
		stroke: var(--mascot-light);
		stroke-width: 4;
		opacity: 0.5;
	}

	.blush {
		fill: var(--mascot-blush);
	}

	.shadow {
		fill: var(--mascot-shadow);
	}

	.nub {
		stroke: var(--mascot-cloth);
		stroke-width: 5;
	}

	/* Like the arms: ink under body color, so it reads on both backgrounds. */
	.antenna-ink {
		fill: none;
		stroke: var(--mascot-ink);
		stroke-width: 7;
	}

	.antenna {
		fill: none;
		stroke: var(--mascot-body);
		stroke-width: 3;
	}

	/* SVG parts transform around their own box, not the SVG's top-left corner. */
	.bob,
	.shadow,
	.eyes,
	.brow-up {
		transform-box: fill-box;
		transform-origin: center;
	}

	/* It tilts on its feet. */
	.bob {
		transform-origin: center bottom;
	}

	/* Idle loops only for people who don't mind motion. Without them it's a still drawing. */
	@media (prefers-reduced-motion: no-preference) {
		.bob {
			animation: mascot-bob 2.4s ease-in-out infinite;
		}

		.shadow {
			animation: mascot-shadow 2.4s ease-in-out infinite;
		}

		.eyes {
			animation: mascot-blink 5s infinite;
		}

		.brow-up {
			animation: mascot-brow 7s ease-in-out infinite;
		}

		.cursor {
			animation: mascot-cursor 1.1s steps(1) infinite;
		}

		/* Hovered: a cheeky tilt and the eyebrow goes up. */
		.mascot:hover .bob {
			rotate: -6deg;
			transition: rotate 200ms var(--ease-spring-3);
		}

		/* A running animation beats normal rules, so stop it to take over. */
		.mascot:hover .brow-up {
			animation: none;
			translate: 0 -3px;
		}
	}

	@keyframes mascot-bob {
		50% {
			translate: 0 -4px;
		}
	}

	@keyframes mascot-shadow {
		50% {
			scale: 0.85 1;
		}
	}

	@keyframes mascot-blink {
		0%,
		94%,
		100% {
			scale: 1 1;
		}
		97% {
			scale: 1 0.1;
		}
	}

	@keyframes mascot-brow {
		0%,
		80%,
		100% {
			translate: 0 0;
		}
		85%,
		92% {
			translate: 0 -3px;
		}
	}

	@keyframes mascot-cursor {
		50% {
			opacity: 0;
		}
	}
</style>
