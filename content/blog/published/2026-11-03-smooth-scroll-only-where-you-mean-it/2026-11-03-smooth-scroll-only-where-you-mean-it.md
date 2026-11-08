---
title: 'Smooth scrolling, only where you mean it'
date: 2026-11-03
tags: [sveltekit, css]
description: One line of CSS made every page change in my SvelteKit site glide up from wherever the last page was scrolled. The fix is a data attribute and two navigation hooks.
cover: A finger on a scrollbar, with an ease-in-out curve beside it.
---

I had this in my global CSS, so in-page links (my "on this page" nav, a "scroll down" hint) would glide instead of jump:

```css
@media (prefers-reduced-motion: no-preference) {
	html {
		scroll-behavior: smooth;
	}
}
```

It worked for those links. It also did something I didn't notice for a while: when I went from a page scrolled halfway down to another page, the new page appeared halfway down too, and then glided up to the top.

## Why

When SvelteKit navigates, it scrolls the window itself: to the top of the new page, or back to where you were if you reload or go back. `scroll-behavior` applies to every scroll that doesn't ask for a behavior of its own, so SvelteKit's jump became a smooth scroll that started on the old position.

I measured it to be sure, sampling `scrollY` every 250ms after clicking a link: 1047, 389, 1, 0. A glide over half a second.

## The fix

Smooth scrolling only applies when an attribute says so:

```css
@media (prefers-reduced-motion: no-preference) {
	html[data-smooth-scroll] {
		scroll-behavior: smooth;
	}
}
```

And the root layout takes it away while SvelteKit navigates:

```ts
onNavigate(() => {
	delete document.documentElement.dataset.smoothScroll;
});

afterNavigate(() => {
	requestAnimationFrame(() => (document.documentElement.dataset.smoothScroll = ''));
});
```

`onNavigate` runs before the page changes. `afterNavigate` runs once the new page is in place, and also after the very first load. SvelteKit has done its scrolling by then, and the `requestAnimationFrame` waits one more frame to be sure. The first load never had the attribute, so a reload halfway down jumps straight back to where you were.

Links inside a page aren't SvelteKit navigations, so they still glide. After the fix, the same measurement: 1047, 0.
