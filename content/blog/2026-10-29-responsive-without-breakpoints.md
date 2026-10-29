---
title: Responsive layouts with (almost) no media queries
date: 2026-10-29
tags: [css, grid, container-queries, responsive]
draft: true
description: Card grids that pick their own column count, a hero that adapts to its container instead of the screen, and a header that rearranges itself with grid areas.
---

My portfolio's home page has to work from a 320px phone to a wide desktop. I ended up with a single media query in the whole page. Here's how.

## A card grid that picks its own columns

```css
.grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
	gap: var(--size-4);
}
```

From the inside out:

- `minmax(16rem, 1fr)`: each column is at least 16rem, and columns share any extra space.
- `repeat(auto-fit, …)`: make as many columns as fit.
- `min(100%, 16rem)`: on a screen narrower than 16rem, a column is just 100% wide instead of overflowing.

**`auto-fill` vs `auto-fit`:** my first version used `auto-fill`. On desktop, that created 4 columns for 3 cards and left the 4th one empty. `auto-fit` collapses empty columns, so the 3 cards stretch to fill the row.

## Container queries: adapt to the space, not the screen

The hero shows my photo above the text on narrow screens and beside it on wide ones. A media query would ask "how wide is the screen?". But the hero might end up in a sidebar one day. The question that matters is "how wide is the space I'm in?". That's a container query:

```css
.hero {
	container-type: inline-size;
}

.layout {
	display: grid;
	gap: var(--size-5);
}

@container (min-width: 36rem) {
	.layout {
		grid-template-columns: auto 1fr;
	}
}
```

**An element can't query its own size.** That's why there are two elements: `.hero` is the container, and `.layout` inside it is what changes.

## A bug that taught me something

The photo is 8rem by default and 12rem in the wide layout. After a refactor, it stayed 8rem everywhere. I had written:

```css
@container (min-width: 36rem) {
	.photo {
		inline-size: 12rem;
	}
}

.photo {
	inline-size: 8rem; /* ❌ comes later, so it wins */
}
```

`@container`, like `@media`, **adds no specificity**. Both rules are just `.photo`, so they tie, and the one that comes later wins. The fix is to put base rules first and the conditional rules after.

## A header that rearranges itself

On a phone I want the site name and theme toggle on the first row and the nav on its own row below. On desktop, everything is on one row. Grid areas do this without touching the markup:

```css
.inner {
	display: grid;
	grid-template-areas:
		'name toggle'
		'nav nav';
	grid-template-columns: 1fr auto;
}

@media (min-width: 48rem) {
	.inner {
		grid-template-areas: 'name nav toggle';
		grid-template-columns: auto 1fr auto;
	}
}
```

That's the one media query. The header always spans the full page, so asking about the screen is fine here.

## A footer that stays at the bottom

On short pages the footer floated halfway up the screen. The fix is three rows on `body`:

```css
body {
	min-block-size: 100dvh;
	display: grid;
	grid-template-rows: auto 1fr auto; /* header, main, footer */
}
```

SvelteKit wraps the page in a `<div style="display: contents">`. That div doesn't create a box of its own, so the header, main and footer count as the body's grid items.

## Fluid type

The hero heading uses Open Props' `--font-size-fluid-3`, which is `clamp(2rem, 9vw, 3.5rem)`. It grows smoothly with the viewport between those two sizes, with no breakpoints at all.

## Testing

I checked every change at 320px and 1280px with one question: does the page scroll sideways? That check caught an old bug: my nav was a flex row that couldn't wrap. `flex-wrap: wrap` fixed it.
