---
title: A sun/moon toggle with a circular reveal
date: 2026-10-30
phase: 4.5
tags: [view-transitions, svg, dark-mode, svelte]
---

## What we did

- Planned Phase 4.5 (Identity & motion): technical look (terminal, monospace, blueprints, code), dark first, a mascot, and each route with its own composition and trick. Theme and tokens stay shared.
- Turned the theme toggle into an icon: an SVG sun whose rays fade out while a masked circle bites out a crescent moon.
- The new theme now grows out of the button in a circle, using a view transition with the type `theme`.
- Added a `--dark` token (1 in dark, 0 in light) in `tokens.css`. The icon computes its transforms from it.
- Tested on the built site at 320px and desktop, in both themes, with reduced motion. Lighthouse a11y is still 100 in both themes.
- Rebuilt the toggle as a plain HTML/CSS/JS CodePen with a control panel (duration, easing, edge blur, blend mode) to play with the reveal.
- Brought the soft edge back to the project: `ThemeToggle` takes `duration` (ms) and `blur` (px) props. The defaults (600, 0) keep the old look.

## What I learned

- `light-dark()` only works for colors. For anything else that depends on the theme, a 0/1 number in a custom property works with `calc()`: `scale(calc(1 + 0.75 * var(--dark)))`.
- The icon reads `--dark`, not `aria-pressed`. The CSS applies before `onMount`, so the icon is right from the first paint, even with JS off. If it read `aria-pressed`, dark-OS visitors would see a sun that turns into a moon on every page load.
- `startViewTransition()`: the browser takes a picture of the old page, runs `update()`, takes a picture of the new state, then animates between them with `::view-transition-old(root)` and `::view-transition-new(root)`. The reveal keeps the old one still and clips the new one with a growing `circle()`.
- Transition types label a transition, and the CSS only matches its own with `:active-view-transition-type(theme)`. Without it, the circle would also play on route transitions later.
- `flushSync` is a Svelte function that applies pending DOM updates right away instead of in the next batch, so they land **before** the browser's "after" picture. Today it's insurance: the visible change comes from `data-theme`, which we set directly.
- The two pictures are blended for a cross-fade by default (`mix-blend-mode: plus-lighter`), so the reveal sets `mix-blend-mode: normal`.
- `clip-path: circle()` always has a hard edge. A `mask-image: radial-gradient(...)` can fade: solid up to `radius - blur`, transparent at `radius`.
- Custom properties are untyped text, so animating one just jumps from start to end. `@property` registers it as a `<length>`, and then keyframes can tween it.
- The transition's pseudo-elements hang off `:root`, not off the component. So the props can't be CSS props on the component (`<ThemeToggle --x="…" />`, like `Hero`): the click handler writes them on `:root`, next to `--reveal-x/y/r`.

## Problems & fixes

- The prerendered button had `aria-pressed="false"` for everyone, even though `theme` starts as `undefined`. Svelte renders `false` on an `aria-*` attribute as the string `"false"`; only `undefined` leaves it out. Fixed with `aria-pressed={theme ? theme === 'dark' : undefined}`.
- With the mask, the old theme flashed at the end. The transition stays up a frame or so after its animation ends, and in that gap `--reveal-radius` went back to `0px`, so the mask hid the new picture. Fixed with `animation: … forwards`. (`clip-path` never had this: without the animation it goes back to `none`, which shows everything.)
- In the CodePen, the SVG was 0×0 and nothing animated. The new CodePen editor works with files and didn't load the CSS and JS ones, so `index.html` has to link them.
- In the CodePen, blend modes other than `normal` flashed at the end: the last frame was old and new blended, then the page snapped to the plain new theme. Fixed there by fading the old picture out after the reveal. The project only uses `normal`, so it doesn't need that fix.

## Links

- [MDN: View Transition API](https://developer.mozilla.org/docs/Web/API/View_Transition_API)
- [MDN: :active-view-transition-type()](https://developer.mozilla.org/docs/Web/CSS/:active-view-transition-type)
- [MDN: SVG `<mask>`](https://developer.mozilla.org/docs/Web/SVG/Element/mask)
- [MDN: @property](https://developer.mozilla.org/docs/Web/CSS/@property)
- [MDN: mask-image](https://developer.mozilla.org/docs/Web/CSS/mask-image)
- [Svelte: flushSync](https://svelte.dev/docs/svelte/svelte#flushSync)
- [Adam Argyle: Building a theme switch component](https://web.dev/articles/building/a-theme-switch-component)
- [nerdy.dev](https://nerdy.dev), the inspiration for the reveal

## Next

- The dark-first technical palette and type.
