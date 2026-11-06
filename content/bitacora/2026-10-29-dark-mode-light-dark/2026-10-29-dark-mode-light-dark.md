---
title: Dark mode with light-dark()
date: 2026-10-29
phase: 3
tags: [css, dark-mode, color-scheme]
---

## What we did

- Rewrote each token in `tokens.css` as `light-dark(light value, dark value)`.
- Set `color-scheme: light dark` on `:root`, plus `[data-theme='light']` and `[data-theme='dark']` overrides for the coming toggle.
- Nothing outside `tokens.css` changed.

## What I learned

- `color-scheme` does two jobs. It drives `light-dark()`, and it makes the browser's own UI (scrollbars, form controls) follow the theme.
- `light-dark()` keeps both values on one line, instead of repeating every token inside `@media (prefers-color-scheme: dark)`.
- With no `data-theme` attribute the site follows the OS. Setting the attribute forces a theme.
- Lightning CSS (Vite's minifier) replaced `light-dark()` with a fallback for older browsers. The `[data-theme]` selectors are more specific than the generated media-query `:root`, so a forced theme still beats the OS.
- Test in DevTools with Ctrl+Shift+P → "Emulate CSS prefers-color-scheme: dark".

## Links

- [MDN: light-dark()](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark)
- [MDN: color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme)

## Next

- Theme toggle with `$state` and `localStorage`, and an inline script in `app.html` so the page doesn't flash the wrong theme.
