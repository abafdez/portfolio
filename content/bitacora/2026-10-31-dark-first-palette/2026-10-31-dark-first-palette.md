---
title: A dark-first palette in oklch, and monospace type
date: 2026-10-31
phase: 4.5
tags: [design-tokens, oklch, dark-mode, typography]
---

## What we did

- Picked the accent: terminal green. Two versions, `--green-dark` for light mode and `--green-bright` (a phosphor green) for dark.
- Replaced the Open Props grays with our own blue-gray scale, `--ink-0` to `--ink-8`, in `oklch()`. Every step has hue 250; only lightness (and a little chroma) changes.
- Pointed the semantic tokens (`--brand`, `--text-*`, `--surface-*`) at the new primitives. Components didn't change: they only use semantic tokens.
- Designed dark first: in each `light-dark(a, b)` the dark value `b` is the one I tuned, and the light one is its adaptation.
- Checked contrast for every text/surface pair. All pass AA; the lowest is green-dark on ink-3 at 4.69:1.
- Fira Code for headings, the site name, the nav, buttons and the footer, through two new tokens, `--font-heading` and `--font-label`. Body text stays sans.
- The accent shows up in small places too: text selection, the focus ring and the text caret.

## What I learned

- `oklch(L C H)`: L is **perceived** lightness, not a raw number. Two colors with the same L look about as light, whatever their hue, so evenly spaced L values make an even scale, and contrast is predictable when I pick pairs. With hex or HSL, two colors that "look" the same lightness can be far apart.
- Same hue on every step means one consistent blue-gray. But the hue is written nine times; a `--ink-hue` variable would make changing it a one-line edit.
- Primitives (`--ink-5`) say what a color is; semantic tokens (`--text-2`) say what it's for. Named themes later will override the semantic block: `:root[data-theme='tokyo-night'] { --brand: …; }`. A component that used `--green-bright` directly would ignore that override and stay green.
- `--font-heading` points at `--font-code`, not at `--font-body`. Custom properties resolve where they are declared (`:root`), so a section that changes `--font-body` could never reach a heading font defined from it anyway.
- Monospace runs wide, so big headings get `letter-spacing: -0.02em`.

## Problems & fixes

- A screenshot in emulated dark mode came out light: an old `theme=light` in `localStorage` (from the toggle) overrode the OS setting. Cleared it before testing.

## Links

- [MDN: oklch()](https://developer.mozilla.org/docs/Web/CSS/color_value/oklch)
- [Evil Martians: OKLCH in CSS, why we moved from RGB and HSL](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl)
- [oklch.com](https://oklch.com), a color picker
- [MDN: light-dark()](https://developer.mozilla.org/docs/Web/CSS/color_value/light-dark)
- [Fira Code](https://github.com/tonsky/FiraCode)

## Next

- The blueprint background.
