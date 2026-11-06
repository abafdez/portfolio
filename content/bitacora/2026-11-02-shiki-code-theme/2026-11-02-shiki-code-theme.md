---
title: Code blocks with Shiki and my own tokens
date: 2026-11-02
phase: 7
tags: [shiki, mdsvex, css, design-tokens]
---

## What we did

- Replaced mdsvex's Prism with Shiki, passed as `highlight.highlighter` in the `markdown()` plugin. One highlighter is shared by every file, and each language loads the first time a block uses it.
- Tried Shiki's `createCssVariablesTheme` first, then wrote my own TextMate theme (`src/lib/code-theme.ts`). Its colors are `var(--code-…)` tokens from `tokens.css`.
- Added a teal primitive and gave the light palette more chroma. Every code color is at least 5.3:1 on `--surface-2`, in sRGB, in both themes.
- Set `tab-size: 2` on code blocks: 8-column tabs are too wide on a phone.

## What I learned

- Shiki runs while the site builds. The visitor gets a `<pre>` full of colored `<span>`s, with no highlighting JS, and it works without JavaScript.
- Shiki does support theming (dual themes, `defaultColor: 'light-dark()'`), but the colors come from its themes. Users making their own themes need the colors to come from my tokens.
- The CSS-variables theme is "a lot less granular" (Shiki's docs say so). Only about ten kinds of token got a color, which is why my light theme looked dull. The docs recommend a theme with CSS variables as its colors instead.
- A grammar gives each token a stack of scopes, from general to specific (`entity.name.tag.yaml`). A theme selector matches whole segments from the start, and the longest match wins, like specificity in CSS. How many selectors a rule lists doesn't matter: the list means "any of these".
- `entity.name.tag` covers HTML and Svelte tags, CSS element selectors and YAML keys. A longer selector (`entity.name.tag.yaml`) in its own rule gives YAML keys their own color.
- Escaping isn't sanitizing. Shiki escapes `<` and `&` for HTML. I escape `{ }`, backticks and `\` for the Svelte template string. Svelte's `{@html}` never sanitizes, which is fine for markdown I write, not for markdown from someone else.

## Problems & fixes

- mdsvex's usual pattern (Shiki's HTML in a template string inside `{@html}`, escaped with `escapeSvelte`) quietly drops backslashes: `\-\-` showed as `--`. Escaping every brace, backtick and backslash as an HTML entity fixed it.

## Links

- [Shiki: Light/dark dual themes](https://shiki.style/guide/dual-themes)
- [Shiki: Theme colors manipulation](https://shiki.style/guide/theme-colors)
- [mdsvex: highlight](https://mdsvex.pngwn.io/docs#highlight)
- [Svelte: `{@html}`](https://svelte.dev/docs/svelte/@html)

## Next

- A custom mdsvex layout for posts, reading time and tag pages.
