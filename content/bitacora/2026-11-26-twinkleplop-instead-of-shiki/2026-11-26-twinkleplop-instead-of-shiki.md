---
title: twinkleplop instead of Shiki
date: 2026-11-26
phase: 12
tags: [css, markdown, design-tokens]
---

## What we did

- Code blocks are highlighted by **twinkleplop** (MIT, by pngwn) instead of Shiki. Each token gets a class (`tok keyword`) instead of an inline `style`; `global.css` maps about thirty classes onto our eight `--code-*` tokens, so every colour theme still works. `code-theme.ts`, Shiki's TextMate theme, is gone.
- twinkleplop is synchronous, so the step that collected each post's languages and awaited them before rendering went away, in the build and in the CMS preview.
- Some classes mean different things per language, so the code block says its language (`data-lang`) and a few rules depend on it: in TypeScript `property` and `constant` stay plain, in CSS a value word is a constant, in YAML a value is a string.
- Compared every code block of the old and new builds character by character: no text changed, 86.9 % of 48,912 characters keep their colour (80.1 % before the per-language rules).

## What I learned

- Colours are taste and text isn't: checking that no code changed is what let me accept the colour differences.
- Where twinkleplop is weaker: bash has no command tokens, Svelte's grammar reads `<script lang="ts">` as JavaScript, and in a CSS fragment, functions inside custom properties get the selector colour (a bug to report).
- My call: twinkleplop stays only if mdsvex does. It did, and mdsvex highlights with it, so my own highlighting code went too.

## Links

- [twinkleplop](https://twinkleplop.pngwn.at/docs)

## Next

- Report the CSS grammar bug; move to a newer twinkleplop when mdsvex does.
