---
title: A CMS preview that compiles Svelte
date: 2026-11-26
phase: 12
tags: [cms, svelte, mdsvex, security]
---

## What we did

- **The CMS preview compiles each post in the browser** the way the build does: `mdsvex/compile` with the build's options (`src/lib/markdown/options.ts`), then Svelte's compiler, then `mount()` (`src/lib/cms/mdsvex.svelte.ts`).
- The compiled module imports Svelte's runtime and our components by name; each name becomes a `blob:` module that hands out the CMS's own copy, and only the import statements at the top are rewritten.
- Images and block files come from Sveltia's `getAsset()`, links get the file's language, both through the same contexts the site's pages set.
- Checked with Sveltia's test backend: all 72 published posts preview identical to the built pages, code colours included. A warm compile takes about 6 ms.
- **Braces in posts now fail the build and the preview**, like HTML: the preview runs what it compiles, in the page that holds the GitHub token.

## What I learned

- Svelte forbids importing `svelte/internal/*` from `.svelte.ts` files (it's private); a plain `.ts` file can, and the compiler and runtime from one package always match.
- One of Svelte's runtime exports is called `await`, so `export const { await }` is a syntax error: the blob modules export through local variables.
- A post with plugin data imports `setContext` from `'svelte'`, so that name needs a module too.

## Problems & fixes

- Playwright can't drive Sveltia's folder picker, so the tests used Sveltia's in-browser test backend, switched on in `config.yml` only during the test.

## Links

- [mdsvex's compile](https://mdsvex.pngwn.at/docs/reference/compile)

## Next

- Try the built CMS at `/admin` once the branch is pushed.
