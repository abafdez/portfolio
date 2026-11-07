---
title: 'Decoration under text still needs contrast'
date: 2026-11-04
tags: [css, accessibility, design-tokens]
description: My background grid lights up around the mouse. Where it ran under text, the text dropped to 1.89:1. How I measured a translucent layer, and how I picked the strongest effect that still passes.
cover: A poorly readable page againsta a properly contrasted and readable page.
---

My site has a [blueprint grid behind every page](./2026-10-31-blueprint-background), and with a mouse the grid lights up in green around the pointer. I called the whole thing decorative: faint lines, no contrast requirement.

That was true for the plain grid. It wasn't true for the spotlight.

<!-- TODO: a before/after screenshot, the grey intro line on /bitacora with the mouse on it -->

## Where it went wrong

The spotlight is the same grid, drawn again in the brand color and masked to a circle around the mouse:

```css
.spot {
	--line: color-mix(in oklch, var(--brand) 25%, transparent);
	--line-major: color-mix(in oklch, var(--brand) 45%, transparent);
	mask-image: radial-gradient(circle 14rem at var(--x) var(--y), black, transparent);
}
```

Two things made it hard to read:

- **The minor lines are 1.5rem apart.** That's about one line of text, so inside the circle almost every line of text had a bright line running through its letters.
- **The circle is brightest at the pointer.** And the pointer is often where I'm reading.

A line under a letter is, for that letter, its background. So the "decoration" has to meet the same contrast rule as any surface: 4.5:1 for body text.

## Measuring a translucent layer

My [contrast checker](./2026-11-02-a-contrast-checker-for-my-own-tokens) reads opaque surfaces. The spotlight isn't opaque: its color depends on what's under it. So I composited it myself, the way the browser does: paint the page color on a 1×1 canvas, paint each layer on top, and read the pixel back.

```js
// Any CSS color (a var(), a color-mix()…) resolved to something canvas accepts.
const probe = document.createElement('div');
document.body.append(probe);
const resolve = (value) => {
	probe.style.color = value;
	return getComputedStyle(probe).color;
};

const canvas = Object.assign(document.createElement('canvas'), { width: 1, height: 1 });
const ctx = canvas.getContext('2d', { willReadFrequently: true });

// Paint the layers bottom to top, return the final pixel as [r, g, b].
function paint(...layers) {
	ctx.clearRect(0, 0, 1, 1);
	for (const layer of layers) {
		ctx.fillStyle = resolve(layer);
		ctx.fillRect(0, 0, 1, 1);
	}
	return [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3);
}

const page = getComputedStyle(document.body).backgroundColor;
const underLetter = paint(
	page,
	'color-mix(in oklch, var(--brand) 8%, transparent)', // the glow
	'color-mix(in oklch, var(--brand) 45%, transparent)' // a major line
);
```

Then the usual WCAG formula on `underLetter` and the text color (relative luminance of each, `(lighter + 0.05) / (darker + 0.05)`).

The brightest point is the middle of the spot, where the glow and a major line overlap. In the dark theme:

| Under the text         | `--text-1` | `--text-2` |
| ---------------------- | ---------- | ---------- |
| The page               | 15.07:1    | 7.17:1     |
| A lit minor line (25%) | 8.30:1     | 3.95:1     |
| A lit major line (45%) | 4.54:1     | 2.16:1     |
| Major line + glow      | 3.98:1     | **1.89:1** |

Even body text failed at the brightest point.

## Picking the strongest value that passes

Since muted text has the least room, I measured `--text-2` over a range of line strengths, with a 4% glow, in both themes, and kept the strongest that stayed at 4.5:1 or more:

- major lines: **15%** (4.89:1 dark, 4.83:1 light)
- minor lines: **8%** (5.77:1 dark, 5.40:1 light)

The spotlight is quieter now. In dark it still reads as a green grid following the mouse. In light it's nearly gone: the text is dark and the brand green is dark too, so a lit line costs more contrast there.

<!-- TODO: how the light theme feels now, and whether it needs its own values -->

## Why they're tokens

The three values moved from the component to `tokens.css`, next to the other grid tokens:

```css
--grid-spot-line: color-mix(in oklch, var(--brand) 8%, transparent);
--grid-spot-line-major: color-mix(in oklch, var(--brand) 15%, transparent);
--grid-spot-glow: color-mix(in oklch, var(--brand) 4%, transparent);
```

I'm planning named themes (Tokyo Night, Dracula…) as overrides of my tokens. A theme with a different `--brand` changes every ratio above, so the values have to live where a theme can override them, with a comment that says to re-check them.

<!-- TODO: try it: in DevTools, set --line-major on .blueprint .spot back to 45% and hover the intro line on /bitacora. Describe what happens to the letters -->

## Links

- [WCAG 2.2: Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- [MDN: color-mix()](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix)
- [MDN: getImageData()](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/getImageData)
