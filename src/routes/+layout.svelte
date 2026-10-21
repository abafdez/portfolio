<script lang="ts">
	import favicon from '#lib/assets/favicon.svg';
	import type { Snippet } from 'svelte';
	import Header from '#lib/components/Header.svelte';
	import Footer from '#lib/components/Footer.svelte';

	let { children }: { children: Snippet } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>
<Header />
<main>{@render children()}</main>
<Footer />
