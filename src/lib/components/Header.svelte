<script lang="ts">
	import { resolve } from '$app/paths';
	import Nav from '#lib/components/Nav.svelte';
	import ThemeToggle from '#lib/components/ThemeToggle.svelte';
</script>

<header>
	<a href={resolve('/')}>
		<span>Alfonso Baeza</span>
	</a>
	<Nav />
	<ThemeToggle />
</header>

<style>
	header {
		padding: var(--size-2);
	}
</style>
