<script lang="ts">
	// Look 5: an ID card in 3D. It tilts toward the pointer (tilt() in tilt.ts), and its
	// parts sit at different depths, so they come apart as it turns: the photo nearest,
	// then the name, the button, the chip. A foil sheen and a light follow the pointer.
	// On touch, or with reduced motion, it's a flat card.
	import { m } from '#lib/i18n/index.ts';
	import { tilt } from './tilt.ts';
	import type { LookProps } from './looks.ts';

	let { photo, linkedin, github }: LookProps = $props();
</script>

<div class="stage">
	<div class="card" {@attach tilt(14, 140)}>
		<span class="foil" aria-hidden="true"></span>
		<span class="chip" aria-hidden="true"></span>
		<div class="photo">
			<enhanced:img src={photo} alt="" sizes="9rem" />
		</div>
		<div class="text">
			<p class="role">{m.hireRole()}</p>
			<p class="name">Alfonso Baeza</p>
		</div>
		<p class="links">
			<a class="cta" href={linkedin} rel="external">{m.aboutAskLinkedIn()}</a>
			<a href={github} rel="external">GitHub</a>
		</p>
	</div>
	<p class="hint">{m.hireTiltHint()}</p>
</div>

<style>
	/* Room around the card, so its turned corners stay inside the panel. */
	/* position: relative: the card's offsetParent, untilted, which tilt() measures the
	   card against (so the tilt never moves the edges it measures). */
	.stage {
		position: relative;
		display: grid;
		justify-items: center;
		gap: var(--size-3);
		padding: var(--size-3) var(--size-4);
		perspective: 50rem;
	}

	.card {
		position: relative;
		display: grid;
		grid-template-columns: auto 1fr;
		grid-template-areas:
			'photo text'
			'links links';
		align-items: center;
		gap: var(--size-3) var(--size-4);
		inline-size: min(100%, 32rem);
		padding: var(--size-5);
		border: var(--border-size-1) solid var(--surface-3);
		border-radius: var(--radius-3);
		/* Blueprint paper, like the other cards of the site. */
		background:
			linear-gradient(var(--grid-line-major) 1px, transparent 1px) 0 0 / var(--grid-size)
				var(--grid-size),
			linear-gradient(90deg, var(--grid-line-major) 1px, transparent 1px) 0 0 / var(--grid-size)
				var(--grid-size),
			var(--surface-2);
		box-shadow: var(--shadow-float);
		/* The tilt, eased by tilt() on every frame (no CSS transition: it would lag
		   behind and fight the easing). Its children keep their depth (preserve-3d), so
		   nothing in here may clip. */
		transform-style: preserve-3d;
		transform: rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));
	}

	/* Each part a little in front of the card. */
	.photo {
		grid-area: photo;
		transform: translateZ(3.5rem);

		& :global(img) {
			display: block;
			inline-size: 8rem;
			block-size: 8rem;
			object-fit: cover;
			border-radius: var(--radius-2);
			border: var(--border-size-2) solid var(--brand);
			box-shadow: 0 var(--size-3) var(--size-5) color-mix(in oklab, var(--text-1) 20%, transparent);
		}
	}

	.text {
		grid-area: text;
		display: grid;
		gap: var(--size-1);
		transform: translateZ(2.5rem);
	}

	.links {
		grid-area: links;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--size-3);
		transform: translateZ(2rem);
	}

	/* A chip in the corner, like an ID card's. */
	.chip {
		position: absolute;
		inset-block-start: var(--size-4);
		inset-inline-end: var(--size-4);
		inline-size: 2.6rem;
		block-size: 2rem;
		border-radius: var(--radius-2);
		background:
			linear-gradient(
				90deg,
				transparent 45%,
				color-mix(in oklab, var(--text-1) 25%, transparent) 45% 55%,
				transparent 55%
			),
			linear-gradient(
				transparent 45%,
				color-mix(in oklab, var(--text-1) 25%, transparent) 45% 55%,
				transparent 55%
			),
			color-mix(in oklab, var(--window-minimize) 80%, var(--surface-2));
		transform: translateZ(1rem);
	}

	/* A foil sheen across the card, its stripes slid by the pointer (--px), and a light
	   where the pointer is (--px, --py). As strong as the tilt (--tilt, 0 to 1). */
	.foil {
		position: absolute;
		inset: 0;
		border-radius: inherit;
		background:
			radial-gradient(
				circle at var(--px, 50%) var(--py, 50%),
				color-mix(in oklab, var(--brand) 22%, transparent),
				transparent 45%
			),
			linear-gradient(
					115deg,
					transparent 30%,
					color-mix(in oklab, var(--brand) 18%, transparent) 45%,
					color-mix(in oklab, var(--code-function) 14%, transparent) 52%,
					color-mix(in oklab, var(--code-keyword) 14%, transparent) 58%,
					transparent 72%
				)
				calc(100% - var(--px, 50%)) 0 / 250% 100%;
		opacity: var(--tilt, 0);
		pointer-events: none;
	}

	.role {
		font-family: var(--font-label);
		font-size: var(--font-size-0);
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: var(--text-2);
	}

	.name {
		font-family: var(--font-heading);
		font-size: var(--font-size-5);
		line-height: var(--font-lineheight-1);
		color: var(--brand);
	}

	.cta {
		padding: var(--size-2) var(--size-4);
		border-radius: var(--radius-round);
		background: var(--brand);
		color: var(--surface-1);
		font-family: var(--font-label);
		text-decoration: none;
	}

	/* Narrow: the photo on top of the text. */
	@media (max-width: 30rem) {
		.card {
			grid-template-columns: 1fr;
			grid-template-areas: 'photo' 'text' 'links';
		}
	}

	/* "Move the pointer over the card": only where there's a pointer to move. */
	.hint {
		display: none;
		font-family: var(--font-label);
		font-size: var(--font-size-0);
		color: var(--text-2);
	}

	@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
		.hint {
			display: block;
		}

		/* It arrives turning in from the side. */
		.card {
			animation: card-in 800ms var(--ease-spring-2) both;
		}
	}

	@keyframes card-in {
		from {
			opacity: 0;
			transform: rotateY(-35deg) rotateX(10deg) translateZ(-4rem);
		}
	}
</style>
