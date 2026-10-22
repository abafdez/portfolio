<script lang="ts">
	import { resolve } from '$app/paths';
	import Nav from '#lib/components/Nav.svelte';
</script>

<header>
	<a href={resolve('/')}>
		<span>Alfonso Baeza</span>
	</a>
	<Nav />
</header>

<style>
	header {
		padding: var(--size-2);
	}
</style>
