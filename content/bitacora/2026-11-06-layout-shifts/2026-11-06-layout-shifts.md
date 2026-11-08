---
title: Lighthouse over 90, and pages that stopped jumping
date: 2026-11-06
phase: 9
tags: [performance, lighthouse, fonts]
---

## What we did

- Ran Lighthouse (mobile, the default) on one page of each kind. Accessibility, best practices and SEO were 100 everywhere; performance was 95–98, except three pages: a Devlog entry (89), the Modern CSS list (91) and the contrast checker (86). All three lost points to **CLS**, content moving after it first appears.
- **Fonts:** `src/hooks.server.ts` asks SvelteKit to preload the Latin files of Fira Code and Shantell Sans (`resolve(event, { preload })`), so they download with the HTML instead of after the CSS.
- **Awesome list:** the filters are in the prerendered HTML now, `visibility: hidden` until `onMount` adds `.ready`, and `display: none` under `@media (scripting: none)`. Before, `{#if ready}` added them later and pushed the list down.
- **Contrast checker:** the score line is always rendered (a non-breaking space until the tokens are read), so it no longer appears and pushes the page down.
- After: CLS 0 on those pages, performance 95–97 on all seven audited pages, accessibility 100 in both themes.

## What I learned

- **CLS** (Cumulative Layout Shift) adds up how far visible content moves, and how much of it. Under 0.1 is good. It's what makes you tap the wrong link because the page jumped.
- Lighthouse's `layout-shifts` audit names each element that moved and the cause, like "Web font loaded".
- **Fonts shift the page** because text first shows in a fallback font with different widths, and re-wraps when the real one arrives. The browser only finds a font after reading the CSS, so a `<link rel="preload" as="font">` in the HTML starts it sooner.
- Fontsource splits each font into one file per alphabet (`unicode-range`), and the browser only downloads the ones a page uses. So preload only the Latin file, or every visitor gets Cyrillic and Greek too.
- **Content that appears after JS runs** shifts the page too. The fix is to reserve its space from the first paint: render it hidden (`visibility: hidden` keeps the space, `display: none` doesn't), or render an empty placeholder.
- `@media (scripting: none)` matches when JS is off, so the no-JS version can still drop what would never work.
- Preloading has a cost: on the throttled network, LCP went from about 2.0 s to 2.5 s, because the fonts now download before other things. The score still went up; CLS weighs more.
- In SvelteKit 3, `Handle` comes from `@sveltejs/kit/hooks`, not `@sveltejs/kit`.

## Problems & fixes

- `/about` still shifts a little (CLS 0.05, the skill windows collapsing after hydration). It's under 0.1, so I left it.

## Links

- [web.dev: Cumulative Layout Shift](https://web.dev/articles/cls)
- [web.dev: Optimize CLS](https://web.dev/articles/optimize-cls)
- [MDN: rel=preload](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel/preload)
- [SvelteKit: hooks, handle and preload](https://svelte.dev/docs/kit/hooks#Server-hooks-handle)
- [MDN: @media scripting](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/scripting)

## Next

- Phase 9's "done when" is met: CI runs check, lint, test and build on PRs, and Lighthouse is over 90. Optional: `BreadcrumbList` structured data.
