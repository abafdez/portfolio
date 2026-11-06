---
title: 'A contrast checker that reads its own design tokens'
date: 2026-11-02
tags: [accessibility, design-tokens, css, sveltekit]
description: Reading CSS custom properties in the browser, turning any CSS color into sRGB with a canvas, and the light-dark() surprise along the way.
---

My site's colors are design tokens: `--text-1`, `--surface-2`, `--brand` and a few more, each one a `light-dark()` pair. Every time I add a pair, I check its contrast. I wanted a tool that checks all of them at once, in both themes, and that will keep working when I add named themes later.

## Read the colors, don't parse them

The obvious way is to read `tokens.css` at build time. But then I'd have to do the browser's job: follow `var()` chains, pick a side of each `light-dark()`, and convert `oklch` to sRGB by hand. And a theme a visitor makes in the browser would never be checked.

So the tool asks the browser. Two Web APIs do the work:

```ts
const probe = document.createElement('div');
probe.hidden = true;
document.body.append(probe);
const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!;

function read(token: string, scheme: 'dark' | 'light') {
	probe.dataset.theme = scheme;
	probe.style.color = `var(--${token})`;
	// 1. CSS resolves the token: this gives back something like oklch(0.92 0.012 250).
	ctx.fillStyle = getComputedStyle(probe).color;
	// 2. The canvas turns any CSS color into pixels: paint one, read it back.
	ctx.fillRect(0, 0, 1, 1);
	const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
	return [r, g, b];
}
```

The rest is the [WCAG formula](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum): turn each channel back into linear light, weigh them into a luminance, and compare the lighter one with the darker one. One detail: the ratio is cut to two decimals, not rounded. 4.497 fails AA, so it mustn't show as 4.50.

## The surprise: light-dark() was already decided

My first version set `color-scheme: dark` on the probe, and both themes came back identical. In DevTools:

```js
getComputedStyle(document.documentElement).getPropertyValue('--text-1');
// "oklch(21% .02 250)"
```

No `light-dark()` left. The token is declared on `:root`, and that's where it's computed, with `:root`'s color scheme. Children inherit the finished color, not the formula, so a child's `color-scheme` has nothing left to decide. (That's what Chrome does; I measured it there.)

The fix was one selector in `tokens.css`. The tokens are declared again on any element with `data-theme`, so they're computed again there:

```css
:root,
[data-theme] {
	color-scheme: light dark;
	--text-1: light-dark(var(--ink-7), var(--ink-2));
	/* … */
}

[data-theme='light'] {
	color-scheme: light;
}
```

Now any part of a page can be in the other theme. The checker's samples use it to draw each pair in both themes with CSS only, and named themes will be able to use it too.

<!-- TODO: try it in DevTools: add data-theme="light" to an element on the dark page and describe what happened -->

## A shareable pair, on a prerendered page

The pair you pick goes in the URL, so it can be shared. Two SvelteKit details:

- The page is prerendered, and there's no visitor URL at build time. SvelteKit throws if you read `url.searchParams` while prerendering, so the tool reads them in `onMount`, which only runs in the browser.
- Writing the URL back uses shallow routing: `goto(url, { shallow: true, replace: true })`. The address bar changes, but nothing navigates, and `replace` keeps it to one history entry, so Back still leaves the page.

Shallow navigations still run `onNavigate`, though. My layout starts a view transition there, so every pick faded the page out and in. One guard fixed it:

```ts
onNavigate((navigation) => {
	if (navigation.shallow || !canTransition()) return;
	// …
});
```

## What it found

All the pairs I use pass AA in both themes. Two I don't use don't: in the light theme, `--code-constant` and `--code-type` on `--surface-3` reach only 4.34 and 4.39, enough for large text only. Code sits on `--surface-2`, so for now that's a note, not a bug.

<!-- TODO: link to the tool once it's live, and a screenshot of the tables -->
