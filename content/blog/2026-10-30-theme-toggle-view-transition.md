---
title: 'A theme toggle that reveals itself: SVG masks and view transitions'
date: 2026-10-30
tags: [css, view-transitions, svg, svelte, dark-mode]
draft: true
description: My theme toggle became a sun that turns into a moon, and the new theme now grows out of the button in a circle. An SVG mask, one number token, and the View Transition API.
---

My [theme toggle](./2026-10-29-dark-mode) worked, but it was a plain button that said "Dark theme". I wanted something with more personality, and I loved the one on [Adam Argyle's site](https://nerdy.dev): a sun that turns into a moon, and the new theme spreading out of the button in a circle. This post covers how I rebuilt it in Svelte, in two parts: the icon and the reveal.

## Part 1: the icon

The icon is a 24×24 SVG: a circle for the sun, eight lines for its rays, and a mask.

```svelte
<svg aria-hidden="true" viewBox="0 0 24 24">
	<mask id="moon-mask">
		<rect width="24" height="24" fill="white" />
		<circle class="bite" cx="24" cy="10" r="6" fill="black" />
	</mask>
	<circle class="sun" cx="12" cy="12" r="6" mask="url(#moon-mask)" fill="currentColor" />
	<g class="rays" stroke="currentColor">
		<!-- eight <line>s around the sun -->
	</g>
</svg>
```

A mask is a black-and-white picture laid over an element: white parts stay visible, black parts are hidden. Here, the mask is all white except for a black circle that sits just off to the right, outside the sun. In dark mode that circle slides left over the sun and bites out a crescent. At the same time the sun grows and the rays fade out.

### One number for the theme

I first drove the animation from the button's `aria-pressed`. But the page is prerendered, and `aria-pressed` only gets its value when Svelte's `onMount` runs in the browser. A visitor whose OS is dark would see a sun for a moment, then watch it turn into a moon on every page load.

The colors don't have this problem, because the CSS already knows the theme before any JS runs. So the icon should read the theme from CSS too. My colors use `light-dark()`, but that only works for colors, not for a `transform` or an `opacity`. So I added one number token next to them in `tokens.css`, following the same rules as `color-scheme`:

```css
:root {
	--dark: 0;
}

@media (prefers-color-scheme: dark) {
	:root {
		--dark: 1;
	}
}

:root[data-theme='light'] {
	color-scheme: light;
	--dark: 0;
}

:root[data-theme='dark'] {
	color-scheme: dark;
	--dark: 1;
}
```

With a 0 or a 1, `calc()` can do the rest:

```css
.sun {
	transform: scale(calc(1 + 0.75 * var(--dark)));
	transition: transform 0.5s var(--ease-elastic-out-3);
}

.rays {
	opacity: calc(1 - var(--dark));
	transform: rotate(calc(-25deg * var(--dark)));
}

.bite {
	transform: translateX(calc(-7px * var(--dark)));
}
```

Now the icon is right from the first paint, even with JavaScript turned off. When `--dark` changes, the transitions animate the change. The elastic easing from Open Props gives the sun a little bounce.

## Part 2: the reveal

The circle uses the [View Transition API](https://developer.mozilla.org/docs/Web/API/View_Transition_API). When you call `document.startViewTransition()`, the browser:

1. takes a picture of the page as it is now,
2. calls your `update()` function, where you change the DOM,
3. takes a picture of the new state as soon as `update()` finishes,
4. animates from the old picture to the new one.

You style that animation with two pseudo-elements: `::view-transition-old(root)` and `::view-transition-new(root)`. By default they cross-fade. For the reveal, the old picture stays still and the new one is clipped to a circle that grows from the button:

This was my first version:

```css
:root:active-view-transition-type(theme)::view-transition-old(root) {
	animation: none;
	mix-blend-mode: normal;
}

:root:active-view-transition-type(theme)::view-transition-new(root) {
	animation: theme-reveal 0.6s var(--ease-in-out-3);
	mix-blend-mode: normal;
}

@keyframes theme-reveal {
	from {
		clip-path: circle(0 at var(--reveal-x) var(--reveal-y));
	}
	to {
		clip-path: circle(var(--reveal-r) at var(--reveal-x) var(--reveal-y));
	}
}
```

`mix-blend-mode: normal` is there because the default cross-fade blends the two pictures together, which would brighten everything inside the circle.

### A soft edge

A `clip-path` circle always has a sharp edge. I wanted to try a blurry one, so I switched to a mask. A `radial-gradient` can be solid black (visible) up to one radius and fade to transparent (hidden) at another, and the gap between the two is the blur:

```css
:root:active-view-transition-type(theme)::view-transition-new(root) {
	animation: theme-reveal var(--reveal-duration) var(--ease-in-out-3) forwards;
	mix-blend-mode: normal;
	mask-image: radial-gradient(
		circle at var(--reveal-x) var(--reveal-y),
		#000 calc(var(--reveal-radius) - var(--reveal-blur)),
		transparent var(--reveal-radius)
	);
}
```

Now the animation has to grow `--reveal-radius`, a custom property. By default the browser treats a custom property as plain text, and it can't animate between two pieces of text, so the circle would jump from nothing to full size. `@property` tells it the value is a length, and lengths can be animated:

```css
@property --reveal-radius {
	syntax: '<length>';
	inherits: false;
	initial-value: 0px;
}

@keyframes theme-reveal {
	from {
		--reveal-radius: 0px;
	}
	to {
		--reveal-radius: calc(var(--reveal-r) + var(--reveal-blur));
	}
}
```

The circle ends one blur past the farthest corner, so the fading edge leaves the screen too.

The `forwards` took me a flash to find. The view transition stays on screen a frame or so after its animation ends. With `clip-path` that didn't matter: without the animation, `clip-path` goes back to `none` and shows everything. But without the animation, `--reveal-radius` goes back to its `initial-value` of `0px`, the mask hides the whole new picture, and the old theme flashes through. `forwards` keeps the animation's last frame until the transition is gone.

The speed and the blur are props: `<ThemeToggle duration={800} blur={120} />`. My `Hero` takes CSS props like `--photo-animation`, but that doesn't work here. Svelte puts those on a wrapper around the component, and the transition's pseudo-elements hang off `:root`, outside it. So the click handler writes them on `:root`, next to the circle's position:

```ts
root.style.setProperty('--reveal-duration', `${duration}ms`);
root.style.setProperty('--reveal-blur', `${blur}px`);
```

<!-- TODO: the values I picked for the header, and why -->

I tried all this first in a CodePen with sliders for the duration, easing, blur and blend mode. One thing I learned there: with a blend mode other than `normal`, the reveal's last frame is the two pictures blended, so the page snaps to the real new theme when the transition ends. That's a flash.

The click handler works out where the circle starts and how big it must get. It starts at the button's center and has to reach the farthest corner of the screen:

```ts
function toggle(event: MouseEvent) {
	const canReveal = typeof ViewTransition !== 'undefined' && 'types' in ViewTransition.prototype;
	if (!canReveal || matchMedia('(prefers-reduced-motion: reduce)').matches) return flip();

	const { left, top, width, height } = (event.currentTarget as HTMLElement).getBoundingClientRect();
	const x = left + width / 2;
	const y = top + height / 2;
	const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

	const root = document.documentElement;
	root.style.setProperty('--reveal-x', `${x}px`);
	root.style.setProperty('--reveal-y', `${y}px`);
	root.style.setProperty('--reveal-r', `${radius}px`);

	document.startViewTransition({ update: () => flushSync(flip), types: ['theme'] });
}
```

`flip()` is the old toggle logic: switch the theme, then save the override or remove it.

### Why the `theme` type

Transition types label a transition, and `:active-view-transition-type(theme)` only matches while a transition with that label runs. Without it, the circle CSS would apply to **every** view transition. I'm planning transitions between pages next, and those would play the circle too, starting from wherever I last clicked the toggle.

### Why `flushSync`

Svelte doesn't update the DOM the moment `$state` changes. It collects the changes and applies them a moment later, in one batch. [`flushSync`](https://svelte.dev/docs/svelte/svelte#flushSync) applies them right away, so they're guaranteed to be in step 3's picture. To be honest, nothing visible depends on it yet: the colors and the icon come from `data-theme`, which `flip()` sets directly. It's insurance for anything Svelte will render from the theme later.

### The fallbacks

The reveal is an enhancement. If the browser has no view transition types, or the visitor prefers reduced motion, `toggle()` just calls `flip()` and the theme switches instantly. Checking for `types` matters: older browsers support `startViewTransition()` but only with a function argument, and they'd throw an error on the options object.

**Update:** when I added [transitions between pages](./2026-10-31-route-transitions-composition), they needed the same check, so it moved into one shared function, `canTransition()` in `src/lib/view-transitions.ts`. The toggle now starts with `if (!canTransition()) return flip();`.

## A bug I found on the way

The button's `theme` starts as `undefined`, because the prerendered page can't know the visitor's theme. I thought that kept `aria-pressed` out of the HTML. It didn't: Svelte renders `false` on an `aria-*` attribute as the string `"false"`, so every visitor got `aria-pressed="false"` until the page loaded. Only `undefined` leaves the attribute out:

```svelte
aria-pressed={theme ? theme === 'dark' : undefined}
```

## Try it

- Open the Animations panel in DevTools, slow it down to 10%, and click the toggle.
- In the console, run `document.documentElement.style.setProperty('--dark', 1)` and watch the icon change on its own.

<!-- TODO: a short demo video or GIF of the reveal -->
