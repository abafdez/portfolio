---
title: Components in posts, as directives
date: 2026-11-27
phase: 12
tags: [markdown, mdsvex, components, cms]
---

## What we did

- **Our own directives** are an mdsvex plugin bundle (`src/lib/markdown/directives-plugin.ts`) with their components in `src/lib/markdown/directives/`: `:kbd[Ctrl+B]` (one keycap per key, nested `<kbd>`s), `:::details[Summary]` (a native `<details>`, `(open=true)` to start open) and `:::compare` (a side per heading inside, like steps).
- **mdsvex's own plugins**, pinned: `:::tabs`, `:::steps` and `::toc`, used unstyled (`css: false`) and drawn in `global.css` like a code block: a `--surface-3` frame, a bar on `--surface-1` in the label font, brand circles for the step numbers.
- Mistakes fail the build with the file and line: an unknown directive, a `:::details` without a summary, a `:::compare` that doesn't start with a heading or has only one side.
- The CMS preview maps the new modules, and draws all of them (checked with Sveltia's test backend, the config restored after).
- 16 new tests (`plugins.test.ts`, `render.test.ts`, `keys.test.ts`), the publishing guide has a "Components (directives)" section, and a draft post shows every directive.
- A production build with the draft briefly published: every directive in both languages, steps rendered to HTML at build time (its components are `.static.svelte`, no JavaScript).

## What I learned

- A directive's component gets the text in brackets as a snippet to render, not as a string. To split `Ctrl+Shift+P` into keys, the plugin reads `node.text_content` when the directive closes and passes it as an argument.
- The steps plugin's trick: on each heading inside the container, close the previous wrapper and open a new one from that heading (`wrap_from('directive_container', …)`), and wrap the heading as its label. `:::compare` does the same.
- A directive name that isn't a JavaScript identifier (`compare-side`) is exported under a string name: `export { default as 'compare-side' }`.

## Problems & fixes

- The preview said "can't import compare-side": it rewrote the first quoted string of each import, and with a string export name that's the name, not the module. It now rewrites the string after `from`.

## Links

- [mdsvex: directives](https://mdsvex.pngwn.at/docs/guides/directives)
- [mdsvex's plugins](https://mdsvex.pngwn.at/docs/plugins)
- [MDN: `<kbd>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/kbd)

## Next

- `::video` and `::yt` instead of the fenced blocks, then live demos (`:::demo` and ` ```svelte run `) with a sandboxed preview in the CMS.
