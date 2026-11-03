---
title: 'Windows that collapse, open as you read, and still show up in Ctrl+F'
date: 2026-11-03
tags: [svelte, accessibility, html, css]
description: A collapsible section that works without JS, opens by itself as you scroll, respects what you chose, and doesn't hide its content from find in page.
---

My about page groups my skills into terminal windows, ten of them, about ninety skills in all. That's a long page, so I made the windows collapse, Mac style: collapsed, a window keeps its name, a line about it, a few skills as chips, and its icons in the title bar.

The usual way to collapse things is `<details>`. I didn't use it here: the summary would have to hold the heading, and some screen readers drop a heading's role inside a summary, which is a button. Instead, the title bar is a real `<button>` with `aria-expanded`. Then I had to do what `<details>` gives for free, and a few things it doesn't.

<!-- TODO: a short video: scrolling down as windows open, collapsing one, reloading -->

## Without JavaScript, everything is open

The button needs JavaScript, so without it nothing should look collapsible. Collapsed styles only exist inside `@media (scripting: enabled)`, and the hint is hidden in `(scripting: none)`:

```css
@media (scripting: enabled) {
	.window:not([data-open]) .chips {
		display: flex;
	}
}

@media (scripting: none) {
	.hint {
		display: none;
	}
}
```

## Hidden, but searchable

A collapsed list could be `display: none`, but then Ctrl+F can't find "Docker" in it. `hidden="until-found"` hides content and still lets find in page search it. When there's a match, the browser fires `beforematch` on the element just before revealing it:

```svelte
<div
	id="{group.id}-skills"
	hidden={ready && !open ? 'until-found' : undefined}
	{@attach openOnFind}
>
```

```ts
const openOnFind: Attachment<HTMLElement> = (list) => {
	const show = () => (open = true);
	list.addEventListener('beforematch', show);
	return () => list.removeEventListener('beforematch', show);
};
```

`ready` matters: the attribute only goes on once the JavaScript runs. Before that, a collapsed list just sits in a row of height zero (more on that below). And never a `display: none` from the CSS: it would override `until-found`, and the search would find nothing.

<!-- TODO: try it: collapse a window, press Ctrl+F, search for a skill inside it -->

## Animating to and from nothing

CSS can't animate `height: auto`. It can animate a grid row from `1fr` (as tall as its content) to `0fr` (nothing):

```css
.reveal {
	display: grid;
	transition: grid-template-rows 400ms var(--ease-out-3);

	& > * {
		min-block-size: 0;
		overflow: clip;
		overflow-clip-margin: var(--size-1);
	}
}

.content {
	grid-template-rows: 1fr;
}

.window:not([data-open]) .content {
	grid-template-rows: 0fr;
}
```

`min-block-size: 0` lets the child shrink below its content, and `overflow: clip` cuts what doesn't fit. The clip margin keeps the glowing borders of my rows from being cut at the edges. The chips use the same trick the other way round, so they grow while the list shrinks.

There's a catch with `hidden="until-found"`: it hides the list at once, before there's anything left to shrink. So the window sets it when the collapse ends:

```ts
function collapsed(event: TransitionEvent) {
	if (event.target !== event.currentTarget) return;
	if (event.propertyName === 'grid-template-rows' && !open) shut = true;
}
```

`transitionend` bubbles, and the list is full of transitions (a bar grows when you point at it), so it only listens to its own row. With reduced motion there's nothing to wait for, and the list is hidden straight away.

<!-- TODO: collapse a window with the Animations panel in DevTools open, and slow it down -->

## The title bar

The lights say the state: green (zoom) while a window is open, yellow (minimize) while it's collapsed, with a spring easing so the light that turns on pops a little.

Collapsed, the title bar shows the window's icons, like a dock. They pop in one after another: an animation runs whenever its element goes from `display: none` to shown, so it replays on every collapse, and each icon's `--i` delays it a little more. When there are more icons than room, a `ResizeObserver` notices, a second copy of the icons follows the first, and they loop like the logo strip at the top of the page.

## Opening as you read

The windows start collapsed and open by themselves as they come up the screen:

```ts
const observer = new IntersectionObserver(
	([entry]) => {
		if (!entry.isIntersecting || chosen) return;
		open = true;
		observer.disconnect();
	},
	{ rootMargin: '0px 0px -33% 0px' }
);
```

The `rootMargin` cuts the bottom third off the screen, so a window opens once it's in the top two thirds. It's a region on purpose. I'd just learned (with my section nav) that an observer watching a thin line misses things on a fast scroll, but where a scroll stops, a window on screen is inside the region.

The page is prerendered, so the server can't know what's on screen. It opens the first window, the one you see when the page loads. If every window started collapsed, the first one would open right after load and push everything down.

## The visitor's choice wins

Once you open or close a window yourself, it stops opening by itself:

```ts
function toggle() {
	show(!open);
	chosen = true;
}
```

My first version also saved each choice in `localStorage`, for the next visit. I took it out: coming back to a page with half its windows closed, and no memory of closing them, felt broken. Now a reload starts fresh.

<!-- TODO: what a screen reader says on the title bar, collapsed and open -->

## One side effect

My section nav highlights the section you're reading, and it recomputed on scroll. But a window that opens by itself makes the page taller without any scroll, and the highlight went stale. A `ResizeObserver` on the body fixed it: the nav now also updates whenever the page changes height.
