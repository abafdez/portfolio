---
title: Entrance animations the page controls
date: 2026-10-29
phase: 4
tags: [css, animation, svelte, accessibility]
---

## What we did

- The home page fades and slides in the hero photo, then the hero text, then the posts section, then the projects section, each 150ms apart.
- The page owns the animation: it defines the keyframes and passes each part's animation to Hero as CSS props (`<Hero --photo-animation={enter(0)} --text-animation={enter(150)} />`). Hero only reads them, with `none` as the default.
- A reduced-motion safety net in `global.css` (`reset` layer): every animation and transition ends almost instantly, with no delay.

## What I learned

- Svelte transitions (`transition:`, `in:`) don't run during hydration, so they wouldn't play on the first page load. CSS animations run as soon as the HTML is painted. `transition:` and `animate:` fit Phase 5, where list items appear and disappear because of state.
- Entrance order is a page decision. A reusable component shouldn't always animate itself.
- Svelte lets you pass CSS custom properties to a component (`--name={value}`). It puts them on a `display: contents` wrapper, and the component reads them with `var()`.
- Svelte renames keyframes defined in a component (`svelte-abc-name`). `@keyframes -global-home-enter` keeps the name, so Hero, a different component, can use it.
- `!important` reverses layer order: the earliest layer wins, and even beats unlayered `!important`. So a reset-layer `!important` is the right place for a rule that enforces the user's preference. That's the one legitimate use; I shouldn't scatter it around.
- `animation: var(--x, none)`: with nothing passed, there's no animation. `none` is a safe default because a component shouldn't move unless asked.

## Problems & fixes

- The fade didn't fade. Open Props' `fade-in` keyframes are only `to { opacity: 1 }`, so an element that is already visible doesn't change. I wrote my own keyframes with a `from` step.
- The photo popped into place. Open Props' `slide-in-up` starts at `translateY(100%)` of the element's own height, about 300px for the hero. Mine moves 1rem.
- With reduced motion, delayed sections stayed invisible (opacity 0 from `both`) for up to 450ms. The safety net only shortened durations. It now zeroes `animation-delay` and `transition-delay` too.
- To test animations, `document.getAnimations()` can pause each one at a given time so you can read its opacity.

## Links

- [Svelte: --style-props](https://svelte.dev/docs/svelte/basic-markup#Component-props)
- [MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
- [MDN: Cascade layers and !important](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer#description)

## Next

- Polish the animations later (timing, easing).
