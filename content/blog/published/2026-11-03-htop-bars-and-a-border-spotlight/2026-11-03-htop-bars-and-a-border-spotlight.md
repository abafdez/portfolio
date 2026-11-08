---
title: 'htop bars that fill when you see them, and a border that follows the pointer'
date: 2026-11-03
tags: [css, animation, svelte, svg]
description: The effects on my about page, and the bugs behind each one. An animation that never animated, an observer that never saw, and 168 KB of duplicate SVG.
cover: A tablet showing htop-style CPU and memory bars, with UI panels around it.
---

My about page shows my skills as rows in terminal windows, and each level is an htop-style bar: `[||||||......]`. I tried three different looks on three branches before picking this one. This post is about the effects that made it in, and especially the bugs, because each one taught me something.

## The bar is text

The bar is characters in the code font, so `1ch` is exactly one tick:

```svelte
<span class="bar" style:--ticks={skill.level * 3} aria-hidden="true">
	[<span class="track"><span class="fill">||||||||||||</span></span>]
</span>
```

The track is 12 characters wide. The fill holds 12 ticks but is only `--ticks` characters wide, with `overflow: hidden`, and the dots of the empty part are a pseudo-element underneath. The bar is `aria-hidden`: the level is also written as a word ("Daily"), and that's what a screen reader reads.

## The animation that never animated

I wanted each bar to fill from empty to its level, left to right. My keyframes:

```css
@keyframes count-up {
	from {
		clip-path: inset(0 100% 0 0);
	}
}
```

With only a `from`, the animation ends at the element's own value, and the fill's own `clip-path` is `none`. The browser can blend one `inset()` into another, but not `inset()` into `none`. When two values can't be blended, CSS doesn't refuse: it flips from one to the other halfway through. So for half the animation the bar was empty, and then it was full. I tried a scroll-driven version, a stepped one and a timed one, and they all "just appeared", for this one reason. The fix is one line:

```css
@keyframes count-up {
	from {
		clip-path: inset(0 100% 0 0);
	}
	to {
		clip-path: inset(0);
	}
}
```

The lesson I'm keeping: if an animation jumps instead of moving, check that both ends are the same kind of value.

## Starting it when the bar is on screen

CSS can't (yet) start a timed animation when an element enters the screen. A small Svelte attachment does that part: one `IntersectionObserver` for all the bars, which marks a bar `data-filling` once the whole of it is visible.

```ts
let observer: IntersectionObserver | undefined;

export const fillOnView: Attachment<HTMLElement> = (bar) => {
	observer ??= new IntersectionObserver(
		(entries) => {
			const visible = entries.filter((entry) => entry.isIntersecting);
			visible.forEach((entry, i) => {
				const target = entry.target as HTMLElement;
				target.style.setProperty('--delay', `${i * 70}ms`);
				target.dataset.filling = '';
				observer?.unobserve(target);
			});
		},
		{ threshold: 1 }
	);

	observer.observe(bar);
	return () => observer?.unobserve(bar);
};
```

The bars that come into view together each get a slightly longer `--delay`, so they cascade down the list.

My first version watched the fill, not the bar, and nothing ever filled. An observer measures the _visible_ part of what it watches, and `clip-path` counts: an empty fill is clipped to nothing, so it was never visible. The bar around it isn't clipped.

The CSS:

```css
@media (scripting: enabled) and (prefers-reduced-motion: no-preference) {
	.fill {
		clip-path: inset(0 100% 0 0);
	}

	.bar:global([data-filling]) .fill {
		animation: count-up calc(var(--ticks) * 90ms) var(--ease-out-3) var(--delay, 0s) both;
	}
}
```

- **`(scripting: enabled)`** is true when the browser runs JavaScript. The fills start empty from the first paint, so the prerendered page doesn't show full bars that empty and refill when the JS starts. Without JS, or with reduced motion, the bars are just full.
- **`:global()`**: `data-filling` is set by JavaScript, not in the template, so Svelte thinks the rule matches nothing and removes it from the CSS. `:global()` keeps it.
- **90ms per tick**: every bar fills at the same speed, so a longer one takes longer.

## A border that follows the pointer

When you point at a list, the borders near the pointer light up, each row in its own brand color. Another attachment sets `--x` and `--y` on every row on each `pointermove`: the pointer's position relative to that row. Because every row gets them, the light reaches the rows above and below.

The ring is a radial gradient centered there, cut down to the border with a mask:

```css
.skill::before {
	content: '';
	position: absolute;
	inset: -1px;
	padding: 1px;
	border-radius: inherit;
	background: radial-gradient(16rem circle at var(--x) var(--y), var(--glow), transparent 70%);
	mask:
		linear-gradient(#000 0 0) content-box exclude,
		linear-gradient(#000 0 0);
}
```

Two masks: one covers only the content box, the other the whole box, and `exclude` keeps what's in one but not both, which is the 1px padding. My first version also lit up the inside of the row, but on the light theme it washed everything out, so only the edges are left.

## The bump

The bar of the row you point at grows a little and settles back:

```css
.bar {
	display: inline-block;
	transform-origin: right;
	transition: scale 500ms var(--ease-spring-3);
}

.skill:hover .bar {
	scale: 1.12;
}
```

`--ease-spring-3` (from Open Props) is a `linear()` easing that overshoots and comes back: that's the bump. Two things I got wrong first: an inline `<span>` can't be scaled at all, and `transform-origin` belongs on `.bar`, not on the hover rule. Otherwise it jumps back to the center while the bar is still shrinking, and the bar slides sideways.

## A marquee without 168 KB of SVG

Above the skills, every brand logo slides by forever. It's the list twice, sliding left by exactly half its width: at that point the second copy is where the first one started, so the loop can't be seen.

The first version wrote every logo's path twice into the HTML: 168 KB, half the page. My first fix gave each path in the first copy an id and made the second copy point at it with `<use href="#logo-svelte">`: `<use>` draws a copy of an element that's already in the document. That saved 73 KB, but the skill rows still had every path too.

So now no path is in the page at all. Every logo lives in one file, `logos.svg`, which a SvelteKit endpoint writes at build time, and every icon on the page (the rows and both copies of the marquee) points into it:

```svelte
<svg viewBox="0 0 24 24" width="2rem" height="2rem" fill="currentColor">
	<use href="{resolve('/logos.svg')}#svelte" />
</svg>
```

The browser downloads that file once and caches it. The page went from 351 KB to 152 KB, and Lighthouse's performance score from 91 to 96. (How the file is made is in [its own post](./2026-11-03-icons-as-data-and-an-svg-sprite).)

One more thing about the strip: `contain: inline-size` keeps the page from measuring the whole track. Without it, the page grew 800px wider on a phone. `overflow: hidden` alone doesn't stop that.
