---
title: Open Props with postcss-jit-props in Vite
date: 2026-10-22
phase: 3
tags: [css, open-props, postcss, vite]
---

## What we did

- Installed `open-props` and `postcss-jit-props` as dev dependencies.
- Configured PostCSS inline in `vite.config.ts` (`css.postcss.plugins`), not in a `postcss.config.*` file or `package.json`.
- Added the CSS Variable Autocomplete extension, pointed at `node_modules/open-props/open-props.min.css`, so the editor suggests Open Props variables.

## What I learned

- A static site ships only `build/`. Nothing from `node_modules` runs in the browser, so for adapter-static everything is a dev dependency. `dependencies` only matters for libraries or server apps that run `pnpm install --prod`.
- CSS has no tree-shaking. `@import "open-props/colors"` copies every color into the bundle, and the minifier can't drop unused custom properties. JIT does that job: it reads my CSS and injects only the `var(--x)` I use.
- JIT only sees CSS. Variables used only in inline `style` attributes or in JS won't be injected.
- I pass the whole `OpenProps` object once. The plugin uses it as a lookup table, so I don't list variables by hand.
- Svelte `<style>` blocks go through Vite's CSS pipeline too, so one PostCSS config covers global CSS and components.
- `css.postcss` (PostCSS plugins) and `plugins` (Vite plugins) are different lists for different tools.
- With an inline `css.postcss`, Vite stops looking for `postcss.config.*` files.

## Problems & fixes

- No autocomplete for Open Props variables: with JIT they aren't defined in any CSS file in the project, so the editor had nothing to read. Fixed with the extension's `lookupFiles` setting.

## Links

- [Open Props](https://open-props.style/)
- [postcss-jit-props](https://github.com/GoogleChromeLabs/postcss-jit-props)
- [Vite: css.postcss](https://vite.dev/config/shared-options#css-postcss)

## Next

- Semantic tokens in `tokens.css`.
