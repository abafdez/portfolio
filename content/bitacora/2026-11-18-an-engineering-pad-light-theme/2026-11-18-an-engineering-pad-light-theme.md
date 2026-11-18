---
title: An engineering-pad light theme
date: 2026-11-18
tags: [css, design-tokens, accessibility, color]
---

## What we did

- Gave the default light theme the "engineering pad" direction from `design/light-theme-directions.md`: warm cream paper (`--paper-0/1/3`, hue 95–100) and warm pencil text (`--pencil-1/2`, hue 60) instead of the blue-greys adapted from the dark theme.
- The light grid is now the brand colour (5% minor lines, 6% major, 25% crosses), so every colour theme's light half gets a grid in its own colour.
- The light spotlight is softer (3% glow, 6%/10% lines), so grid plus spotlight add up to less brand colour than dark's 4% + 15%.
- The floating header's shadow in light is 14% of `--text-1` instead of 35% near-black.
- `palettes.test.ts` now models the grid line under the spotlight in light, for all six named themes.

## What I learned

- Measured in the browser, every light pair is at least 4.5:1 (the brand green is lowest, 4.63:1). With a 9% brand grid line under the spotlight's peak, the grey nav text dropped to 4.42:1: the header's nav sits on the grid, so decoration there counts.
- Five named themes had been tuned right at the edge; softening the spotlight kept them all passing without retuning any.
- `light-dark()` only takes colours: `color-mix(…, var(--brand) light-dark(6%, 8%), …)` is invalid. Write the whole mix twice instead.

- **Later the same day:** the grid looked messy and the bright green awful on cream. I compared three new directions with screenshots (ink green, blueprint blue, graphite) and picked **ink green**: a soft warm white, graphite text, the brand as a deep ink green (`oklch(42% 0.085 165)`), and a grid with no minor lines, only faint major lines and crosses in the text colour. Every light pair passes (muted text 5.09:1 at the spotlight's peak, brand 5.6:1).

## Next

- Lighthouse on the new light theme, which I didn't run.
