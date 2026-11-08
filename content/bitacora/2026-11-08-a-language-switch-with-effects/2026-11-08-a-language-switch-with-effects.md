---
title: A language switch with effects
date: 2026-11-08
phase: 10
tags: [i18n, view-transitions, svg]
---

## What we did

- Switching language plays the colour themes' effects (ripple, glitch, scanline, rain, taking turns with the palette picker), from the switch. The root layout's `onNavigate` compares the language of the old and new URL (`split()` from `locales.ts`) and calls `transitionPalette()` instead of the route fade. `transitionPalette()` now takes an async change, so the browser waits for the new page before its "after" picture.
- `data-sveltekit-reset="false"` on the switch: you stay where you were reading. In SvelteKit 3 it replaces `data-sveltekit-noscroll`, which now warns in the console.
- A new icon: the character from Lucide's "languages" icon, with the code of the other language (ES or EN) where the icon has its "A". Pointed at, the two lean towards each other with a spring.

## What I learned

- `onNavigate` can return a promise: SvelteKit waits for it before it swaps the page. Resolving it inside the view transition's update callback, then awaiting `navigation.complete`, is what lets any effect wrap a navigation.
- An SVG `<text>` takes the site's font through CSS (`font-family: var(--font-label)`), and `transform-box: fill-box` makes a transform turn around the shape's own centre, not the SVG's corner.

## Next

- Alfonso picks the effect that suits a language change best, or keeps them taking turns.
