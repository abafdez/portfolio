---
title: A blueprint grid background with a cursor spotlight
date: 2026-10-31
phase: 4.5
tags: [css, backgrounds, masks, svelte]
---

## What we did

- New `Blueprint.svelte`, mounted once in `+layout.svelte`: a fixed layer behind the whole page.
- The grid is pure CSS: four `linear-gradient`s, minor lines every cell (`--grid-size`, 1.5rem) and major lines every 4 cells.
- A small "+" at every major crossing, drawn with a CSS mask.
- The grid fades out toward the bottom corners with a radial mask.
- With a mouse, the grid lights up in the accent color in a circle around the pointer (the spotlight).
- The line colors are tokens mixed from `--text-1`, so the grid follows the theme with no extra code.

## What I learned

- A `linear-gradient` with a hard stop draws a line: `linear-gradient(var(--line) 1px, transparent 1px)` is 1px of color, then transparent. `background-size` repeats that tile, so one gradient makes every line in one direction.
- With several backgrounds, the **first one is painted on top**: list them from closest to farthest. Our major lines come first, so they sit on top where they cross the minor ones. (Here both are the same color at different transparency, so the order doesn't change the result; it would with different colors or opaque lines.)
- `mask-image` uses an image only as a shape: where it's opaque, the element shows. The "+" is a tiny SVG used as a mask, and its color comes from `background-color`, so it follows the theme. An SVG data URI can't read CSS variables, but a mask doesn't need to.
- Two masks with `mask-composite: intersect`: only what both let through shows, so the pluses fade like the grid.
- `position: fixed; z-index: -1` paints the layer above the body's background color but under all the page content. `pointer-events: none` so it never catches clicks.
- The spotlight is the same `.grid` with other values for `--line`, masked by `radial-gradient(circle 14rem at var(--x) var(--y), …)`. Svelte writes `--x` and `--y` with `style:--x`.
- `pointerType === 'mouse'` skips touch and pen, and `@media (hover: hover) and (pointer: fine)` only shows the spotlight on devices with a real hovering pointer.
- `mouseout` with a `relatedTarget` of `null` means the mouse left the window, not just an element. That's when the spotlight fades out.

## Links

- [MDN: Using multiple backgrounds](https://developer.mozilla.org/docs/Web/CSS/CSS_backgrounds_and_borders/Using_multiple_backgrounds)
- [MDN: mask-image](https://developer.mozilla.org/docs/Web/CSS/mask-image)
- [MDN: mask-composite](https://developer.mozilla.org/docs/Web/CSS/mask-composite)
- [MDN: @media pointer](https://developer.mozilla.org/docs/Web/CSS/@media/pointer)
- [Svelte: style: directive](https://svelte.dev/docs/svelte/style)

## Next

- The header and footer react to scrolling.
