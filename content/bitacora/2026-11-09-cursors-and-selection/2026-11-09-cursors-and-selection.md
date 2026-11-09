---
title: Cursors and selection, a tool that is also a guide
date: 2026-11-09
phase: 8.5
tags: [css, ux, accessibility]
---

## What we did

- The toolbox's third tool (`/projects/toolbox/cursors`), Alfonso's idea: one page that is both a guide and a playground, in five sections, each with what it does, when to use it, what to avoid, a demo and the CSS to copy.
- **The cursor:** all 36 keywords in MDN's six groups; each tile wears its own cursor, and a click copies `cursor: grab;`.
- **Your own cursor:** an SVG cursor builder (four shapes of our own, colour, size, hotspot, fallback), a zoomed preview with the hotspot marked, and an area that uses it.
- **`pointer-events`:** a striped layer over a button, with click counters; with `pointer-events: none` the click goes through, and Tab + Enter reach the button either way.
- **`user-select`:** `none`, `auto`, `all` and `text` side by side, and a readout of what got selected (`selectionchange`).
- **`::selection`:** colour pickers, the contrast of the pair against WCAG (the contrast checker's own `contrast()`), and a button that selects the sample.
- Then, with Alfonso: **tabs**, one per part, because one long page was too much (the ARIA tabs pattern: arrow keys, Home and End, the open tab in the URL's hash; without JS every part shows). Panels are hidden by CSS under `@media (scripting: enabled)` and marked `data-active` in the HTML, so nothing jumps when the page wakes up.
- A **note for phones and tablets** at the top, only under `@media (hover: none)`: most of the page needs a mouse or a trackpad.
- **Animated cursors**, the technique behind alienmelon's animatedWebCursors: browsers draw only a GIF's first frame, so a timer swaps the `cursor` image instead. Our own SVG frames (spinner, blinking block, pulse), each with its own hotspot, and a card where a heading, some text and a button each get one. The repo has no licence, so no code or images came from it (and its GIFs are Windows XP's cursors, Microsoft's artwork).
- **Effects that follow the pointer** (trail, sparkles, a lagging ghost arrow): a canvas over the area with `pointer-events: none`, drawing only while something moves. Both kinds stay still with reduced motion.
- **GIFs**, at Alfonso's question: a GIF as a cursor shows only its first frame (Firefox's bug about it has been open since 2009), so the Animated tab shows the sample GIF both ways, frozen as a plain cursor and moving once split into frames in the browser (`ImageDecoder`, WebCodecs; each frame scaled to 32 × 32 on a canvas, played with its own duration). You can choose a GIF of your own too. The sample, `spinner.gif`, is ours: `scripts/cursor-gif.ts` (`pnpm data:cursor-gif`) draws the spinner's SVG frames with sharp and joins them into an animated GIF (2.2 KB).
- **More effects**, from the list on tgomilar's mouse-animations (MIT; our own code, not the library): twelve now, picked from a grouped list with a one-line "how to try it", in a small scene (a magnetic button, a card that tilts, shapes for parallax). Drawn on the canvas: trail, sparkles, ghost, dot and ring (the real cursor hides in the scene), ripple and burst on a click. Pure CSS from the pointer's position as custom properties (`--x`, `--y`, `--dx`, `--dy`): spotlight, flashlight, invert (`backdrop-filter: invert(1)`, no colour of its own), parallax. Moved in JavaScript: magnetic, tilt.
- **CSS alone** can do it too: `cursor` is a discrete property, so `@keyframes` with one keyframe per frame steps through the images (checked in Chromium: the computed cursor changes). The snippet is on the page next to the JavaScript one.
- Facts checked against MDN and its browser-compatibility data; the guide's text is our own words (MDN's prose is CC BY-SA).

## What I learned

- A cursor image needs a keyword fallback, last; its hotspot defaults to the top-left corner; Chromium and Firefox ignore cursors over 128 × 128, and 32 × 32 is the size to aim for.
- An SVG cursor needs a `width` and `height` of its own, and its colours as values: CSS variables don't reach inside a data URL.
- `pointer-events: none` stops the mouse, not the keyboard: it's for decoration, never for disabling.
- Safari still needs `-webkit-user-select`; iOS Safari ignores `::selection` altogether.
- A repo with no licence is all rights reserved, and no licence could cover artwork that was never the author's to give.
- Changing only the hash doesn't reload the page, so `onMount` doesn't run again: the tabs listen for `hashchange` too.
- In tests, role queries skip hidden elements: a control in a closed tab needs a plain CSS locator.

## Problems & fixes

- `pnpm add -D sharp` wrote a lockfile entry for a variant of sharp that was never installed (the installed one depends on `@types/node`), so `node_modules/sharp` pointed nowhere and `--force` didn't help. Pointing the entry at the installed variant, then `pnpm install --frozen-lockfile`, fixed it.
- Two of the effects were too subtle (Alfonso): the tilt turned 8° on a flat card, which looked like nothing, so now it's 14° under a shorter perspective with a highlight and a shadow; a bouncing arrow moved only 3px, and even at 10px Alfonso preferred to drop it. And a test that measured an element right after scrolling to it was racing the site's smooth scroll: it turns smooth scrolling off first.

## Links

- [MDN: `cursor`](https://developer.mozilla.org/en-US/docs/Web/CSS/cursor)
- [MDN: `pointer-events`](https://developer.mozilla.org/en-US/docs/Web/CSS/pointer-events)
- [MDN: `user-select`](https://developer.mozilla.org/en-US/docs/Web/CSS/user-select)
- [MDN: `::selection`](https://developer.mozilla.org/en-US/docs/Web/CSS/::selection)
- [MDN browser-compat-data](https://github.com/mdn/browser-compat-data)

## Next

- Tweaks with Alfonso, then the keyboard events tool.
