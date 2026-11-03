---
title: 'Windows that collapse, open as you read, and still show up in Ctrl+F'
date: 2026-11-03
tags: [svelte, accessibility, html, css]
description: A collapsible section that works without JS, opens by itself as you scroll, remembers what you chose, and doesn't hide its content from find in page.
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

`ready` matters. Before the JavaScript starts, the attribute isn't there and a CSS rule hides collapsed lists instead (`:not([data-ready])`). Once it runs, the rule stops matching and the attribute takes over. If the CSS kept a `display: none`, it would override `until-found` and the search would find nothing.

<!-- TODO: try it: collapse a window, press Ctrl+F, search for a skill inside it -->

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

Once you open or close a window yourself, it stops opening by itself, and your choice is kept for your next visit:

```ts
function toggle() {
	open = !open;
	chosen = true;
	try {
		localStorage.setItem(key, JSON.stringify({ ...saved(), [group.id]: open }));
	} catch {
		// Not remembered, that's all.
	}
}
```

`localStorage` can throw: in some private windows, or when storage is blocked. So every use is in a `try`, and without storage the windows just don't remember.

<!-- TODO: what a screen reader says on the title bar, collapsed and open -->

## One side effect

My section nav highlights the section you're reading, and it recomputed on scroll. But a window that opens by itself makes the page taller without any scroll, and the highlight went stale. A `ResizeObserver` on the body fixed it: the nav now also updates whenever the page changes height.
