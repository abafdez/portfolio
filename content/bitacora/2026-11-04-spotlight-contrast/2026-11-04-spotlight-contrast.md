---
title: The background spotlight was hiding my text
date: 2026-11-04
phase: 9
tags: [css, accessibility, design-tokens]
---

## What we did

- The spotlight in `Blueprint.svelte` (the grid lit in green around the mouse) made text hard to read. Measured it first: muted text (`--text-2`) on a lit major line plus the glow was **1.89:1** in dark, 2.82:1 in light. Plain text needs 4.5:1.
- Moved the spotlight colors into `tokens.css` as `--grid-spot-line` (8%), `--grid-spot-line-major` (15%) and `--grid-spot-glow` (4%), down from 25%, 45% and 8%. These are about the strongest values where `--text-2` keeps 4.5:1 at the brightest point: 4.89:1 dark, 4.83:1 light.
- The effect is quieter. Still clear in dark, almost gone in light.

## What I learned

- "Decorative" stops being true once text sits on it. A lit line under a letter is that letter's background, so it needs the same contrast as any surface.
- The minor lines are 1.5rem apart, about one line of text, so inside the circle nearly every line of text has a lit line through it. And the spot is brightest right where the mouse is, which is often where I'm reading.
- To measure a translucent layer, composite it: paint the page color and then each layer on a 1×1 canvas, read the pixel back, and compute the WCAG ratio against the text color. The contrast checker can't do this yet, because it only knows opaque surfaces.
- In light, the text is dark and the brand green is dark too, so a lit line costs more contrast and the rule leaves less room for the effect.
- The values are tokens because named themes will change `--brand`, and these ratios change with it. A theme has to re-check them (the comment in `tokens.css` says so).

## Problems & fixes

- I couldn't open the dev server from Windows: `ERR_CONNECTION_REFUSED` even though it answered inside WSL. WSL's localhost forwarding was down. Restarting WSL didn't fix it; restarting the Windows Host Network Service (HNS) did.

## Links

- [WCAG 2.2: Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- [MDN: color-mix()](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix)
- [MDN: CanvasRenderingContext2D.getImageData()](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/getImageData)

## Next

- Breadcrumbs, so I know where I am inside a project or a post.
- Maybe give light its own spotlight values when I redo the light theme.
