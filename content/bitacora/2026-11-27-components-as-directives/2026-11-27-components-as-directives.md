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
- **`::video` and `::yt` replace the YAML fences.** The caption (video) or title (YouTube) goes in the brackets, the rest are arguments: `::yt[Plain Text](src=https://youtu.be/…, thumbnail=./talk.jpg)`. `blocks.ts` checks the arguments (no YAML parser any more), a leftover ` ```video ` fence fails the build with the new syntax, the CMS widgets read and write the line, and the two posts that used blocks were migrated, with an update note on the post about code-block components. Every page matches the build from before, apart from the text I changed.
- **A compact YouTube card**: the picture on the left (on top on a phone), then the play sign beside the title and tip; without a picture, the row alone. **A `::yt` without `thumbnail=` gets the video's picture at build time**: a small Vite plugin downloads it from YouTube before anything compiles and saves it next to the post as `yt-<id>.jpg`. The file is optional, so a failed download leaves the card without a picture instead of failing the build. Fetching it live in dev and the CMS, with an offer to add it, is a card on the board.

## What I learned

- A directive's component gets the text in brackets as a snippet to render, not as a string. To split `Ctrl+Shift+P` into keys, the plugin reads `node.text_content` when the directive closes and passes it as an argument.
- The steps plugin's trick: on each heading inside the container, close the previous wrapper and open a new one from that heading (`wrap_from('directive_container', …)`), and wrap the heading as its label. `:::compare` does the same.
- A directive name that isn't a JavaScript identifier (`compare-side`) is exported under a string name: `export { default as 'compare-side' }`.
- A directive's arguments are strings, written `name=value` or `name="a, b"` when a value has a space or a comma; an escaped `\"` inside keeps its backslash, so the check unescapes it.

## Problems & fixes

- The preview said "can't import compare-side": it rewrote the first quoted string of each import, and with a string export name that's the name, not the module. It now rewrites the string after `from`.
- The CMS wrote a title like `Plain Text [NDC]` with only the `]` escaped, and the lone `[` made mdsvex read the line as text. Both brackets are escaped now; a test round-trips each widget through the real build.

## Links

- [mdsvex: directives](https://mdsvex.pngwn.at/docs/guides/directives)
- [mdsvex's plugins](https://mdsvex.pngwn.at/docs/plugins)
- [MDN: `<kbd>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/kbd)

## Next

- Live demos (`:::demo` and ` ```svelte run `) with a sandboxed preview in the CMS.
