<script lang="ts">
	import favicon from '#lib/assets/favicon.svg';
	// Self-hosted fonts: Vite copies the .woff2 files into build/. Browsers only
	// download a font when text on the page uses it.
	import '@fontsource-variable/fira-code';
	import '@fontsource-variable/shantell-sans';
	import '#lib/styles/tokens.css';
	import '#lib/styles/global.css';
	import type { Snippet } from 'svelte';
	import Header from '#lib/components/Header.svelte';
	import Footer from '#lib/components/Footer.svelte';
	import Blueprint from '#lib/components/Blueprint.svelte';

	let { children }: { children: Snippet } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>
<Blueprint />
<Header />
<main>{@render children()}</main>
<Footer />
