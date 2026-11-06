---
title: A header that detaches and a footer that hints, with scroll-driven animations
date: 2026-10-31
phase: 4.5
tags: [css, scroll-driven-animations, accessibility, inspiration]
---

## What we did

- Saved [julibe.com](https://julibe.com) (and its [Pillars](https://julibe.com/pen/pillars/) page) to my notes as inspiration. From it I picked: the colored scrollbar, the top menu detaching on scroll, and the hidden footer that hints there's more. Not the audio. Section snapping waits for the landing layout.
- Scrollbar: thin, accent thumb on the page background.
- Header: at the top it sits flat with the page. Over the first 5rem of scrolling it lifts into a floating bar (border, rounded corners, see-through blurred background, shadow). Sticky from 48rem; on phones it's two rows tall, so it scrolls away.
- Footer: its content slides in as it enters the screen. Until then, a green chevron tab bobs at the bottom of the screen and fades out as the footer arrives. Clicking it scrolls to the footer.
- Tested on the built site at 320px and desktop, in both themes, and with reduced motion.

## What I learned

- `animation-timeline` replaces time with something else. `scroll()` is the page's scroll position; `view()` (or a named `view-timeline`) is one element crossing the viewport.
- `animation-range` sets where 0% and 100% are. The header uses `0 var(--size-10)`: the whole animation happens in the first 5rem of scroll. The footer uses `entry 0% entry 100%`: from the moment it starts entering until it's fully in.
- `view-timeline: --footer` on the footer gives the timeline a name, so its children (the hint, the content) can use it.
- The header's normal styles are the floating bar; the keyframes only have a `from` (flat). Where scroll-driven animations aren't supported, or with reduced motion, the animation doesn't run and you get the finished look.
- The same idea for the hint: it's `display: none` unless the animation can run, because without it nothing would ever hide it.
- Two animations on one element would fight over the same property, so the time-based bob runs on the `svg` and the scroll-driven fade on the link.
- Everything sits in `@supports (animation-timeline: …)` plus `@media (prefers-reduced-motion: no-preference)`.
- The hint is decoration: `aria-hidden="true"` and `tabindex="-1"`. Keyboard and screen reader users reach the footer normally.
- `scrollbar-color` and `scrollbar-width` are the standard properties (Firefox, Chrome 121+); no need for `::-webkit-scrollbar`.
- `scroll-behavior: smooth` only inside `no-preference`, so in-page jumps don't glide for people who asked for less motion.

## Links

- [MDN: CSS scroll-driven animations](https://developer.mozilla.org/docs/Web/CSS/CSS_scroll-driven_animations)
- [MDN: animation-range](https://developer.mozilla.org/docs/Web/CSS/animation-range)
- [scroll-driven-animations.style](https://scroll-driven-animations.style) by Bramus, demos and a range visualizer
- [MDN: scrollbar-color](https://developer.mozilla.org/docs/Web/CSS/scrollbar-color)

## Next

- The landing layout: sticky intro, scroll-spy nav, snapping.
