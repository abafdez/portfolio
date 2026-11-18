---
title: Wider pages and a text size
date: 2026-11-18
tags: [css, accessibility, fonts, layout]
---

## What we did

- `--content-width` grows with the window: `clamp(70rem, 82vw, 96rem)`. At 1920px it's 1536px instead of 1120px.
- Reading pages (posts, Devlog entries) keep their 80 characters a line and zoom in steps on wide screens: 1.12 from 100rem, 1.25 from 120rem, 1.4 from 150rem. At 1920px the column is 875px instead of 700px.
- The Devlog's handwritten font (Shantell Sans) is gone; it uses the body font like the rest of the site, and the package was uninstalled.
- A text size control in the theme menu: smaller, the percentage (an `<output aria-live>`), larger and reset, as Lucide icons. It sets `--text-scale` on `<html>`, and `html { font-size: calc(var(--text-scale, 1) * 100%) }` scales everything in rem. Saved in `localStorage` and restored in `app.html` before the first paint, like the theme.
- At 320px the header's four icons left no room for the name: below 24rem they're 2.5rem instead of 3rem.

## What I learned

- 80ch is measured in the element's own font, so a bigger font makes a wider column, but the headings are in `rem` and wouldn't grow with it. `zoom` scales everything inside by the same amount.
- `rem` in a media query is the browser's default size, not the page's root font size, so the text size setting doesn't move the breakpoints.
- The theme menu's button styles applied to every `<button>` in the component, including the new ones, and they'd have taken its `anchor-name` too: the menu's own button needed its own class.

## Next

- Lighthouse with the text at 137.5%.
