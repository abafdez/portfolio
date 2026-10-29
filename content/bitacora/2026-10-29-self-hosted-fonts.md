---
title: Self-hosted fonts, one per section
date: 2026-10-29
phase: 3
tags: [css, fonts, fontsource, design-tokens]
---

## What we did

- Picked fonts: Fira Code for code, Shantell Sans for the Bitácora, and the system font stack (Open Props `--font-sans`) for everything else.
- Installed `@fontsource-variable/fira-code` and `@fontsource-variable/shantell-sans` as dev dependencies and imported them in the root layout.
- Added font tokens to `tokens.css` (`--font-body`, `--font-code`, `--font-hand`) and used them in `global.css`.
- Added `src/routes/bitacora/+layout.svelte`, which wraps the section and sets `--font-body: var(--font-hand)`.
- Tested on the built site with `BASE_PATH=/portfolio`.

## What I learned

- Fonts work like colors: primitives, then semantic tokens, then overrides per section. Future themes and user styles will be more token overrides.
- Browsers only download a font when text on the page uses it. The home page downloads 0 font files. The Bitácora downloads only Shantell Sans, and Fira Code only arrives when there's a `<code>` element.
- Fontsource ships `unicode-range` subsets, so a Latin-only page only downloads the Latin file.
- Self-hosting means no third-party request at runtime. The CDN cache argument is gone too: browsers now keep a separate cache per site.
- Fonts imported through Vite get hashed, relative URLs in `build/`, so they work under the GitHub Pages base path. `url('/fonts/x.woff2')` in `static/` would break under `/portfolio`.
- A `var()` inside a custom property is resolved where the property is defined. `--font-heading: var(--font-body)` on `:root` gets resolved on `:root`, so a section's `--font-body` override never reaches it. Use a fallback where the value is used instead: `font-family: var(--font-heading, var(--font-body))`.
- The same rule explains why the Bitácora wrapper sets `font-family` again. `body` already computed its font, and children inherit that computed value, not the token.
- JIT also injects nested Open Props variables: `--font-sans` points at `--font-system-ui`, and both ended up in the build.

## Decisions

- Shantell Sans weight-only build: 79 KB for Latin. The build with the Informal axis is 146 KB. I can switch to it later.
- System font for the default: zero download, at the cost of looking different on each OS.

## Problems & fixes

- My first version chained `--font-heading: var(--font-body)` on `:root`. Bitácora headings would have stayed in the system font. Fixed with the fallback pattern above.

## Links

- [Fontsource](https://fontsource.org/)
- [Shantell Sans](https://shantellsans.com/)
- [Fira Code](https://github.com/tonsky/FiraCode)
- [MDN: unicode-range](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/unicode-range)

## Next

- Lighthouse accessibility check and contrast in both themes, then the Phase 3 PR.
