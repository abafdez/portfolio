---
title: 'A blueprint grid in pure CSS, with a cursor spotlight'
date: 2026-10-31
tags: [css, backgrounds, masks, svelte]
draft: true
description: A graph-paper background made of four gradients, plus marks drawn with a mask, and a spotlight that lights up the grid around your mouse. One fixed layer, no images, and it follows the theme.
---

My site's look is "technical": terminal, code, blueprints. So the background is a blueprint grid: faint lines, stronger lines every few cells, a small "+" where the strong ones cross, and, if you have a mouse, a green glow that follows it.

<!-- TODO: a screenshot of the grid, and a short GIF of the spotlight -->

It's all one Svelte component, `Blueprint.svelte`, mounted once in the root layout.

## A line is a gradient with a hard stop

A `linear-gradient` normally blends between colors. If two stops sit at the same position, there's no blend, just a hard edge:

```css
linear-gradient(var(--line) 1px, transparent 1px)
```

That's 1px of `--line`, then transparent. With `background-size: 1.5rem 1.5rem`, that tile repeats, and you get a horizontal line every 1.5rem. Rotate it with `90deg` for the vertical lines.

The whole grid is four of these, two for each size:

```css
.grid {
	--major: calc(var(--grid-size) * 4);

	background-image:
		linear-gradient(var(--line-major) 1px, transparent 1px),
		linear-gradient(90deg, var(--line-major) 1px, transparent 1px),
		linear-gradient(var(--line) 1px, transparent 1px),
		linear-gradient(90deg, var(--line) 1px, transparent 1px);
	background-size:
		var(--major) var(--major),
		var(--major) var(--major),
		var(--grid-size) var(--grid-size),
		var(--grid-size) var(--grid-size);
}
```

**The first background is painted on top**, so you list them from closest to farthest. The major lines come first so they sit above the minor ones where they cross.

The line colors are the text color mixed with transparent:

```css
--grid-line: color-mix(in oklch, var(--text-1) 3%, transparent);
--grid-line-major: color-mix(in oklch, var(--text-1) 6%, transparent);
```

`--text-1` already flips with the theme, so the grid does too, for free.

## The pluses: an SVG used as a mask

I wanted the "+" marks in a theme color. An SVG in a data URI can't read CSS variables, but it doesn't have to: I use it as a **mask**, not as an image. A mask only says where the element shows; the color comes from `background-color`.

```css
.marks {
	background-color: var(--grid-mark);
	mask-image: url('data:image/svg+xml,…a plus in the middle of a 96×96 tile…');
	mask-size: calc(var(--grid-size) * 4) calc(var(--grid-size) * 4);
	mask-position: calc(var(--grid-size) * -2) calc(var(--grid-size) * -2);
}
```

The plus is drawn in the middle of its tile, so I shift the tiles by half a tile. Now each plus lands on a major crossing.

## Fading out

The grid is strongest at the top and fades toward the bottom corners, with another mask:

```css
--fade: radial-gradient(ellipse 120% 100% at 50% 0%, black 30%, transparent 100%);
```

The pluses need both masks at once: the plus shape and the fade. `mask-composite: intersect` keeps only what both let through.

## Behind everything

```css
.blueprint {
	position: fixed;
	inset: 0;
	z-index: -1;
	pointer-events: none;
}
```

`z-index: -1` puts the layer above the body's background color but below all the page content. `pointer-events: none` means it never catches a click.

## The spotlight

The spotlight is the same grid again, with the line colors swapped for the accent:

```svelte
<div class={['grid', 'spot', pointer && 'on']}></div>
```

```css
.spot {
	--line: color-mix(in oklch, var(--brand) 25%, transparent);
	--line-major: color-mix(in oklch, var(--brand) 45%, transparent);
	mask-image: radial-gradient(circle 14rem at var(--x) var(--y), black, transparent);
}
```

The mask shows it only in a circle around `--x`/`--y`. Svelte writes those two from the pointer position:

```svelte
<script lang="ts">
	let pointer = $state<{ x: number; y: number } | null>(null);

	function onpointermove(event: PointerEvent) {
		if (event.pointerType === 'mouse') pointer = { x: event.clientX, y: event.clientY };
	}
</script>

<svelte:window {onpointermove} />

<div class="blueprint" style:--x={pointer && `${pointer.x}px`} style:--y={pointer && `${pointer.y}px`}>
```

Touch has no hover, so a finger on a phone shouldn't drag a glow around. Two guards:

- in JS, `pointerType === 'mouse'` ignores touch and pen;
- in CSS, the spotlight only exists inside `@media (hover: hover) and (pointer: fine)`.

When the mouse leaves the window, `mouseout` fires with `relatedTarget` set to `null` (it isn't going to another element), and the spotlight fades out.

<!-- TODO: try it: change --grid-size in DevTools, or the 14rem radius, and describe what looked best -->

## Links

- [MDN: Using multiple backgrounds](https://developer.mozilla.org/docs/Web/CSS/CSS_backgrounds_and_borders/Using_multiple_backgrounds)
- [MDN: mask-image](https://developer.mozilla.org/docs/Web/CSS/mask-image)
- [MDN: mask-composite](https://developer.mozilla.org/docs/Web/CSS/mask-composite)

Next: [a header and footer that react to scrolling](./2026-10-31-scroll-driven-header-footer).
