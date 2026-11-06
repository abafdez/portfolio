---
title: 'Pages that jump: fixing layout shift on a static site'
date: 2026-11-06
tags: [performance, lighthouse, fonts, svelte]
description: Three of my pages scored under 90 in Lighthouse for one reason, content moving after it appears. Two causes, web fonts and content added by JavaScript, and how I fixed each.
cover: Diagram representing layout shift.
---

You start reading, or reach for a link, and the page jumps. That's a **layout shift**, and Lighthouse measures it as **CLS**, Cumulative Layout Shift: how much visible content moved, and how far. Under 0.1 is good.

I ran Lighthouse on one page of each kind on my site. Accessibility, best practices and SEO were 100 everywhere, and performance mostly 95 to 98. Three pages weren't: a Bitácora entry at 89, an Awesome list at 91, and my contrast checker at 86. All three had the same problem: CLS between 0.14 and 0.24.

## Finding what moved

The Lighthouse report has an audit called "Avoid large layout shifts". It lists each element that moved, how much it counted, and often why:

```text
0.073  article > div.prose > ul > li   cause: Web font loaded …shantell-sans-latin-wght-normal.woff2
0.159  main > section                   (no cause: something above it changed size)
0.234  main > div.themes > section
```

Two different causes.

## Cause 1: web fonts

My site uses two web fonts. When a page loads, the browser:

1. reads the HTML;
2. finds the CSS and downloads it;
3. reads the CSS, finds the `@font-face` rules, and only now starts downloading the fonts.

Meanwhile it shows the text in a fallback font, a system one, which has different letter widths. When the real font arrives, the lines wrap differently and everything below them moves.

The fix is to tell the browser about the fonts in step 1, with a preload in the HTML's `<head>`:

```html
<link
	rel="preload"
	href="…/fira-code-latin-wght-normal.woff2"
	as="font"
	type="font/woff2"
	crossorigin
/>
```

I don't write that by hand: the file names have a hash that changes with every build. SvelteKit can add them, from a `handle` hook:

```ts
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit/hooks';

const latin = /-latin-wght-normal\.woff2$/;

export const handle: Handle = ({ event, resolve }) =>
	resolve(event, {
		preload: (file) =>
			file.type === 'js' ||
			file.type === 'css' ||
			(file.type === 'font' && latin.test(file.filename))
	});
```

By default SvelteKit preloads JavaScript and CSS; this keeps that and adds fonts. But only the **Latin** files. My fonts come from Fontsource, which splits each font into one file per alphabet (Latin, Latin Extended, Cyrillic, Greek…), each with a `unicode-range`. The browser only downloads the ones a page actually uses. Preload them all and every visitor downloads every alphabet.

## Cause 2: content added by JavaScript

My site is prerendered: every page is an HTML file, made at build time, that works without JavaScript. Some parts only make sense with JavaScript, so I added them once it ran:

- the Awesome list's search box and tag filters, with `{#if ready}` (`ready` set in `onMount`);
- the contrast checker's scores, which need colors only the browser can read.

Both appeared **above** other content, so they pushed it down.

The fix is to **reserve the space from the first paint**. For the filters, they're now in the prerendered HTML, but invisible until JavaScript is ready:

```svelte
<search class:ready>…</search>

<style>
	search:not(.ready) {
		visibility: hidden;
	}

	@media (scripting: none) {
		search {
			display: none;
		}
	}
</style>
```

`visibility: hidden` and `display: none` both hide an element, but differently. `visibility: hidden` keeps its space and only hides it, from the eye, the keyboard and screen readers. `display: none` removes it from the layout. So: hidden-but-there while JavaScript loads, then visible, with nothing moving. And when JavaScript is off (`scripting: none`), the filters would never work, so they're removed completely and the full list sits at the top.

For the contrast checker it was even simpler: the score line is always there, with a non-breaking space until the score is known:

```svelte
<p class="score">
	{#if colors}
		<strong>{format(pair)}:1</strong> {level(pair)}
	{:else}
		&nbsp;
	{/if}
</p>
```

## The result

| Page                 | CLS before | CLS after | Performance |
| -------------------- | ---------: | --------: | ----------: |
| A Bitácora entry     |      0.143 |         0 |     89 → 96 |
| The Modern CSS list  |      0.162 |         0 |     91 → 97 |
| The contrast checker |      0.237 |     0.003 |     86 → 96 |

There was a cost. On Lighthouse's throttled mobile network, LCP (when the main content appears) went from about 2.0 to 2.5 seconds: the 115 KB of fonts now download early and compete with everything else. The score still went up, because CLS weighs more. A page that shows up a moment later is better than one that moves under your finger.

## Links

- [web.dev: Cumulative Layout Shift](https://web.dev/articles/cls)
- [web.dev: Optimize CLS](https://web.dev/articles/optimize-cls)
- [MDN: rel=preload](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel/preload)
- [SvelteKit: the handle hook and preload](https://svelte.dev/docs/kit/hooks#Server-hooks-handle)
- [MDN: @media scripting](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/scripting)
- [Filters in a Svelte class](./2026-11-02-filters-in-a-svelte-class)
