---
title: Terminal windows, htop bars and a border spotlight
date: 2026-11-03
phase: 5
tags: [css, animation, svelte, svg]
---

## What we did

- Tried three looks for `/about` on three branches (terminal, spotlight, orbit), then merged the parts I liked from the first two and deleted the branches.
- Each skill group is a terminal window: a title bar with three lights and `alfonso@portfolio: ~/skills/web`, then the skills as rows.
- The level is an htop-style bar, `[||||||......]`, 3 ticks per level. The ticks are text in the code font, so `1ch` is one tick.
- The bars fill from empty to their level, left to right, when they come into view. The ones that come into view together cascade down the list.
- Pointing at a row: its border lights up in the skill's brand color (and its neighbors' too), its bar grows a little with a spring, and a block cursor blinks on the bar's last tick.
- A strip of every brand logo slides by above the skills, forever.

## What I learned

- `count-up` went from `inset(0 100% 0 0)` to the fill's own `clip-path: none`. `inset()` and `none` can't be blended, so the browser flipped from empty to full halfway through instead of animating. Every version I tried "just appeared" because of that. Both keyframes are `inset()` now.
- CSS alone can't start a timed animation when something enters the screen (`animation-trigger` isn't widely supported yet). A Svelte attachment (`fill.ts`) and one shared IntersectionObserver set `data-filling`, and the CSS animates.
- An IntersectionObserver measures the visible part of what it watches, `clip-path` included. An empty fill is clipped to nothing, so it never counted as visible. It watches the bar instead.
- `@media (scripting: enabled)` lets the CSS start the fills empty, so the prerendered page doesn't show full bars that empty and refill when the JS starts. Without JS they stay full.
- Svelte drops CSS it can't match in the template. `data-filling` is set by JS, so its rule needs `:global()`.
- The border glow is a radial gradient cut down to a 1px ring with `mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)`. A second, inner light washed out the light theme, so it's gone.
- An inline `<span>` can't be scaled; the bar is `inline-block`. Its `transform-origin` sits on the bar itself, not in the hover rule, or it jumps back to the center while shrinking.
- The marquee is the list twice, sliding by half its width. The second copy draws its logos with `<use href="#logo-…">`, pointing at the first copy's paths: written out twice they were 168 KB of HTML.
- `contain: inline-size` keeps wide content (the marquee, a long path in a title bar) from widening the page. `overflow: hidden` alone doesn't.
- `@container` adds no specificity, so a container query must come after the rule it overrides.

## Problems & fixes

- At 320px names were one letter wide: as plain `auto`, the level column took all the spare room. `fit-content(50%)` caps it.
- Performance went from 99 to 93: the HTML still has every logo path twice (rows and marquee). An SVG sprite would fix it.

## Links

- [MDN: clip-path](https://developer.mozilla.org/en-US/docs/Web/CSS/clip-path)
- [MDN: Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [MDN: `scripting` media feature](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/scripting)
- [MDN: mask-composite](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-composite)
- [MDN: `<use>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/use)
- [Svelte: attachments](https://svelte.dev/docs/svelte/@attach)
- [Svelte: `:global`](https://svelte.dev/docs/svelte/global-styles)

## Next

- An SVG sprite for the logos, to get performance back near 100.
