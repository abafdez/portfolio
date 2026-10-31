---
title: A sticky intro, a scroll-spy nav and snapping on the landing
date: 2026-10-31
phase: 4.5
tags: [css, layout, intersection-observer, scroll-snap]
---

## What we did

- Two columns on the home page from 64rem: the intro (the Hero plus an in-page nav) stays in place on the left while the sections scroll on the right. One column below that.
- New `SectionNav.svelte`: an in-page nav that highlights the section being read (a scroll-spy), with `aria-current="location"`, a longer line and the brand color.
- A `--header-space` token and `scroll-padding-block-start` on `html`, so the sticky intro and in-page jumps stop below the sticky header.
- `proximity` scroll snapping on the sections, only on wide screens and without a reduced-motion preference.
- Each section's content fades in as it scrolls into view (a `view()` timeline).
- Tested on the built site at 1280×800, 1280×700, 320px, both themes and reduced motion.

## What I learned

- `position: sticky` inside a grid needs `align-items: start`. By default grid items stretch to the row's height, and an element as tall as its container has nowhere to stick.
- A sticky element taller than the screen never shows its bottom. So the intro is only sticky on screens at least 45rem tall.
- `IntersectionObserver` with `rootMargin: '-33% 0px -67% 0px'` shrinks what it watches to a thin line a third of the way down the screen. Whichever section crosses that line is the current one.
- Setting state inside `$effect` is usually a smell, but here the value comes from outside Svelte (the observer's callback), so it can't be a `$derived`.
- `scroll-padding` tells the browser the top of the visible area is lower than it looks. Without it, a jump to `#projects` puts the heading under the sticky header.
- `proximity` snaps only when you stop near a snap point; `mandatory` always snaps and fights you on long sections.
- A page's CSS stays loaded after you leave it. So the snapping rule is `html:has(.landing)`, not `html`: it only matches while the landing is on screen.
- One animation per element: the sections already run a time-based entrance, so the scroll-driven reveal goes on their `.grid`.

## Problems & fixes

- The intro was 689px tall: in a narrow 2fr column every link button wrapped onto its own row. Equal columns fixed it (589px).
- The page loaded scrolled down 50px. With proximity snapping, the first section was the nearest snap point on load, so the browser jumped to it. Making the top of the landing a snap point too fixed it.
- I guessed the header at 5rem; it's 98px (about 6.1rem). `--header-space` is now 6.5rem.

## Links

- [MDN: position: sticky](https://developer.mozilla.org/docs/Web/CSS/position#sticky_positioning)
- [MDN: Intersection Observer API](https://developer.mozilla.org/docs/Web/API/Intersection_Observer_API)
- [MDN: scroll-snap-type](https://developer.mozilla.org/docs/Web/CSS/scroll-snap-type)
- [MDN: scroll-padding](https://developer.mozilla.org/docs/Web/CSS/scroll-padding)
- [MDN: :has()](https://developer.mozilla.org/docs/Web/CSS/:has)
- [brittanychiang.com](https://brittanychiang.com), the inspiration for the layout

## Next

- Real content on the landing, so the layout can be judged (on `feat/content`).
- View transitions between routes.
