---
title: A footer that opens
date: 2026-11-18
tags: [svelte, animation, accessibility, css]
---

## What we did

- Replaced the floating "scroll to the footer" chevron, which covered text, with a faint handle at the bottom edge. It grows, lifts, turns green and shows "About me and hiring" as the pointer gets within 10rem of the bottom (`--near`, 0 to 1, from `pointermove`, once a frame). It fades out as the footer enters (a view timeline).
- The handle and the footer's own button (a green pill with a light that sweeps across it) open a bottom-sheet popover: a top card, then three columns (who I am, hire me, elsewhere).
- The top card has five looks, the next one on every open: a terminal that types itself while the photo sharpens from pixels, a spotlight card with a turning ring and counters, a business card that flips, an open-to-work card with a glitching photo and a magnetic button, and an ID card in 3D that tilts toward the pointer.
- Each column has an effect on its border: a light that follows the pointer (who I am, elsewhere) or a beam running round (hire me). Elsewhere's links have icons that pop.
- An email button is ready but hidden until an address is set in `links.ts`.

## What I learned

- A tilted card can make its container scroll sideways: transformed boxes count as scrollable overflow. `overflow: hidden auto` on the panel scrolls up and down only.
- `preserve-3d` is flattened by any ancestor between the card and its parts that clips (`overflow: hidden`), so the 3D card can't clip.
- GitHub's noreply address can't receive mail, so it can't be a contact address; a forwarding alias can.
- Under reduced motion every look is still: no typing, counting, tilting, beam or sparkles.
- The first tilt listened on the card and measured it tilted: it jumped on hover, and at the edge the tilted card slid out from under the pointer, reset, came back, again and again. Now it listens to the whole page, starts leaning within 140 px, measures the untilted box (`offsetLeft`/`offsetWidth` ignore transforms) and eases the angles every frame in script instead of a CSS transition.

## Next

- Choose the contact address.
