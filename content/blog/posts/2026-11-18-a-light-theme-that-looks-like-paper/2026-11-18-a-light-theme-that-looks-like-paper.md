---
title: A light theme that looks like paper
draft: true
date: 2026-11-18
tags: [css, design-tokens, color, accessibility]
description: My light theme was the dark one with the lights on, cold and dull. Now it's cream paper with pencil text and a grid in the brand colour, and a test makes sure the grid never takes text below 4.5:1.
---

I designed this site dark first, and the light theme was an afterthought: the same cold blue-grey neutrals, lightened. It worked and it was dull. Weeks ago I'd previewed three directions for it and put them on hold; this week I picked one, the **engineering pad**: warm cream paper, pencil-coloured text and a grid in green, like squared engineering paper.

![A post in the new light theme: cream page and sheet, dark warm text, code blocks and a tip callout on near-white panels, a faint green grid at the sides](./light-post.png 'Cream paper, pencil text, a green grid in the margins')

## Paper and pencil as tokens

Only the light half of a few semantic tokens changed. New primitives describe the materials:

```css
--paper-0: oklch(99.5% 0.006 95); /* inner panels, code */
--paper-1: oklch(97% 0.02 95); /* the page and its sheets */
--paper-3: oklch(91% 0.028 100); /* borders */
--pencil-1: oklch(24% 0.02 60); /* text */
--pencil-2: oklch(45% 0.03 60); /* muted text */
```

and `--surface-1/2/3` and `--text-1/2` point at them in light, keeping their dark values. Hue 95 is a yellowish cream and 60 a brown-grey: next to the green they read as paper and graphite, where blue-greys read as a screen. No component changed, because components only use semantic tokens.

## A grid in every theme's colour

The blueprint grid behind the page used to be the text colour at a few percent, in both modes. In light it's now the **brand** colour, and that's what makes it look like an engineering pad. Because it's `var(--brand)` and not a fixed green, every colour theme's light half gets a grid in its own colour: violet in Catppuccin, blue in Tokyo Night.

## Decoration that counts as background

Text at body size never sits on the grid on this site (it sits on a sheet), but the header's nav does, and the pointer lights the grid up around it. Measured at the spotlight's brightest point, a 9% brand grid line under the 15% spotlight line took the grey nav text to 4.42:1, under the 4.5:1 it needs.

Rather than retune five themes that had been tuned right at the edge, I made the light spotlight softer: 3% glow and 10% lines over a 6% grid line add up to slightly less brand colour than dark's 4% + 15%, so anything that passed before still passes. The theme test now composites that stack for every theme's light half, so a theme that fails can't be merged.

One CSS trap on the way: `light-dark()` only takes colours, so `color-mix(in oklab, var(--brand) light-dark(6%, 8%), transparent)` is invalid. The whole mix has to be written twice, once per mode.
