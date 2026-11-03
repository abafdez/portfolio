<script lang="ts">
	import favicon from '#lib/assets/favicon.svg';
	// Self-hosted fonts: Vite copies the .woff2 files into build/. Browsers only
	// download a font when text on the page uses it.
	import '@fontsource-variable/fira-code';
	import '@fontsource-variable/shantell-sans';
	import '#lib/styles/tokens.css';
	import '#lib/styles/global.css';
	import type { Snippet } from 'svelte';
	import { afterNavigate, onNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { canTransition } from '#lib/view-transitions.ts';
	import Header from '#lib/components/Header.svelte';
	import Footer from '#lib/components/Footer.svelte';
	import Blueprint from '#lib/components/Blueprint.svelte';

	let { children }: { children: Snippet } = $props();

	// Route changes run inside a view transition of type "route": the header stays put,
	// the nav marker slides to the new link and the page content fades in (the CSS is
	// in global.css). onNavigate runs just before SvelteKit swaps the page.
	// Shallow navigations (a tool updating its URL params) run it too, but don't swap the
	// page, so there's nothing to animate.
	onNavigate((navigation) => {
		// No smooth scrolling while SvelteKit moves to the new page (see global.css).
		delete document.documentElement.dataset.smoothScroll;
		if (navigation.shallow || !canTransition()) return;

		// SvelteKit waits for this promise before it updates the page.
		return new Promise<void>((resolve) => {
			document.startViewTransition({
				// The browser takes its "before" picture, then calls update(). resolve() lets
				// SvelteKit swap the page, and the "after" picture waits until it's done.
				update: async () => {
					resolve();
					await navigation.complete;
				},
				types: ['route']
			});
		});
	});

	// Smooth scrolling back on once a page is in place and SvelteKit has scrolled it:
	// after the first load (including a reload's jump back down) and after each
	// navigation. A frame later, so that jump is already done.
	afterNavigate(() => {
		requestAnimationFrame(() => (document.documentElement.dataset.smoothScroll = ''));
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>
<Blueprint />
<Header />
<!-- Each route picks its composition in its load data (see App.PageData). -->
<main data-composition={page.data.composition ?? 'default'}>{@render children()}</main>
<Footer />
