---
title: Tags everywhere
date: 2026-11-08
tags: [svelte, css, accessibility]
---

## What we did

- The Devlog got what the blog has: a tag sidebar beside the timeline and a page per tag, `/devlog/tags/[tag]` (and `/es/devlog/tags/[tag]`), grouped by phase. Its tags on cards and entry pages are links now (`devlogTag` in `links.ts`); the sitemap lists the new pages.
- The sidebar moved out of the blog page into `TagColumns.svelte`, and the timeline out of the Devlog page into `Timeline.svelte`, so the tag pages reuse them. `content.ts` gained `logTags`, `logTagged()`, `byPhase()` and `tagCloud()`, which builds any section's chips (count and hue, most used first).
- The Awesome list's filter buttons are the blog's chips now: `TagCloud` makes links or, given `pressed` and `ontoggle`, toggle buttons. A picked chip gets a ring in its colour and a tick.
- A link's tags on an Awesome list are clickable: `?tag=css` links, and a click filters in place, presses the chip and moves focus to it.
- Projects' tags stay plain text: there's no page of projects by tag for them to lead to.

## What I learned

- A picked chip changes its look without changing its size: an inset `box-shadow` adds a ring inside the border, where a thicker border would push its neighbours.
- `content: '✓' / ''` gives generated content alternative text, here none, so screen readers don't read a tick that `aria-pressed` already says.
- A link can do something else when clicked and still be a link: `preventDefault()` only for a plain left click, so Ctrl+click and "open in a new tab" still get the URL.
- The prerender crawler ignores a link's query string, so `?tag=css` links don't make extra pages.

## Next

- Animate cards into the post they open (title and thumbnail morphing into the article).
