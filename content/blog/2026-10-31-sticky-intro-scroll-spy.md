---
title: 'A sticky intro with a scroll-spy nav, and gentle scroll snapping'
date: 2026-10-31
tags: [css, layout, intersection-observer, scroll-snap, svelte]
draft: true
description: My home page keeps the intro in view while the sections scroll past, and a small nav shows which section you're reading. position sticky, one IntersectionObserver, and proximity snapping that only applies to one page.
---

I love the layout of [Brittany Chiang's site](https://brittanychiang.com): on a wide screen, the intro stays on the left while the content scrolls on the right, and a small nav under the intro lights up the section you're reading. This post is how I built my version: the sticky column, the scroll-spy, and some gentle snapping.

<!-- TODO: a short video of scrolling the home page on desktop -->

## The sticky column

From 64rem wide, the page is a two-column grid:

```css
@media (min-width: 64rem) {
	.landing {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--size-9);
		align-items: start;
	}
}

@media (min-width: 64rem) and (min-height: 45rem) {
	.intro {
		position: sticky;
		inset-block-start: var(--header-space);
	}
}
```

Two details took me a while:

- **`align-items: start`.** Grid items stretch to the height of their row by default. The row is as tall as the scrolling column, so the intro would be just as tall, and a sticky element as tall as its container has nowhere to stick.
- **`min-height: 45rem`.** A sticky element taller than the screen never shows its bottom part. The intro is about 590px tall, plus the header, so on shorter screens it just scrolls normally.

`--header-space` is the room the sticky header takes. The same token goes into `scroll-padding-block-start` on `html`, which tells the browser the visible area starts below the header. Without it, clicking a link to `#projects` scrolls the heading right under the header.

## The scroll-spy

The nav is a list of in-page links. Without JavaScript they still jump to their sections; JavaScript only adds the highlight.

```svelte
<script lang="ts">
	let { sections }: { sections: Section[] } = $props();
	let current = $state<string>();

	$effect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) current = entry.target.id;
				}
			},
			{ rootMargin: '-33% 0px -67% 0px' }
		);

		for (const { id } of sections) {
			const section = document.getElementById(id);
			if (section) observer.observe(section);
		}

		return () => observer.disconnect();
	});
</script>
```

The trick is `rootMargin`. It shrinks the area the observer watches: 33% off the top and 67% off the bottom leaves a thin line a third of the way down the screen. A section "intersects" while it crosses that line, so exactly one section is current at a time.

The current link gets `aria-current="location"`, the value meant for "where you are inside this page", next to `"page"` for the current page in the main nav.

Svelte's tools warn about setting state inside `$effect`, and usually they're right: most of the time the value could be a `$derived`. Here it can't, because the value comes from outside Svelte. The browser calls the observer's callback when you scroll, and an effect is the place to connect to things like that.

<!-- TODO: what I tried for rootMargin, and why a third of the way down -->

## Snapping, but gently

Julibe's site snaps each section into place when you stop scrolling. I wanted a softer version:

```css
@media (min-width: 64rem) and (prefers-reduced-motion: no-preference) {
	:global(html:has(.landing)) {
		scroll-snap-type: y proximity;
	}

	.landing,
	section {
		scroll-snap-align: start;
	}
}
```

- **`proximity`, not `mandatory`.** It only snaps when you stop near a section. `mandatory` always snaps, and on a section taller than the screen it fights you.
- **`:has(.landing)`.** Snapping is set on `html`, but SvelteKit keeps a page's CSS loaded after you navigate away. A plain `html` rule would make every page snap. With `:has()`, it only matches while the landing is on the page.
- **`.landing` is a snap point too.** My first version jumped 50px down on load: the top of the page wasn't a snap point, so the browser snapped to the nearest one, the first section.
- **Reduced motion.** Snapping moves the page by itself, so it's off for people who asked for less motion.

## Reveals

Each section's cards are wiped in from the top as they scroll into view, like a terminal printing lines. It's a scroll-driven animation on a `view()` timeline (I explained those in [the header and footer post](./2026-10-31-scroll-driven-header-footer)):

```css
@keyframes reveal {
	from {
		clip-path: inset(0 0 100% 0);
		translate: 0 var(--size-6);
	}
	to {
		clip-path: inset(0);
	}
}
```

It's on the cards' grid, not the section, because the section already runs a time-based entrance, and two `animation` declarations on one element replace each other.

My first version faded in from `opacity: 0`, and Lighthouse's accessibility score dropped to 95. Lighthouse checks the page in a phone-sized window right after it loads. Content below the fold hadn't been revealed yet, so it measured faded text at 1.86:1 contrast. Nobody actually sees it like that, but a wipe hides the content instead of fading it, so there's no faded text to measure, and the score went back to 100.

Next: [transitions between pages](./2026-10-31-route-transitions-composition).
