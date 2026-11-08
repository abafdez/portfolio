---
title: 'A tag sidebar that fades out'
date: 2026-11-08
tags: [css, accessibility, svelte]
description: My blog page opened with a wall of 55 tag links. Now it's a sidebar of coloured chips, most used first, that fades out into a button, and what fades out is really gone for the keyboard too.
cover: Coloured tag pills arranged around a glowing sphere.
---

The first thing you saw on my blog page was a wall of words: every tag, A to Z, 55 of them. More than half were on a single post.

<!-- TODO: Alfonso, a before and after screenshot of /blog. -->

## How others do it

Before styling anything, I looked at a few blogs I like:

- [Kent C. Dodds](https://kentcdodds.com/blog) shows about twenty topics as pills that filter the posts on the same page.
- [Josh Comeau](https://www.joshwcomeau.com/) has eight categories in a sidebar next to the posts. Fewer is the point.
- [Maggie Appleton](https://maggieappleton.com/garden) puts her topics in one row that scrolls sideways: tidy, but you only see the first five.
- [Jim Nielsen](https://blog.jim-nielsen.com/tags/) lists every tag with its count, much like I did, but on a page of its own, not on the blog's front page.

The lesson: my problem wasn't style, it was quantity. I went with Josh's two columns, and fewer tags up front.

## Most used first, then a fade

The tags are sorted by how many posts use them, and the list is folded to a few rows. The last row fades out into a **+** button that opens the rest. The fade is a mask on the list, a gradient from opaque to transparent over its last row.

A fade has a catch. A tag you can barely see is still a link: the keyboard can still land on it, and a screen reader still reads it. So the faded row, and everything below it, gets the `inert` attribute until the list opens. An inert element can't take focus or clicks, and assistive technology skips it. Which tags are under the fade depends on how the chips wrap, so a `ResizeObserver` measures again whenever the list changes width.

When the list opens, focus moves to the first tag that was hidden, since that's what you asked to see.

<!-- TODO: Alfonso, tab through the folded list, then open it: where does focus go? -->

## No JavaScript, no jump

The fold is in the CSS from the start, under `@media (scripting: enabled)`. If I added it once the JavaScript ran, the page would load with every tag showing and then jump up as the list folded. Without JavaScript, the media query doesn't match: every tag shows and the button stays hidden, because nothing could open it.

## A colour for every tag

Each tag gets a hue from a small hash of its name, so `css` is always the same colour. Its lightness comes from the theme's brand colour, so the tags fit every theme and both modes. The colour shows as a stripe on the chip's edge, a faint tint behind it, and a ring that lights up near the pointer.

A tint is a new background, so it needs its own contrast check. I checked the text on every hue in steps of three degrees, in every colour theme, light and dark. The worst was 4.81:1, above the 4.5:1 that body text needs, so a new tag can't break it.

<!-- TODO: Alfonso, the tag colour you like most. -->

**Update:** the sidebar is a component now, `TagColumns.svelte`, and the Devlog has one too. The Awesome lists use the same chips as their filters: `TagCloud` makes links or, given `pressed` and `ontoggle`, toggle buttons.

## One surprise: the cover got slower

Folding the tags made the page better on a phone, and Lighthouse's score went down. Before, the tag wall pushed the first post below the fold. Now its cover image is on screen when the page loads, so it's the largest thing the browser paints, and that's what Largest Contentful Paint measures. I made it load at once and with high priority, which is the right thing for that image, even though the simulated number barely moved.

## Links

- [MDN: inert](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inert)
- [MDN: scripting media feature](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/scripting)
- [MDN: mask-image](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-image)
- [web.dev: Optimize LCP](https://web.dev/articles/optimize-lcp)
