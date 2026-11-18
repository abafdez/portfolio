---
title: A hire-me panel with five looks
draft: true
date: 2026-11-18
tags: [svelte, animation, css, accessibility]
description: 'My footer now opens a panel about me and how to hire me, with a top card that changes look every time: a terminal, a spotlight, a business card, an open-to-work card and an ID card in 3D. How each one works, and how to keep five effects calm.'
---

My footer used to have a floating green button that scrolled you down to it. It covered text, and the footer it scrolled to was one thin line. Now the footer opens a panel: who I am, how to hire me and where else to find me, with a card on top that has five looks, one per opening.

## A handle that notices you

Instead of the button there's a faint grip at the bottom edge, like the handle of a sheet on a phone. As the pointer gets within 10rem of the bottom, it grows, lifts, turns green and shows "About me and hiring". That's one custom property, `--near`, from 0 to 1, written from `pointermove` at most once a frame, straight to the element's style: Svelte state would re-render for nothing on every mouse move. It fades away as the footer scrolls into view, with a scroll-driven animation, because then the footer's own button is on screen.

## A sheet from the bottom

The panel is a popover, so Escape and a click outside close it, and focus goes back to the button that opened it. It rises from the bottom with `@starting-style` and `allow-discrete`, the same technique as the search box. Its columns have their own effects on the border: a light that follows the pointer, and a beam that keeps running round the "Hire me" column, a conic gradient whose angle is a registered custom property, so it can be animated.

## Five looks

![The terminal look: a window with three lights, the photo, and typed lines: whoami, cat hire.txt, contact --linkedin](./terminal.png 'The terminal types itself while the photo comes into focus')

1. **Terminal**: `$ whoami`, `$ cat hire.txt` and `$ contact --linkedin` type themselves in about two seconds, while the photo sharpens from big pixels. The pixels are a canvas: the photo drawn 6, 12, 24 and 48 pixels across, each blown up without smoothing. Screen readers get the finished text at once; the typing is hidden from them.
2. **Spotlight**: the photo in a turning ring, a grid lit under the pointer, and numbers that count up.
3. **Business card**: it flips in, and a button turns it over. The face turned away is `inert`, so it can't be focused or read until it's showing.
4. **Open to work**: a pulsing badge, a photo that glitches in red and cyan on hover (an SVG filter the colour themes already use), and a button that leans toward the pointer and gives off sparkles.
5. **ID card in 3D**: it tilts toward the pointer, and its parts sit at different depths, so they separate as it turns.

![The 3D ID card tilted toward the pointer, with a green foil sheen across it](./id-card.png 'The ID card tilts, and the photo sits in front of the card')

At first every look tilted. One 3D card is a surprise; five are a theme park, so the tilt became its own look. It also made the panel scroll sideways: a transformed box still counts as overflow for its scrolling container. `overflow: hidden auto` on the panel lets it scroll up and down only. And `preserve-3d` is flattened by any ancestor that clips, so the 3D card itself can't use `overflow: hidden`.

## Calm by default

Each look loads only when it's shown. With reduced motion none of them moves: no typing, counting, ring, flip animation, tilt, beam or sparkles. They're still five ways to show the same three things: my face, what I do, and how to reach me.

![The spotlight look over the three columns: who I am, hire me, and the elsewhere links with icons](./spotlight.png 'The spotlight look, with the three columns under it')
