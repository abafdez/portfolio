---
title: Paper on the drawing board
date: 2026-11-09
tags: [css, accessibility, design-tokens]
---

## What we did

- Alfonso found text over the blueprint grid hard to read. A script went through every text node on one page of each kind and listed the ones with no background between them and the grid: posts and Devlog entries (up to 152 per page), the contrast checker's tables (225), page intros, form labels, breadcrumbs, the footer.
- A rule, now in CLAUDE.md: **the grid is for display headings and empty space; text at body size or smaller sits on a surface.** One global class, `.sheet` (global.css): opaque `--surface-1`, the page's own colour, with a border, so it reads as paper laid on the drawing board.
- Sheets on: every article (posts, entries), page intros, the tag sidebar, the Awesome filters, project and tool headers, the contrast checker, the CV form, each toolbox tool, the home page's intro column, the `/about` intro and its filter. The breadcrumbs became a small pill, and the footer got the page's paper behind it like the header.
- The cursors tool's tabs now join their panel, a sheet, like a folder's tab.
- After: only headings of 20px and up are left on the grid.
- On a phone (below 36rem) a sheet goes edge to edge, taking back `main`'s side padding, so its content keeps the width it had.
- Two old bugs fixed on the way. Two posts already scrolled sideways on a phone, because of a wide table: tables are now wrapped in a scroll box (`tables.ts`, a rehype plugin, a named region a keyboard can reach), and `main` got `min-inline-size: 0`. And three vague links ("Read more", "here") now say where they lead.

## What I learned

- Contrast isn't the only thing: even at 4.5:1, a line through the letters of small text tires the eye.
- Global layered styles lose to component styles, whatever the specificity: the CV's `fieldset { padding: 0; border: none }` silently took the sheet's padding and border away.
- A grid item won't shrink below its widest content (`min-width: auto`): one table on one page made the whole page wider than the phone. `min-inline-size: 0` lets it keep the column's width.
- A text input is about 20 characters wide by itself; as a grid item it needs `min-inline-size: 0` too.
- A scroll box needs `tabindex="0"` and a name, so a keyboard can scroll it; that's the one place Svelte's `a11y_no_noninteractive_tabindex` warning is wrong, and only it is let through.

## Problems & fixes

- The breadcrumb pill touched the sheet under it, and the two `/about` sheets touched each other: margins.
- Without JS on a phone, the `/about` aside would have been an empty sheet: hidden in that case.
- The Awesome list shifts by 0.014 (it was 0) while its filters appear: tiny, left for later.

## Links

- [MDN: `min-width: auto` for grid items](https://developer.mozilla.org/en-US/docs/Web/CSS/min-width#auto)
- [Deque: scrollable regions must be keyboard accessible](https://dequeuniversity.com/rules/axe/4.10/scrollable-region-focusable)
- [MDN: `@layer`](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer)

## Next

- Back to the toolbox: keyboard events.
