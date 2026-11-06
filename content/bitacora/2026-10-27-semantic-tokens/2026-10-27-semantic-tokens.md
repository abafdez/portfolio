---
title: Semantic design tokens
date: 2026-10-27
phase: 3
tags: [css, design-tokens, open-props]
---

## What we did

- Created `src/lib/styles/tokens.css` with semantic color tokens (`--brand`, `--text-1/2`, `--surface-1/2/3`) mapped onto Open Props primitives.
- Imported it once in `+layout.svelte` and used the tokens on `body` and `h1`.

## What I learned

- A token is a named design decision. `--gray-8` is a value (primitive); `--text-1` says what it's for (semantic).
- Components use semantic tokens and only `tokens.css` uses primitives. Then dark mode or a rebrand means editing one file.
- Name tokens by role, not by appearance. `--light-gray` lies in dark mode; `--surface-2` doesn't.
- Don't wrap every Open Props size in a token. Only real decisions that might change need a semantic name.
- Open Props color scales go from 0 (lightest) to 12 (darkest). Text and links on a light background usually need 7–9.
- WCAG AA contrast: 4.5:1 for normal text, 3:1 for large text and UI parts. DevTools shows the ratio in the color picker.
- `import 'file.css'` is a side-effect import. CSS has no exports, so `import x from 'file.css'` fails.
- CSS has no `export`. A custom property on `:root` is available everywhere through inheritance.

## Problems & fixes

- `[MISSING_EXPORT] "default" is not exported by tokens.css`: I wrote `import tokens from …` and wrapped the CSS in `export tokens { }`. Fixed with a plain `import '…'` and a bare `:root { }` block.
- My first brand color, `--brown-0`, was almost white and would have failed contrast. I changed it to `--blue-9`.

## Links

- [Open Props colors](https://open-props.style/#colors)
- [MDN: Using CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)

## Next

- `global.css` with cascade layers.
