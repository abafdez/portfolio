<script lang="ts">
	import { resolve } from '$app/paths';
	import Nav from '#lib/components/Nav.svelte';
	import ThemeToggle from '#lib/components/ThemeToggle.svelte';
</script>

<header>
	<div class="inner">
		<a class="site-name" href={resolve('/')}>Alfonso Baeza</a>
		<div class="nav"><Nav /></div>
		<div class="toggle"><ThemeToggle /></div>
	</div>
</header>

<style>
	header {
		border-block-end: var(--border-size-1) solid var(--surface-3);
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
