---
title: Projects from data and a contrast checker
date: 2026-11-02
phase: 8
tags: [sveltekit, accessibility, design-tokens, canvas]
---

## What we did

- Added `src/lib/projects/`: a typed list of projects (`projects.ts`) and one folder per tool. Each project's `tool` is a dynamic `import()`, so its code is its own chunk and only loads on its page.
- `/projects` is a card grid from that list, and the landing's "Featured projects" use it too. `/projects/[tool]` gets its pages from `entries()` and its component from a universal `+page.ts` load (a component can't come from a server load).
- The first tool: a contrast checker. It scores every text token on every surface, in both themes, against WCAG. The pair you pick goes in the URL (`?text=brand&surface=surface-2`), so a pair can be shared.
- `tokens.css` declares the tokens again on any `[data-theme]` element, not only on `:root`.
- The layout's `onNavigate` skips the view transition for shallow navigations.

## What I learned

- The tool reads the colors in the browser instead of parsing `tokens.css` at build time. A hidden probe gets `color: var(--token)`, `getComputedStyle()` returns `oklch(…)`, and a 1×1 canvas turns that into sRGB: paint the pixel, read it back with `getImageData()`. The browser does all the resolving, and the tool will check future themes that only exist in the browser. The cost: no ratios without JS.
- A custom property is computed where it's declared. On `:root`, `--text-1: light-dark(…)` is already one color, and children inherit that color, not the formula. `color-scheme` on a child can't change it. Declaring the tokens again on the child makes it compute them with its own scheme. (Measured in Chrome.)
- `url.searchParams` can't be read while prerendering: there's no visitor yet. `onMount` only runs in the browser, so the tool reads them there.
- SvelteKit 3 deprecates `replaceState`. `goto(url, { shallow: true, replace: true })` changes the address bar without a navigation, and `replace` keeps it to one history entry.
- Shallow navigations still run `onNavigate`. Without a guard, every pick in a select would have faded the page out and in.
- The URL updates in the selects' `onchange`, not in an `$effect`: it reacts to what I did, not to every state change.
- `page.url` is typed read-only, so I copy it with `new URL(page.url.href)` before setting params.
- WCAG ratios are cut, not rounded: 4.497 fails AA and mustn't show as 4.50.

## Problems & fixes

- First version: both themes showed the same ratios. The probe had `color-scheme: dark`, but `getPropertyValue('--text-1')` on `:root` was already `oklch(21% .02 250)`. Fixed with `[data-theme]` in `tokens.css`.
- At 320px the tables were 11px too wide (`<body>` is a grid and grew to fit). Tighter cell padding fixed it.
- Lighthouse gave `/projects` 98 for `heading-order` (an `h1` straight to the cards' `h3`s). A "Tools" `h2` brought it to 100.
- The tool found something: in the light theme, `--code-constant` and `--code-type` are only "large" (4.34, 4.39) on `--surface-3`. Code sits on `--surface-2`, where they pass.

## Links

- [MDN: `light-dark()`](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark)
- [MDN: `getImageData()`](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/getImageData)
- [WCAG: Contrast (minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum)
- [SvelteKit: shallow routing](https://svelte.dev/docs/kit/shallow-routing)
- [SvelteKit: prerender and `url.searchParams`](https://svelte.dev/docs/kit/page-options#prerender)
- [Svelte: when not to use `$effect`](https://svelte.dev/docs/svelte/$effect#When-not-to-use-$effect)

## Next

- The first Awesome list, with search and tag filters saved in the URL.
