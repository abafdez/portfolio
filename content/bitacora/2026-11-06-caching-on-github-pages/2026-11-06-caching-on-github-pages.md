---
title: Does every deploy bust my visitors' cache?
date: 2026-11-06
tags: [caching, github-pages, performance, ci]
---

## What we did

- Built the site twice from the same code and compared all 257 files: every name was the same, and nothing in `_app/immutable/` changed. Only the HTML pages and `_app/version.json` differ, because SvelteKit stamps each build with a version (the build time by default).
- Read the live site's headers. GitHub Pages sends `cache-control: max-age=600` for every file, and an ETag like `"6aedbb5c-23e"`: the file's modification time in hex (`0x6aedbb5c` is the deploy time) and its size.
- Timed a build with one cover image: 6.5s with an empty image cache, 5.0s with a full one. One cover becomes 16 files, about 1s of work.

## What I learned

- Hashed file names (`start.YPx50nGZ.js`) come from the file's **content**, so a deploy doesn't rename files that didn't change. My guess (every deploy renames everything) was wrong.
- But GitHub Pages' ETag comes from the **deploy time**. After any deploy, a browser asking "has this changed?" gets the file again in full, even if it's identical. Between deploys it gets a `304 Not Modified`: a tiny answer, and the cached copy is used.
- `max-age=600`: a browser may reuse a file for 10 minutes without asking. Hashed files could be cached for a year (`Cache-Control: immutable`), but GitHub Pages doesn't let me set headers.
- CI starts on a fresh machine, and `cache: true` in the setup step only caches pnpm's packages, so every run processes every image again. The local cache is `node_modules/.cache/imagetools`.

## Next

- When the first posts with images are live: cache `node_modules/.cache/imagetools` in CI with `actions/cache`.
- Maybe later: a service worker that keeps `_app/immutable/*` in the browser.
