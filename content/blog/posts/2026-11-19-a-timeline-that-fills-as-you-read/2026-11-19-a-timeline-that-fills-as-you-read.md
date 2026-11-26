---
title: A timeline that fills as you read
draft: true
date: 2026-11-19
tags: [css, animation, scroll-driven-animations]
description: 'Three scroll-driven animations on my Devlog timeline, no JavaScript: a line that fills as the middle of the screen passes it, entries that wipe in, dots that pop. And the one inset trick that makes the line follow your reading.'
---

My Devlog is a timeline: entries grouped by phase, with a line down the side and a dot for each entry. It was static. Now it moves with your reading, and all of it is CSS: scroll-driven animations, where an animation's progress follows a scroll position instead of a clock.

![The Devlog timeline mid-scroll: the line beside the earlier phase is filled green, the line beside the next phase is still grey](./timeline.png 'The filled line marks how far you have read')

## A line that fills

The list has a grey line (`::before`) and, on top of it, a brand-coloured one (`::after`) that scales from 0 to 1 from the top:

```css
.timeline::after {
	transform-origin: top;
	animation: line-fill linear both;
	animation-timeline: view(50% 50%);
	animation-range: cover 0% cover 100%;
}

@keyframes line-fill {
	from {
		scale: 1 0;
	}
	to {
		scale: 1 1;
	}
}
```

The trick is `view(50% 50%)`. A view timeline tracks an element crossing the scrollport, and the two values are insets: 50% off the top and 50% off the bottom shrink the scrollport to a line across the middle of the screen. With the range `cover 0%` to `cover 100%`, the animation starts when the list's top reaches that line and ends when its bottom leaves it. So the fill always ends at the middle of the screen: a progress bar for reading.

## Entries that wipe in

Each entry is wiped in from the top and slides out from the line as it enters the screen:

```css
li {
	animation: entry-in linear both;
	animation-timeline: view();
	animation-range: entry 0% entry 70%;
}

@keyframes entry-in {
	from {
		clip-path: inset(-2rem -2rem 100% -4rem);
		translate: -1.25rem 0;
	}
	to {
		clip-path: inset(-2rem -2rem -2rem -4rem);
	}
}
```

Two details matter. A wipe, not a fade: Lighthouse measures contrast when the page loads, and text below the fold at `opacity: 0` fails it, even though nobody sees it faded. And the negative insets: the dot sits outside the entry, to its left, and a `clip-path` clips everything outside the box, the dot included. The inset reaches 4rem to the left, and it has to be an `inset()` at both ends, because `inset()` to `none` doesn't interpolate.

## Dots that pop

The dot (`li::before`) scales from 0 past 1.6 and back to 1 while its entry arrives, on the same kind of timeline with a slightly later range, so it lands after the wipe has started.

## When it doesn't run

All three are inside `@supports (animation-timeline: view())` and `@media (prefers-reduced-motion: no-preference)`. Browsers without scroll-driven animations, and people who asked for less motion, get the timeline as it was: a grey line, dots, and every entry visible. Entries already on screen when the page loads are past their range, so they're simply shown.
