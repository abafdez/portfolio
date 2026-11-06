---
title: Global styles with cascade layers
date: 2026-10-29
phase: 3
tags: [css, cascade-layers]
---

## What we did

- Created `src/lib/styles/global.css` with `@layer reset, base, components;`.
- `reset`: box-sizing, margins, media elements, form fonts, `overflow-wrap`.
- `base`: `body` font and colors, heading sizes and link color, all from tokens.
- Moved the `:global(body)` and `:global(h1)` rules out of the layout.

## What I learned

- Layers are checked before specificity. In the order list, the later layer wins, however specific the earlier rule is.
- Unlayered styles beat all layered ones. Svelte component `<style>` blocks aren't in a layer, so they override the globals.
- `reset` goes first so my `base` defaults aren't wiped out by it.
- A layer's position is set by where its name first appears, so the order statement goes at the top. The minifier rewrote it, and the order still held.
- `var()` is looked up when styles are computed for an element, after all stylesheets are loaded. So the order of the `tokens.css` and `global.css` imports doesn't matter.
- Source order only decides between rules that set the same property on the same element, with the same specificity, in the same layer.
- Logical properties: `max-inline-size` and `min-block-size` instead of `max-width` and `min-height`.

## Links

- [MDN: @layer](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer)
- [Josh Comeau: A Modern CSS Reset](https://www.joshwcomeau.com/css/custom-css-reset/)

## Next

- Dark mode.
