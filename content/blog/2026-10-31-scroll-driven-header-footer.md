---
title: 'Scroll-driven animations: a header that detaches and a footer that hints'
date: 2026-10-31
tags: [css, scroll-driven-animations, accessibility]
draft: true
description: Animations that follow the scroll instead of the clock, in pure CSS. A header that lifts into a floating bar, a footer that slides in, and a hint that there's more below, all with a fallback for older browsers and reduced motion.
---

I found [julibe.com](https://julibe.com) and loved three details: the top menu detaches from the page as you scroll, the footer stays hidden but a little animation hints that there's more below, and the scrollbar is in the accent color. All three are pure CSS now.

<!-- TODO: a short video of scrolling the home page, top to bottom -->

## The idea: a timeline that isn't time

A normal CSS animation runs from 0% to 100% over a duration, like `1s`. A **scroll-driven** animation runs over something else:

- `animation-timeline: scroll()`: the page's scroll position. At the top it's 0%, at the bottom 100%.
- `animation-timeline: view()`: one element crossing the viewport.

And `animation-range` chooses which part of that timeline maps to 0%–100%.

## The header detaches

At the top of the page, the header sits flat with the page. As you scroll, it lifts into a floating bar with a border, rounded corners, a blurred see-through background and a shadow.

The trick is which state is the "normal" one. The header's regular styles are **the floating bar**:

```css
.inner {
	border: var(--border-size-1) solid var(--surface-3);
	border-radius: var(--radius-3);
	background-color: color-mix(in oklch, var(--surface-1) 75%, transparent);
	backdrop-filter: blur(12px);
	box-shadow: var(--shadow-float);
}
```

The animation only has a `from`, the flat state:

```css
@keyframes header-detach {
	from {
		border-color: transparent;
		border-radius: 0;
		background-color: transparent;
		backdrop-filter: blur(0);
		box-shadow: none;
	}
}
```

With no `to`, the browser animates toward the element's own styles. Then I tie it to the scroll:

```css
.inner {
	animation: header-detach linear both;
	animation-timeline: scroll();
	animation-range: 0 var(--size-10);
}
```

`animation-range: 0 5rem` means the whole animation happens in the first 5rem of scrolling. After that it stays at 100% (that's what `both` does).

Why make the floating bar the default? Because the animation is a progressive enhancement. In a browser without scroll-driven animations, or for someone with reduced motion, the animation doesn't run, and the header just looks finished.

The header is `position: sticky` only from 48rem wide. On a phone it's two rows tall and would take too much of the screen, so it scrolls away.

<!-- TODO: try animation-range: 0 50vh in DevTools and describe the difference -->

## The footer hints

At the bottom of the screen, a small green chevron bobs up and down: "there's more down here". As the footer scrolls into view, the chevron fades out and the footer's content slides up.

This uses a **view timeline**: progress follows the footer itself entering the screen, not the whole page. I give it a name on the footer, so its children can use it:

```css
footer {
	view-timeline: --footer;
}

.inner {
	animation: footer-in linear both;
	animation-timeline: --footer;
	animation-range: entry 0% entry 100%;
}

.hint {
	display: block;
	animation: hint-out linear both;
	animation-timeline: --footer;
	animation-range: entry 0% entry 50%;
}
```

`entry 0%` is the moment the footer's top edge appears at the bottom of the screen; `entry 100%` is when it's fully in. The hint is gone halfway through, before the content finishes sliding in.

Two details:

- **The hint is hidden by default** (`display: none`) and only shown inside the block where the animation can run. Without the animation, nothing would ever hide it.
- **The bob is on a different element.** The bob is a normal time-based loop; the fade is scroll-driven. On the same element, both would fight over the same properties, so the bob runs on the `svg` inside the link.

The hint is decoration: `aria-hidden="true"` and `tabindex="-1"`. Keyboard and screen reader users reach the footer like any other part of the page.

## The guards

Every rule above sits inside two conditions:

```css
@supports (animation-timeline: scroll()) {
	@media (prefers-reduced-motion: no-preference) {
		/* … */
	}
}
```

`@supports` for browsers that don't have scroll-driven animations yet, and `prefers-reduced-motion` for people who asked their OS for less motion. Both fall back to the finished look.

## The scrollbar

The last detail is one rule, with the standard properties (Firefox, and Chrome since 121), so no `::-webkit-scrollbar`:

```css
html {
	scrollbar-color: var(--brand) var(--surface-1);
	scrollbar-width: thin;
}
```

## Links

- [MDN: CSS scroll-driven animations](https://developer.mozilla.org/docs/Web/CSS/CSS_scroll-driven_animations)
- [MDN: animation-range](https://developer.mozilla.org/docs/Web/CSS/animation-range)
- [scroll-driven-animations.style](https://scroll-driven-animations.style), Bramus's demos and a range visualizer
- [MDN: scrollbar-color](https://developer.mozilla.org/docs/Web/CSS/scrollbar-color)
