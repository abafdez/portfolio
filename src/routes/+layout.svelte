<script lang="ts">
	import favicon from '#lib/assets/favicon.svg';
	// Self-hosted fonts: Vite copies the .woff2 files into build/. Browsers only
	// download a font when text on the page uses it.
	import '@fontsource-variable/fira-code';
	import '@fontsource-variable/shantell-sans';
	import '#lib/styles/tokens.css';
	// Colour themes: each file overrides the tokens under [data-palette] (palettes.ts).
	// A glob, so a new theme is a new file here and an entry in palettes.ts.
	import.meta.glob('/src/lib/styles/themes/*.css', { eager: true });
	import '#lib/styles/global.css';
	import type { Snippet } from 'svelte';
	import { afterNavigate, onNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { canTransition } from '#lib/view-transitions.ts';
	import { getLocale, languageTags } from '#lib/i18n/index.ts';
	import { split } from '#lib/i18n/locales.ts';
	import { transitionPalette } from '#lib/palette-transitions.ts';
	import Header from '#lib/components/Header.svelte';
	import Footer from '#lib/components/Footer.svelte';
	import Blueprint from '#lib/components/Blueprint.svelte';
	import Breadcrumbs from '#lib/components/Breadcrumbs.svelte';

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

		// The same page in the other language: the whole page changes in place, like a
		// colour theme, so it gets the colour themes' effects (palette-transitions.ts),
		// starting from the language switch.
		const language = (url?: URL) => url && split(url.pathname).locale;
		if (language(navigation.from?.url) !== language(navigation.to?.url)) {
			const button = document.querySelector('[data-language-switch]')?.getBoundingClientRect();
			const origin = button
				? { x: button.left + button.width / 2, y: button.top + button.height / 2 }
				: { x: innerWidth, y: 0 };
			return new Promise<void>((resolve) => {
				transitionPalette(async () => {
					resolve();
					await navigation.complete;
				}, origin);
			});
		}

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

	// The server writes <html lang> (hooks.server.ts), but a link to the other language
	// is a client-side navigation: the HTML isn't loaded again, so update it here.
	$effect(() => {
		document.documentElement.lang = languageTags[getLocale()];
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>
<Blueprint />
<Header />
<!-- Each route picks its composition in its load data (see App.PageData). -->
<main data-composition={page.data.composition ?? 'default'}>
	<Breadcrumbs />
	<!-- /blog and /es/blog are the same route, so switching language keeps the page's
	     component and only updates its template: anything a component worked out once
	     in its <script> would stay in the old language. A new key builds it again. -->
	{#key getLocale()}
		{@render children()}
	{/key}
</main>
<Footer />
