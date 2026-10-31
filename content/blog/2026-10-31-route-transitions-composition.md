---
title: 'Page transitions in SvelteKit, and letting each route pick its layout'
date: 2026-10-31
tags: [sveltekit, view-transitions, css, typescript]
draft: true
description: View transitions between routes with onNavigate, a nav marker that slides to the new page, and a typed way for each route to tell the root layout how to arrange it.
---

My theme toggle already used a [view transition](./2026-10-30-theme-toggle-view-transition). This post adds them between pages: the header stays still, the content fades into the new page, and the green bar under the current nav link slides to the new one. Then a small system for each route to choose its own layout, which the transition handles for free.

<!-- TODO: a short video clicking through the nav -->

## Starting the transition

SvelteKit routes in the browser, without reloading the page, so the browser can't know when a "page change" happens. SvelteKit tells us with `onNavigate`:

```ts
onNavigate((navigation) => {
	if (!canTransition()) return;

	return new Promise<void>((resolve) => {
		document.startViewTransition({
			update: async () => {
				resolve();
				await navigation.complete;
			},
			types: ['route']
		});
	});
});
```

The order of events is the tricky part:

1. `onNavigate` runs just before SvelteKit swaps the page. It returns a promise, and SvelteKit waits for it.
2. `startViewTransition` takes a picture of the old page, then calls `update()`.
3. `update()` resolves the promise, so SvelteKit swaps the page, and waits for `navigation.complete`.
4. The browser takes the "after" picture and animates between the two.

`canTransition()` checks the browser supports transition types and the visitor hasn't asked for reduced motion. My CSS safety net for reduced motion can't help here: `*` doesn't match the `::view-transition-*` pseudo-elements.

## Naming things, but only sometimes

By default the whole page cross-fades. `view-transition-name` gives an element its own pair of pictures, so it can animate differently:

```css
:root:active-view-transition-type(route) {
	& header {
		view-transition-name: site-header;
	}

	& main {
		view-transition-name: page;
	}
}
```

The names only exist during `route` transitions. My theme toggle's circular reveal animates the root picture, and a named element is cut out of the root. With a permanent name, the header would sit outside the circle and change theme on its own.

Then the content: the old page fades out fast, the new one fades in and rises a little.

```css
&::view-transition-old(page) {
	animation: route-out 150ms ease-in both;
}

&::view-transition-new(page) {
	animation: route-in 300ms var(--ease-out-3) both;
}
```

<!-- TODO: the durations I tried, and what felt right -->

## The sliding marker

The current nav link used to have a thick underline. An underline is part of the text, so it can't move between links. So I made it an element:

```svelte
<a href={resolve(link.href)} aria-current={current ? 'page' : undefined}>
	{link.label}
	{#if current}
		<span class="marker" aria-hidden="true"></span>
	{/if}
</a>
```

There's only one marker on each page. During a route transition it's named `nav-marker`, so the browser pairs the old one with the new one and moves it from the old link's position to the new one's.

## Each route picks its composition

The blog and the Bitácora are long text, and long lines are hard to read. I wanted a narrow column there, but `<main>` belongs to the root layout, and a page's styles can't reach it. So the page sends the layout a piece of data instead.

The type goes in `src/app.d.ts`, so it's known everywhere:

```ts
interface PageData {
	composition?: 'default' | 'reading';
}
```

A route sets it in its `+layout.ts`, which covers the route and everything below it:

```ts
export const load: LayoutLoad = () => ({ composition: 'reading' }) satisfies App.PageData;
```

`satisfies` checks the value against the type and keeps `'reading'` as that exact string. Without it, TypeScript would widen it to `string`.

The root layout reads it and the CSS does the rest:

```svelte
<main data-composition={page.data.composition ?? 'default'}>{@render children()}</main>
```

```css
main[data-composition='reading'] {
	max-inline-size: var(--size-content-3);
}
```

Going from the home page (1120px wide) to the blog (60 characters wide) needed nothing extra in the transition: the content box jumps to its new size and the new content fades in. The one catch was the old picture. By default it's stretched to the new size, so a wide page got squeezed as it faded out. Giving it its own size, centered where it was, fixed it:

```css
&::view-transition-old(page) {
	inline-size: auto;
	block-size: auto;
	inset-inline-start: 50%;
	translate: -50% 0;
}
```

## A bug this found

While testing, the home page's `main` was 876px wide instead of 1120px. In my body's grid, `margin-inline: auto` stops an item from stretching, so `main` shrank to fit its content. Every page was as wide as its text. `inline-size: 100%` next to `max-inline-size` fixed it, and now a composition really decides the width.

## Links

- [SvelteKit: onNavigate](https://svelte.dev/docs/kit/$app-navigation#onNavigate)
- [Svelte blog: Unlocking view transitions in SvelteKit](https://svelte.dev/blog/view-transitions)
- [MDN: view-transition-name](https://developer.mozilla.org/docs/Web/CSS/view-transition-name)
