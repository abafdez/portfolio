---
title: An mdsvex layout for markdown links
date: 2026-11-02
phase: 7
tags: [mdsvex, sveltekit, links]
---

## What we did

- Added `MarkdownLayout.svelte`, passed to mdsvex's `compile` as `layout`. It wraps every .md file (posts and Bitácora entries) and only renders `children`.
- The layout's module script exports `a` = `MarkdownLink.svelte`, so every markdown link is rendered by that component instead of a plain `<a>`:
  - `/cv` gets the base path through `resolve()`, and renders as `href="../cv"` in the build.
  - `https://…` gets `rel="external"`.
  - mdsvex's `rel="nofollow"` is dropped: these are links I recommend.
- The `markdown()` plugin also removes mdsvex's `{...$$props}` from the layout call, which runes mode doesn't allow.

## What I learned

- Without the layout, `[CV](/cv)` points at the domain root. On GitHub Pages the site lives under `/portfolio`, so that link would 404.
- mdsvex replaces an element when the layout exports a component with that element's name. It imports the layout as `* as Components`, so any other export (like `CodeBlock`) can be used by name, as `Components.CodeBlock`.
- `layout` has to be a file path, not a URL: mdsvex reads the file to see which elements it replaces.
- `resolve()`'s types only take routes it knows, and a markdown link is just a string, so TypeScript can't check it. The prerender crawler checks instead: a link to a page that doesn't exist fails the build.

## Problems & fixes

- `resolve('/cv')` with a `string` didn't type-check (`$app/types` has no `Pathname` type to cast to). For a path with no `[param]`, `resolve()` only adds the base, so its type is widened once in `MarkdownLink`.

## Links

- [mdsvex: layouts](https://mdsvex.pngwn.io/docs#layouts)
- [mdsvex: custom components](https://mdsvex.pngwn.io/docs#custom-components)
- [SvelteKit: `resolve`](https://svelte.dev/docs/kit/$app-paths#resolve)
- [SvelteKit: prerender options](https://svelte.dev/docs/kit/configuration#prerender)
- [Google: qualify outbound links (`nofollow`)](https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links)

## Next

- Tag pages, `/blog/tags/[tag]`.
