---
title: Responsive layout with grid and container queries
date: 2026-10-29
phase: 4
tags: [css, grid, container-queries, responsive]
---

## What we did

- Hero: a container query switches it to two columns (photo beside text) when the hero is at least 36rem wide.
- Card grid: `repeat(auto-fit, minmax(min(100%, 16rem), 1fr))`, with no media queries.
- Header: grid areas. On narrow screens the name and theme toggle share a row and the nav goes below. On wide screens everything is on one row.
- Footer: copyright on one side, profile links on the other. It sits at the bottom of short pages.
- Added a `--content-width` token shared by the header, main and footer.
- Tested at 320px and 1280px: no horizontal scroll.

## What I learned

- A media query asks about the screen. A container query asks about the container, so a component adapts to the space it's given, wherever it's placed.
- An element can't query its own size. The `<section>` is the container (`container-type: inline-size`) and the inner `.layout` is what changes.
- `auto-fill` keeps empty columns. `auto-fit` collapses them, so 3 cards stretch to fill a 4-column row.
- `min(100%, 16rem)` stops a card overflowing on screens narrower than 16rem.
- Grid areas change the layout without changing the markup.
- Sticky footer: `body { display: grid; grid-template-rows: auto 1fr auto }`. It works because the wrapper div in `app.html` is `display: contents`. SvelteKit's announcer is `position: absolute`, so it doesn't take a row.
- Fluid type: `--font-size-fluid-3` is `clamp(2rem, 9vw, 3.5rem)`. It grows between those sizes with no breakpoints.
- The current nav link uses color and a thick underline, so it doesn't rely on color alone.

## Problems & fixes

- At 320px the page scrolled sideways. The Phase 2 nav was a flex row that couldn't wrap. Added `flex-wrap: wrap`.
- The photo stayed 128px on desktop. I had put the `@container` rule above the base `.photo` rule. `@container` (like `@media`) adds no specificity, so the two rules tied and the later one won. Base rules first, then the container rule.
- `vite preview` reads the list of files when it starts. After a rebuild it can serve stale or missing assets, so restart it.

## Links

- [MDN: Container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries)
- [MDN: auto-fill vs auto-fit](https://developer.mozilla.org/en-US/docs/Web/CSS/repeat#auto-fill)
- [MDN: grid-template-areas](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-areas)

## Next

- Phase 5 CV page: needs top spacing for page content (the CV page's `h1` touches the header).
