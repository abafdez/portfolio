---
title: 'Designing dark first: an oklch palette and monospace type'
date: 2026-10-31
tags: [css, oklch, design-tokens, dark-mode, typography]
draft: true
description: I replaced Open Props' grays with my own blue-gray scale in oklch, picked a terminal green, and designed the dark theme first. Why oklch makes a scale even, and what "dark first" means in light-dark().
---

My site used Open Props' grays and blues. They're fine, but they looked like every other site. For a technical look (terminal, blueprints, code) I wanted a cool blue-gray and a phosphor green, like an old monitor. And since most developers I know browse in dark mode, I designed the dark theme first.

## Why oklch

I built the grays with `oklch()`:

```css
--ink-0: oklch(98% 0.004 250);
--ink-4: oklch(70% 0.022 250);
--ink-8: oklch(17% 0.018 250);
```

The three numbers are **lightness**, **chroma** (how colorful) and **hue** (an angle on the color wheel; 250 is blue).

The important one is lightness. In oklch it is **perceived** lightness: two colors with the same L look about as light to a person, whatever their hue. HSL doesn't work like that: `hsl(60 100% 50%)` (yellow) and `hsl(240 100% 50%)` (blue) have the same "lightness" on paper, and the yellow looks far brighter.

That gives me two things:

- **An even scale.** Evenly spaced L values look evenly spaced.
- **Predictable contrast.** The distance in L between two colors tells me roughly how readable one is on the other, before I even run a checker.

Every step keeps hue 250, so the whole scale is one consistent blue-gray. Only the lightness changes, plus a touch of chroma in the middle so the grays don't look dead.

<!-- TODO: a screenshot of the ink scale, or a swatch strip -->

## The accent

Terminal green, in two versions:

```css
--green-dark: oklch(46% 0.13 148);
--green-bright: oklch(84% 0.2 148);
```

Bright green on a dark background is the look I wanted. On a light background the same green is unreadable, so light mode gets a dark green with the same hue.

## Dark first with light-dark()

My semantic tokens already used [`light-dark()`](./2026-10-29-dark-mode):

```css
--brand: light-dark(var(--green-dark), var(--green-bright));
--text-1: light-dark(var(--ink-7), var(--ink-2));
--surface-1: light-dark(var(--ink-0), var(--ink-8));
```

"Dark first" doesn't change the syntax. It changes which value I design. I tuned the second value of each pair (dark) until it looked right, then picked the first (light) as its adaptation. The site still follows the OS by default.

Because components only use semantic tokens, the whole switch happened in `tokens.css`. No component changed. ([Why that layer matters](./2026-10-27-design-tokens).)

## Checking contrast

I checked every text/surface pair when I defined it, not when a page first used it (I learned that [the hard way](./2026-10-27-design-tokens)). All pass WCAG AA (4.5:1). The tightest is the dark green on the lightest raised surface, at 4.69:1.

<!-- TODO: the contrast table: each pair and its ratio, in both themes -->

## Monospace headings

Headings, the site name, the nav and buttons use Fira Code. Body text stays in the system sans font, because long paragraphs in monospace are tiring to read. Two tokens carry this:

```css
--font-heading: var(--font-code);
--font-label: var(--font-code);
```

Monospace runs wide, so big headings get a little negative `letter-spacing`.

## Small touches

The accent also shows up in places you only notice when you use the page:

```css
::selection {
	background-color: var(--brand);
	color: var(--surface-1);
}

:focus-visible {
	outline: 2px solid var(--brand);
	outline-offset: 3px;
}

body {
	caret-color: var(--brand);
}
```

## Ready for named themes

Later I want named themes (Tokyo Night, Dracula…). Each one will be a block that overrides the semantic tokens:

```css
:root[data-theme='tokyo-night'] {
	--brand: …;
	--surface-1: …;
}
```

This is why components must never use a primitive like `--green-bright`: a component that did would ignore the theme's `--brand` and stay green inside Tokyo Night.

<!-- TODO: what I'd still change, e.g. one --ink-hue variable instead of repeating 250 nine times -->

Next: [the blueprint background](./2026-10-31-blueprint-background).
