---
title: A scroll-spy that can't fall out of step
date: 2026-11-03
phase: 5
tags: [svelte, javascript, layout]
---

## What we did

- Rewrote the section nav's scroll-spy (`SectionNav.svelte`). It used an IntersectionObserver on a 1px line a third of the way down the screen. Now every scroll works out the current section from where the sections are.
- The landing and `/about` both use it.

## What I learned

- An IntersectionObserver only reports changes: a section starting or stopping to touch the line. A fast scroll could stop with the line in the gap between two sections; nothing touched it, no event came, and the old section stayed highlighted.
- Worked out from positions instead: the current section is the last one whose top (`getBoundingClientRect().top`) is above the line. Gaps don't matter.
- Two edges: before the first section reaches the line, it's already current (on `/about` the logo strip pushed it below the line, and nothing was highlighted at the top); at the very bottom, the last one is current, because a short last section never reaches the line.
- `$effect(update)` runs it once the page is in the DOM, so a reload halfway down is right too. Then `<svelte:window onscroll onresize>`.
- Measuring ten sections per scroll is cheap, and browsers fire `scroll` at most once per frame. An observer only works when something changes, but this can't miss a change.

## Problems & fixes

- Testing with `scrollTo()` read the old section: the site has smooth scrolling, so the page was still moving. Tests set `scroll-behavior: auto` first.

## Links

- [MDN: getBoundingClientRect](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect)
- [Svelte: `<svelte:window>`](https://svelte.dev/docs/svelte/svelte-window)

## Next

- Nothing here. Back to `/about`'s content.
