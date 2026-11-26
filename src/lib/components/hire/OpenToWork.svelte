<script lang="ts">
	// Look 4: a pulsing "Open to work" status, the photo glitching in red and cyan on
	// hover (the colour themes' RGB split filter, #palette-rgb-split, drawn by
	// PalettePicker in the header), and an "Ask on LinkedIn" button that leans toward the
	// pointer and gives off sparkles.
	import { site } from '#lib/site.ts';
	import { m, text } from '#lib/i18n/index.ts';
	import { magnet } from './tilt.ts';
	import type { LookProps } from './looks.ts';

	let { photo, linkedin }: LookProps = $props();
</script>

<div class="card">
	<p class="status"><span class="dot" aria-hidden="true"></span>{m.hireOpenToWork()}</p>
	<div class="who">
		<div class="photo">
			<enhanced:img src={photo} alt="" sizes="8rem" />
		</div>
		<div>
			<p class="name">{site.name}</p>
			<p class="tagline">{text(site.tagline)}</p>
			<p class="pitch">{text(site.hire.text)}</p>
		</div>
	</div>
	<div class="action">
		<a class="cta" href={linkedin} rel="external" {@attach magnet(12)}>
			{m.aboutAskLinkedIn()}
			{#each [1, 2, 3, 4, 5, 6] as spark (spark)}
				<span class="spark" aria-hidden="true">✦</span>
			{/each}
		</a>
	</div>
</div>

<style>
	.card {
		display: grid;
		gap: var(--size-4);
		padding: var(--size-5);
		border: var(--border-size-1) solid var(--surface-3);
		border-radius: var(--radius-3);
		background: var(--surface-2);
	}

	.status {
		display: inline-flex;
		align-items: center;
		gap: var(--size-2);
		justify-self: start;
		padding: var(--size-1) var(--size-3);
		border: var(--border-size-1) solid var(--brand);
		border-radius: var(--radius-round);
		font-family: var(--font-label);
		font-size: var(--font-size-0);
		color: var(--brand);
	}

	.dot {
		position: relative;
		inline-size: 0.6rem;
		block-size: 0.6rem;
		border-radius: 50%;
		background: var(--brand);
	}

	.who {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--size-4);
	}

	.photo {
		flex: none;
		inline-size: 8rem;
		block-size: 8rem;

		& :global(img) {
			inline-size: 100%;
			block-size: 100%;
			object-fit: cover;
			border-radius: 50%;
		}
	}

	.name {
		font-family: var(--font-heading);
		font-size: var(--font-size-5);
		line-height: var(--font-lineheight-1);
		color: var(--brand);
	}

	.tagline,
	.pitch {
		color: var(--text-2);
	}

	.pitch {
		margin-block-start: var(--size-2);
		max-inline-size: 60ch;
	}

	/* The button's own box: the magnet reads the pointer over it. */
	.action {
		justify-self: start;
		padding: var(--size-3);
		margin: calc(-1 * var(--size-3));
	}

	.cta {
		position: relative;
		display: inline-block;
		padding: var(--size-3) var(--size-5);
		border-radius: var(--radius-round);
		background: var(--brand);
		color: var(--surface-1);
		font-family: var(--font-label);
		text-decoration: none;
		translate: var(--mx, 0) var(--my, 0);
		transition: translate 250ms var(--ease-spring-2);
	}

	.spark {
		position: absolute;
		inset-block-start: 50%;
		inset-inline-start: 50%;
		color: var(--brand);
		font-size: var(--font-size-1);
		opacity: 0;
		pointer-events: none;
	}

	@media (prefers-reduced-motion: no-preference) {
		/* A ring that grows out of the dot and fades, again and again. */
		.dot::after {
			content: '';
			position: absolute;
			inset: 0;
			border-radius: 50%;
			background: var(--brand);
			animation: ping 1.8s var(--ease-out-3) infinite;
		}

		/* Hovering the photo: a short glitch, the picture split into red and cyan. */
		.photo:hover :global(img) {
			animation: glitch 500ms steps(1) 2;
		}

		/* Sparkles fly out of the button while it's hovered, each its own way and time. */
		.cta:is(:hover, :focus-visible) .spark {
			animation: spark 900ms var(--ease-out-3) var(--delay) infinite;
		}
	}

	.spark:nth-of-type(1) {
		--x: -3.5rem;
		--y: -1.6rem;
		--delay: 0ms;
	}
	.spark:nth-of-type(2) {
		--x: 3.6rem;
		--y: -1.8rem;
		--delay: 120ms;
	}
	.spark:nth-of-type(3) {
		--x: -4.2rem;
		--y: 1.2rem;
		--delay: 240ms;
	}
	.spark:nth-of-type(4) {
		--x: 4.4rem;
		--y: 1.4rem;
		--delay: 360ms;
	}
	.spark:nth-of-type(5) {
		--x: 0rem;
		--y: -2.4rem;
		--delay: 480ms;
	}
	.spark:nth-of-type(6) {
		--x: 0.6rem;
		--y: 2.2rem;
		--delay: 600ms;
	}

	@keyframes ping {
		to {
			scale: 2.6;
			opacity: 0;
		}
	}

	@keyframes glitch {
		0% {
			filter: url(#palette-rgb-split);
			translate: -3px 0;
		}
		25% {
			filter: none;
			translate: 2px 1px;
		}
		50% {
			filter: url(#palette-rgb-split);
			translate: 3px -1px;
		}
		75% {
			filter: none;
			translate: 0;
		}
	}

	@keyframes spark {
		0% {
			opacity: 0;
			transform: translate(-50%, -50%) scale(0.4);
		}
		30% {
			opacity: 1;
		}
		100% {
			opacity: 0;
			transform: translate(calc(-50% + var(--x, 0)), calc(-50% + var(--y, 0))) scale(1.1)
				rotate(90deg);
		}
	}
</style>
