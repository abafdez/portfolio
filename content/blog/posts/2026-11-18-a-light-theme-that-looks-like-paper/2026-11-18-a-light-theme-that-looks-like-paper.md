---
title: A light theme that looks like paper
date: 2026-11-18
tags: [css, design-tokens, color, accessibility]
description: My light theme was the dark one with the lights on. The first fix was too loud; comparing three directions with screenshots found the right one, ink green on warm white, and a test makes sure the grid never takes text below 4.5:1.
---

I designed this site dark first, and the light theme was an afterthought: the same cold blue-grey neutrals, lightened. It worked and it was dull. This is how it got fixed, in two rounds, because the first one didn't work either.

## Round one: too loud

Weeks ago I'd previewed three directions and put them on hold. I picked one, the **engineering pad**: cream paper, pencil-coloured text, and the blueprint grid in the brand green, like squared engineering paper. On its own it looked fine. On the real pages it was busy: green minor lines, green major lines and green crosses everywhere, and the bright phosphor green that's perfect on a dark terminal looked garish on cream.

## Comparing with screenshots

Colour is hard to judge from a description, so the second round compared real screenshots. Every direction is just a few semantic tokens (page, panels, borders, text, muted text, brand, grid), so a direction can be tried on the live page by injecting them:

```js
const style = document.createElement('style');
style.textContent = `:root[data-theme='light'] { --surface-1: #f9f8f5; --brand: #095b41; … }`;
document.head.append(style);
```

Three directions, each screenshotted on the home page and on a post with code and callouts: **ink green** (the same identity, calmer), **blueprint** (Prussian-blue ink on cool paper, a real technical drawing) and **graphite** (white, an emerald accent, only the grid's crosses). Every value was checked for contrast before anything was rendered. Ink green won.

![A post in the ink-green light theme: warm white sheet, dark graphite text, a deep green tip callout and code on near-white panels, a faint grid at the sides](./light-post.png 'Ink green: warm white, graphite text, a quiet grid in the margins')

## Ink green as tokens

Only the light half of a few tokens changed. The primitives describe the materials:

```css
--paper-0: oklch(99.6% 0.002 95); /* inner panels, code */
--paper-1: oklch(98% 0.005 95); /* the page and its sheets */
--paper-3: oklch(91% 0.01 95); /* borders */
--pencil-1: oklch(23% 0.012 160); /* text */
--pencil-2: oklch(45% 0.015 160); /* muted text */
--green-dark: oklch(42% 0.085 165); /* the brand, like fountain-pen ink */
```

`--surface-1/2/3`, `--text-1/2` and `--brand` point at them in light and keep their dark values. The paper is a white with the faintest warmth, not cream; the text is graphite with a hint of the brand's hue, so the neutrals and the green belong together. The green is darker and much less saturated than the dark theme's phosphor: the same family, a different material. No component changed, because components only use semantic tokens.

## A quieter grid

The grid lost its minor lines in light, and went back to the text colour instead of the brand: faint major lines at 6% and crosses at 16%. It now reads as a texture at the edges of the page rather than a pattern competing with it.

## Decoration that counts as background

Text at body size never sits on the grid on this site (it sits on a sheet), but the header's nav does, and the pointer lights the grid up around it. So the theme test composites the real stack at the spotlight's brightest point: the page, the grid's major line, a 3% brand glow and a 10% brand line. Measured in the browser, the muted nav text keeps 5.09:1 there and the brand 5.6:1; on plain surfaces, code and callout colours are all above 6:1.

One CSS trap from round one: `light-dark()` only takes colours, so `color-mix(in oklab, var(--brand) light-dark(6%, 8%), transparent)` is invalid. Write the whole mix twice, once per mode.
