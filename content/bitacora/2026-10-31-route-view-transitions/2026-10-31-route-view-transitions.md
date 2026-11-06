---
title: View transitions between routes
date: 2026-10-31
phase: 4.5
tags: [view-transitions, sveltekit, css]
---

## What we did

- Route changes now run inside a view transition of type `route`, started from `onNavigate` in the root layout.
- The header stays still, the old page content fades out (150ms) and the new one fades in and rises a little (300ms). The background and footer swap at once.
- The nav's current-page underline is now its own element (a `.marker` span). During a route change it gets a name, and the browser slides it from the old link to the new one.
- The "can we animate?" check (view transition types, no reduced-motion preference) moved into `canTransition()` in `src/lib/view-transitions.ts`, shared by the theme toggle and the routes.
- Tested: route links start one `route` transition, in-page `#` links and reduced motion start none, and the theme reveal still covers the whole page.

## What I learned

- `onNavigate` runs just before SvelteKit swaps the page, and SvelteKit waits if it returns a promise. Inside `startViewTransition`, `update()` resolves that promise (so SvelteKit swaps the page) and then waits for `navigation.complete`, so the browser's "after" picture shows the new page.
- `view-transition-name` gives an element its own pair of pictures, animated apart from the rest of the page (the root). The root is what's left with those elements cut out.
- Names only during `route` transitions (`:root:active-view-transition-type(route) header`). The theme reveal only animates the root; a named header would be cut out of it and miss the circle.
- A text underline can't move between links, but an element can. Only one marker exists per page, so the browser can pair the old one with the new one.
- By default the old and new pictures are stretched to the group's size. When the old page is wider than the new one, the old picture gets squeezed. Giving it `inline-size: auto`, centered with `inset-inline-start: 50%` and `translate: -50%`, keeps it where it was.
- The CSS reduced-motion safety net can't stop these: `*` doesn't match `::view-transition-*` pseudo-elements. So the check is in JS, before the transition starts.

## Links

- [SvelteKit: onNavigate](https://svelte.dev/docs/kit/$app-navigation#onNavigate)
- [Svelte blog: Unlocking view transitions in SvelteKit](https://svelte.dev/blog/view-transitions)
- [MDN: view-transition-name](https://developer.mozilla.org/docs/Web/CSS/view-transition-name)
- [MDN: ::view-transition-group()](https://developer.mozilla.org/docs/Web/CSS/::view-transition-group)

## Next

- A way for each route to set its own composition.
