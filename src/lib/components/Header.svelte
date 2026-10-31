<script lang="ts">
	import { resolve } from '$app/paths';
	import Nav from '#lib/components/Nav.svelte';
	import ThemeToggle from '#lib/components/ThemeToggle.svelte';
</script>

<header>
	<div class="inner">
		<a class="site-name" href={resolve('/')}>Alfonso Baeza</a>
		<div class="nav"><Nav /></div>
		<div class="toggle"><ThemeToggle duration={500} blur={50} /></div>
	</div>
</header>

<style>
	header {
		padding: var(--size-2);
	}

	/* The floating bar: see-through background, blurred, with a border and shadow.
	   This is the end state of the detach animation below, and the look everywhere
	   that animation doesn't run. */
	.inner {
		border: var(--border-size-1) solid var(--surface-3);
		border-radius: var(--radius-3);
		background-color: color-mix(in oklch, var(--surface-1) 75%, transparent);
		backdrop-filter: blur(12px);
		box-shadow: var(--shadow-float);
	}

	/* Sticky only on wide screens: on phones the header is two rows tall and would
	   eat too much of the screen. */
	@media (min-width: 48rem) {
		header {
			position: sticky;
			inset-block-start: 0;
			z-index: 1;
		}
	}

	/* Scroll-driven animation: the timeline is the page's scroll position, not time.
	   At the top the bar sits flat with the page; over the first 6rem of scrolling it
	   lifts off into the floating bar. animation-range says where 0% and 100% are. */
	@supports (animation-timeline: scroll()) {
		@media (prefers-reduced-motion: no-preference) {
			.inner {
				animation: header-detach linear both;
				animation-timeline: scroll();
				animation-range: 0 var(--size-10);
			}
		}
	}

	@keyframes header-detach {
		from {
			border-color: transparent;
			border-radius: 0;
			background-color: transparent;
			backdrop-filter: blur(0);
			box-shadow: none;
		}
	}

	/* Narrow: name and toggle on the first row, nav on its own row below.
	   Wide: everything on one row. Same markup, only the grid areas change. */
	.inner {
		display: grid;
		grid-template-areas:
			'name toggle'
			'nav nav';
		grid-template-columns: 1fr auto;
		align-items: center;
		gap: var(--size-2) var(--size-5);
		max-inline-size: var(--content-width);
		margin-inline: auto;
		padding: var(--size-3);
	}

	@media (min-width: 48rem) {
		.inner {
			grid-template-areas: 'name nav toggle';
			grid-template-columns: auto 1fr auto;
		}
	}

	.site-name {
		grid-area: name;
		font-family: var(--font-label);
		font-weight: var(--font-weight-7);
		color: var(--text-1);
		text-decoration: none;
	}

	.nav {
		grid-area: nav;
	}

	.toggle {
		grid-area: toggle;
	}
</style>
