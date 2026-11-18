---
title: Zoom for a wider reading column, and a text size control
draft: true
date: 2026-11-18
tags: [css, accessibility, layout, fonts]
description: Full screen on a big monitor, my pages were a narrow strip. Wider pages, a reading column that keeps 80 characters a line but grows, a text size control that's restored before the first paint, and one font fewer.
---

On a laptop my pages looked right. Full screen on a big monitor they were a narrow strip with wide empty margins: every page was capped at 70rem, 1120 pixels.

## Pages that grow with the window

The page width is one token, so the fix is one line:

```css
--content-width: clamp(70rem, 82vw, 96rem);
```

82% of the window, never narrower than before, never wider than 1536 pixels. The home page, the lists and the tools use the room.

## A reading column that keeps 80 characters

Posts are different. A line of about 80 characters is comfortable to read; much longer and your eyes lose their place going back to the start of the next one. So the reading column is `80ch` wide, and on a big screen 80 characters at 16 pixels is still narrow.

The answer is to keep 80 characters and make the characters bigger. `ch` is measured in the element's own font, so a bigger font gives a wider column. But a bigger `font-size` alone doesn't work here: the headings, code and small text are sized in `rem`, which doesn't follow the column's font, so the body text would catch up with the headings. CSS `zoom` scales everything inside an element by the same amount, text, headings, code, pictures and spacing:

```css
@media (min-width: 120rem) {
	main[data-composition='reading'] {
		zoom: 1.25;
	}
}
```

with steps at 100rem (1.12) and 150rem (1.4). At 1920 pixels the column goes from 700 to 875 pixels and still holds 80 characters a line.

![A post at 1920 pixels: the column is wider and the text bigger, still about 80 characters a line](./reading-1920.png 'The same post at 1920 pixels wide, zoomed 1.25')

## A text size control

The theme menu now has a text size row: smaller, the size in percent, larger and reset, as icons. It sets one custom property on `<html>`:

```css
html {
	font-size: calc(var(--text-scale, 1) * 100%);
}
```

Everything on the site is in `rem`, so text and spacing grow together, on top of whatever size the browser is set to. The choice is saved, and a tiny script in the page's `<head>` puts it back before the first paint, the same way the theme does, so a bigger size never flashes small first. Media queries don't move with it: a `rem` in a media query is the browser's default size, not the page's.

## One font fewer

The Devlog had a font of its own, a handwritten one. It looked friendly in a title and was tiring in long entries, so it's gone. The Devlog reads in the same system font as everything else, and the site downloads one font file less.
