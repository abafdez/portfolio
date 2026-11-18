<script lang="ts">
	// Look 3: a business card. It flips in when the panel opens; the button (or a click on
	// the card) turns it over: the front has the photo, name and role, the back how to
	// hire me and my links. The face turned away is inert: no focus, no screen reader.
	import RotateCw from '@lucide/svelte/icons/rotate-cw';
	import { m } from '#lib/i18n/index.ts';
	import type { LookProps } from './looks.ts';

	let { photo, linkedin, github }: LookProps = $props();
	let back = $state(false);

	// A click anywhere on the card turns it, except on its links and button.
	function turn(event: MouseEvent) {
		if ((event.target as HTMLElement).closest('a, button')) return;
		back = !back;
	}
</script>

<div class="scene">
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions:
	     the click is a shortcut for the mouse; the Turn button does the same from the keyboard. -->
	<div class="holder" onclick={turn}>
		<div class="card" class:back>
			<div class="face front" inert={back}>
				<enhanced:img src={photo} alt="" sizes="7rem" />
				<div>
					<p class="name">Alfonso Baeza</p>
					<p class="role">{m.hireRole()}</p>
				</div>
			</div>
			<div class="face rear" inert={!back}>
				<p class="name">{m.footerHire()}</p>
				<p>{m.footerHireText()}</p>
				<p class="links">
					<a class="cta" href={linkedin} rel="external">{m.aboutAskLinkedIn()}</a>
					<a href={github} rel="external">GitHub</a>
				</p>
			</div>
		</div>
	</div>
	<button type="button" class="turn" aria-pressed={back} onclick={() => (back = !back)}>
		<RotateCw aria-hidden="true" />
		{m.hireFlip()}
	</button>
</div>

<style>
	.scene {
		display: grid;
		justify-items: center;
		gap: var(--size-3);
	}

	.holder {
		position: relative;
		inline-size: min(100%, 34rem);
		border-radius: var(--radius-3);
		cursor: pointer;
	}

	/* Both faces in the same grid cell, the rear one turned away; the card turns. */
	.card {
		display: grid;
		transform-style: preserve-3d;
		transition: rotate 700ms var(--ease-spring-2);

		&.back {
			rotate: y 180deg;
		}
	}

	.face {
		grid-area: 1 / 1;
		display: grid;
		align-content: center;
		gap: var(--size-2);
		min-block-size: 14rem;
		padding: var(--size-5);
		border: var(--border-size-1) solid var(--surface-3);
		border-radius: var(--radius-3);
		backface-visibility: hidden;
		/* A sheet of blueprint paper: the card's colour with the grid printed on it. */
		background:
			linear-gradient(var(--grid-line-major) 1px, transparent 1px) 0 0 / var(--grid-size)
				var(--grid-size),
			linear-gradient(90deg, var(--grid-line-major) 1px, transparent 1px) 0 0 / var(--grid-size)
				var(--grid-size),
			var(--surface-2);
		box-shadow: var(--shadow-float);
	}

	.front {
		grid-template-columns: auto 1fr;
		align-items: center;
		gap: var(--size-4);

		& :global(img) {
			inline-size: 7rem;
			block-size: 7rem;
			object-fit: cover;
			border-radius: var(--radius-2);
			border: var(--border-size-2) solid var(--brand);
		}
	}

	.rear {
		rotate: y 180deg;
	}

	.name {
		font-family: var(--font-heading);
		font-size: var(--font-size-4);
		color: var(--brand);
	}

	.role {
		font-family: var(--font-label);
		font-size: var(--font-size-0);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--text-1);
	}

	.links {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--size-3);
	}

	.cta {
		padding: var(--size-2) var(--size-4);
		border-radius: var(--radius-round);
		background: var(--brand);
		color: var(--surface-1);
		font-family: var(--font-label);
		text-decoration: none;
	}

	.turn {
		display: inline-flex;
		align-items: center;
		gap: var(--size-2);
		padding: var(--size-1) var(--size-3);
		border: var(--border-size-1) solid var(--surface-3);
		border-radius: var(--radius-round);
		background: var(--surface-1);
		color: var(--text-1);
		font-family: var(--font-label);
		font-size: var(--font-size-0);
		cursor: pointer;

		& :global(svg) {
			inline-size: 1rem;
			block-size: 1rem;
		}
	}

	/* It arrives turning over, from its back to its front. */
	@media (prefers-reduced-motion: no-preference) {
		.holder {
			animation: card-in 900ms var(--ease-spring-2) both;
		}
	}

	@keyframes card-in {
		from {
			opacity: 0;
			transform: perspective(60rem) rotateY(-180deg) scale(0.9);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.card {
			transition: none;
		}
	}
</style>
