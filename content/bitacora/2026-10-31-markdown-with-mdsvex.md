---
title: Bitácora entries rendered with mdsvex
date: 2026-10-31
phase: 6
tags: [mdsvex, markdown, vite, sveltekit]
---

## What we did

- Picked mdsvex 0.12.8 (stable) to render the markdown bodies. The `1.0.0-next` rewrite is still a prerelease.
- Called mdsvex from a small `markdown()` Vite plugin in `vite.config.ts`, not from `preprocess`. `extensions: ['.svelte', '.md']` stays so Svelte compiles the result.
- Added `/bitacora/[slug]`: `entries()` and the frontmatter in `+page.server.ts`, the body component in `+page.ts`. All 23 entries prerender.
- Added `RouteWithoutParams` in `src/lib/links.ts` for links that go through `resolve()` alone.

## What I learned

- Vite runs every `order: 'pre'` transform hook first, then the normal ones, then `'post'`. The order of the `plugins` array only matters inside each group.
- A filter like `{ id: /\.md$/ }` keeps a plugin off `file.md?raw`. That import is already a JS module (`export default "…"`) and every transform hook runs on it.
- Server load data is saved as JSON, and a component can't be. So the component comes from a universal `+page.ts`, which receives the server's `data`.
- A lazy `import.meta.glob` gives one chunk per entry, so the browser only downloads the entry it shows.
- The prerenderer only finds linked pages. Nothing links to an entry yet, so `entries()` is what builds them.
- ``Exclude<RouteId, `${string}[${string}`>`` drops every route with a parameter.

## Problems & fixes

- ``CompileError: `<enhanced:img>` was left open`` on a Bitácora entry that mentions the tag in prose. enhanced-img parses every Svelte file in a `'pre'` hook, before the preprocessors, so it read the raw markdown. My `'pre'` plugin runs mdsvex before it, and the tag arrives escaped.
- One `context="module"` deprecation warning per file: mdsvex 0.12 writes Svelte 4 syntax. The plugin rewrites it to `<script module>`.
- One sourcemap warning per file. Returning `map: { mappings: '' }` says "no map on purpose".
- `pnpm check` failed in Nav, Hero and TeaserCard: `RouteId` now includes `/bitacora/[slug]`, which `resolve()` can't build without a slug. Fixed with `RouteWithoutParams`.
- The page's CSS seemed missing in the preview. An old preview was still on port 4173 serving stale assets; the new one had moved to 4174.

## Links

- [mdsvex docs](https://mdsvex.com/docs)
- [Vite: plugin ordering](https://vite.dev/guide/api-plugin#plugin-ordering)
- [Vite: glob import](https://vite.dev/guide/features#glob-import)
- [SvelteKit: universal vs server load](https://svelte.dev/docs/kit/load#Universal-vs-server)
- [SvelteKit: entries](https://svelte.dev/docs/kit/page-options#entries)

## Next

- Prose styles for the rendered markdown, then the `/bitacora` timeline with linked cards.
