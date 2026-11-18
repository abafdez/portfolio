<script lang="ts">
	// Look 2: the photo in a turning brand-coloured ring, a blueprint grid behind it lit
	// where the pointer is, and three numbers that count up. Screen readers get each
	// number once (the counting is aria-hidden).
	import { onMount } from 'svelte';
	import { m } from '#lib/i18n/index.ts';
	import type { LookProps } from './looks.ts';

	let { photo, linkedin }: LookProps = $props();

	const stats = [
		{ value: 15, plus: true, label: m.hireStatYears },
		{ value: 3, plus: false, label: m.hireStatKinds },
		{ value: 2, plus: false, label: m.hireStatLanguages }
	];
	let progress = $state(0); // 0 → 1 while the numbers count up

	onMount(() => {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
			progress = 1;
			return;
		}
		const start = performance.now();
		let frame = requestAnimationFrame(function step(now) {
			const t = Math.min(1, (now - start) / 1200);
			progress = 1 - (1 - t) ** 3; // ease out
			if (t < 1) frame = requestAnimationFrame(step);
		});
		return () => cancelAnimationFrame(frame);
	});

	// The lit spot follows the pointer over the card.
	function follow(event: PointerEvent) {
		const card = event.currentTarget as HTMLElement;
		const box = card.getBoundingClientRect();
		card.style.setProperty('--sx', `${event.clientX - box.left}px`);
		card.style.setProperty('--sy', `${event.clientY - box.top}px`);
	}
</script>

<div class="card" onpointermove={follow} role="presentation">
	<div class="ring">
		<enhanced:img src={photo} alt="" sizes="9rem" />
	</div>
	<div class="text">
		<p class="name">Alfonso Baeza</p>
		<p class="tagline">{m.homeTagline()}</p>
		<ul class="stats">
			{#each stats as { value, plus, label } (label)}
				<li>
					<span class="number" aria-hidden="true"
						>{Math.round(value * progress)}{plus ? '+' : ''}</span
					>
					<span class="visually-hidden">{value}{plus ? '+' : ''}</span>
					<span class="label">{label()}</span>
				</li>
			{/each}
		</ul>
		<a class="cta" href={linkedin} rel="external">{m.aboutAskLinkedIn()}</a>
	</div>
</div>

<style>
	.card {
		--sx: 50%;
		--sy: 50%;
		position: relative;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--size-5);
		padding: var(--size-5);
		overflow: hidden;
		border: var(--border-size-1) solid var(--surface-3);
		border-radius: var(--radius-3);
		background: var(--surface-2);
	}

	/* The blueprint grid, only where the pointer is: the same lines as the page's,
	   in the brand colour, masked to a circle around --sx / --sy. Decoration under the
	   photo side; the text sits on the card's own colour, the grid is faint. */
	.card::before {
		content: '';
		position: absolute;
		inset: 0;
		background-image:
			linear-gradient(var(--grid-spot-line-major) 1px, transparent 1px),
			linear-gradient(90deg, var(--grid-spot-line-major) 1px, transparent 1px);
		background-size: var(--grid-size) var(--grid-size);
		mask-image: radial-gradient(circle 12rem at var(--sx) var(--sy), black, transparent);
		pointer-events: none;
	}

	/* A conic gradient turned by a registered angle: the ring spins without the photo. */
	@property --ring-angle {
		syntax: '<angle>';
		inherits: false;
		initial-value: 0deg;
	}

	.ring {
		--ring-angle: 0deg;
		position: relative;
		flex: none;
		inline-size: 9rem;
		block-size: 9rem;
		padding: 5px;
		border-radius: 50%;
		background: conic-gradient(
			from var(--ring-angle),
			var(--brand),
			transparent 40%,
			var(--brand) 60%,
			transparent
		);

		& :global(img) {
			inline-size: 100%;
			block-size: 100%;
			object-fit: cover;
			border-radius: 50%;
			border: 4px solid var(--surface-2);
		}
	}

	@media (prefers-reduced-motion: no-preference) {
		.ring {
			animation: ring-turn 4s linear infinite;
		}
	}

	@keyframes ring-turn {
		to {
			--ring-angle: 360deg;
		}
	}

	.text {
		position: relative;
		flex: 1 1 18rem;
		display: grid;
		gap: var(--size-2);
	}

	.name {
		font-family: var(--font-heading);
		font-size: var(--font-size-5);
		line-height: var(--font-lineheight-1);
		color: var(--brand);
	}

	.tagline {
		color: var(--text-2);
	}

	.stats {
		display: flex;
		flex-wrap: wrap;
		gap: var(--size-4);
		margin-block: var(--size-2);
		padding: 0;
		list-style: none;
	}

	.stats li {
		display: grid;
		max-inline-size: 11rem;
	}

	.number {
		font-family: var(--font-code);
		font-size: var(--font-size-6);
		line-height: 1;
		color: var(--text-1);
		font-variant-numeric: tabular-nums;
	}

	.label {
		font-size: var(--font-size-0);
		color: var(--text-2);
	}

	.cta {
		justify-self: start;
		padding: var(--size-2) var(--size-4);
		border-radius: var(--radius-round);
		background: var(--brand);
		color: var(--surface-1);
		font-family: var(--font-label);
		text-decoration: none;
	}
</style>
