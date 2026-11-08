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
	import { cardLinkingTo, mark, pageHeader, picturesReady, unmarkAll } from '#lib/morph.ts';
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
	let routeTransitions = 0;

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

		// A card opening its page: the card's parts fly into the page's header (morph.ts).
		// Coming back from the page (Back, the breadcrumbs), the header flies into its card.
		// Which card is only known once the list is on screen again, so the other end is
		// marked in update(), before the browser takes its "after" picture.
		const card = cardLinkingTo(navigation.to?.url);
		const header = card ? null : pageHeader();
		// Marks a skipped transition left behind would give two elements the same name.
		unmarkAll();
		mark(card ?? header);

		// Where the page's content starts on screen now. The old content's picture is
		// placed where the new content starts, which is far off when the new page scrolls
		// somewhere else (Back restores the list's scroll position), so it's moved back by
		// the difference (--route-shift, read in global.css).
		const root = document.documentElement;
		const top = () => document.querySelector('main')?.getBoundingClientRect().top ?? 0;
		const oldTop = top();

		// SvelteKit waits for this promise before it updates the page.
		return new Promise<void>((resolve) => {
			const transition = document.startViewTransition({
				// The browser takes its "before" picture, then calls update(). resolve() lets
				// SvelteKit swap the page, and the "after" picture waits until it's done.
				update: async () => {
					resolve();
					await navigation.complete;
					root.style.setProperty('--route-shift', `${oldTop - top()}px`);
					const other = card ? pageHeader() : header && cardLinkingTo(navigation.from?.url);
					mark(other);
					await picturesReady(other);
				},
				types: card || header ? ['route', 'morph'] : ['route']
			});
			// A click during a transition skips it, and its clean-up would remove the marks
			// the next one has just set: only the latest one cleans up.
			const mine = ++routeTransitions;
			transition.finished.finally(() => {
				if (mine !== routeTransitions) return;
				unmarkAll();
				root.style.removeProperty('--route-shift');
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
