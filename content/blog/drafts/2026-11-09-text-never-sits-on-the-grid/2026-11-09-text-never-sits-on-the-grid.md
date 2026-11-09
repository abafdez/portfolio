---
title: 'Text never sits on the grid'
date: 2026-11-09
tags: [css, accessibility, design-tokens]
description: My site's background is a blueprint grid that lights up around the mouse. It looked great and read badly. How I found every piece of text sitting on it, and the one rule that fixed them all.
---

My site's background is a blueprint grid: thin lines, a `+` at every major crossing, and a glow that follows the mouse. It's the first thing people notice, and I like it. But reading on it was tiring. A week ago I measured the contrast of muted text over the lit lines and fixed the colours ([Decoration under text still needs contrast](/blog/2026-11-04-decoration-under-text-needs-contrast)). The ratios passed. It still read badly.

Contrast measures colour against colour. It says nothing about a line running straight through the middle of the letters. At heading size the letters are big enough to ignore it; at 16px, and worse at 12px, every line is a scratch through the text.

![A post's header before: the title, the description and the tags drawn straight over the grid lines](./before.png 'Before: every line of the description has grid lines through it.')

## Finding every place

I didn't want to eyeball twenty pages, so I asked the browser. For every text node on a page, a small script walks up its ancestors and checks whether any of them has a background. If none does, the text is drawn straight over the grid:

```js
let element = textNode.parentElement;
let covered = false;
while (element && element !== document.body) {
	const style = getComputedStyle(element);
	if (style.backgroundColor !== 'rgba(0, 0, 0, 0)' || style.backgroundImage !== 'none') {
		covered = true;
		break;
	}
	element = element.parentElement;
}
```

Run on one page of each kind, it listed 152 pieces of text on a single blog post, 225 in my contrast checker's tables, and every page intro, form label, breadcrumb and the footer. The skill windows on my About page weren't on the list: they're the one part of the site that already had a background, and the part that read well.

## One rule

Instead of fixing pages one by one, I wrote down a rule: **the grid is for display headings and empty space; text at body size or smaller sits on a surface.**

The surface is one class, `.sheet`:

```css
.sheet {
	padding: var(--size-5) clamp(var(--size-4), 4vw, var(--size-7));
	border: var(--border-size-1) solid var(--surface-3);
	border-radius: var(--radius-3);
	background-color: var(--surface-1);
}
```

The trick is the colour. `--surface-1` is the page's own background, the colour under the grid. So a sheet doesn't read as a box on top of the page: it reads as a piece of paper laid on the drawing board, with the grid still showing around it.

![The same header after: title, description and tags on a sheet, with the grid around it](./after.png 'After: the same page, the text on a sheet.')

Articles, page intros, the tag sidebar, the filters, the forms and the tools went on sheets. Big headings stayed on the grid, and so did the empty space between things, which is where the grid looks best anyway. Running the script again: nothing left but headings of 20px and up.

## What broke

**My global class lost to my components.** Global styles live in cascade layers; a component's styles are unlayered, and unlayered styles win over layered ones whatever the specificity. My CV builder's `fieldset { padding: 0; border: none; }` quietly took the sheet's padding and border away. The fix was to put them back in that component.

**Phones got narrower content.** A sheet's padding inside the page's own padding left 254px on a 320px screen, and a table and a form row didn't fit. On narrow screens a sheet now goes edge to edge, taking back the page's side padding: its content has the width it had before, and paper from side to side looks right on a phone.

**Two posts were already broken.** Testing at 320px turned up two posts that scrolled sideways before any of this, each because of one wide table. The page is a grid, and a grid item won't shrink below its widest content by default (`min-width: auto`), so one table made the whole page wider than the phone. `min-inline-size: 0` on `<main>` fixed the page; a small build step now wraps every table in a box that scrolls on its own, with `tabindex="0"` and a name so a keyboard can scroll it too.

## Links

- [MDN: `min-width: auto` for grid items](https://developer.mozilla.org/en-US/docs/Web/CSS/min-width#auto)
- [MDN: `@layer`](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer) (and why unlayered styles win)
- [Deque: scrollable regions must be keyboard accessible](https://dequeuniversity.com/rules/axe/4.10/scrollable-region-focusable)
