---
title: Smooth scrolling, but not when SvelteKit navigates
date: 2026-11-03
phase: 5
tags: [sveltekit, css, scroll]
---

## What we did

- Going to another page started it where the old page was scrolled, then it glided up to the top. A reload halfway down glided back down too. Now a new page starts at the top, and a reload jumps straight back.
- `scroll-behavior: smooth` only applies under `html[data-smooth-scroll]`. The layout removes the attribute in `onNavigate` and sets it again one frame after `afterNavigate`.

## What I learned

- `scroll-behavior: smooth` on `html` affects every scroll that doesn't say otherwise, including SvelteKit's own: the jump to the top of a new page, and the jump back to where you were after a reload. Smooth turned both into glides.
- `onNavigate` runs before a navigation; `afterNavigate` runs after it, and also after the first load. SvelteKit has scrolled by then, so a `requestAnimationFrame` later it's safe to turn smooth scrolling back on.
- Links inside a page (the "on this page" nav, the footer hint) aren't SvelteKit navigations, so they still glide.
- Measuring helped: sampling `scrollY` every 250ms after a click showed 1047, 389, 1, 0, a glide. After the fix: 1047, 0.

## Links

- [MDN: scroll-behavior](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-behavior)
- [SvelteKit: onNavigate](https://svelte.dev/docs/kit/$app-navigation#onNavigate)
- [SvelteKit: afterNavigate](https://svelte.dev/docs/kit/$app-navigation#afterNavigate)

## Next

- Nothing here.
