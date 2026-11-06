---
title: "Does every deploy bust my visitors' cache?"
date: 2026-11-06
tags: [caching, github-pages, performance]
description: 'I assumed every deploy renamed every file and made visitors download everything again. I built twice and read the headers: half right, for a different reason.'
---

My site's JavaScript and CSS have names like `start.YPx50nGZ.js`. I knew the random-looking part was a hash, and I assumed every deploy made new ones: deploy twice, even with no changes, and every visitor downloads everything again.

So I tested it.

## Two builds of the same code

I built the site twice without changing anything, and compared every file in the output, names and contents:

```sh
(cd build && find . -type f -exec md5sum {} + | sort -k2) > sums1.txt
# build again, then the same into sums2.txt
diff sums1.txt sums2.txt
```

All 257 names were the same. Nothing in `_app/immutable/`, where the scripts, styles, fonts and images live, changed at all. What did change: the HTML pages and `_app/version.json`.

The hash in a file name is made from the file's **content**. Same content, same hash, same name. A deploy only renames the files that really changed (and the ones that import them, since their content includes the new name).

The pages change because SvelteKit stamps each build with a version, the build time by default, and writes it into every page. It uses it to notice when a new version is deployed while someone has the site open.

<!-- TODO: what I expected before running the diff -->

## What GitHub Pages sends

Then I looked at the headers the live site sends for one of those files:

```sh
curl -sI https://abafdez.github.io/portfolio/_app/immutable/entry/start.YPx50nGZ.js
```

```http
cache-control: max-age=600
etag: "6aedbb5c-23e"
last-modified: Fri, 06 Nov 2026 11:34:52 GMT
```

Two things:

- **`max-age=600`**: the browser may reuse the file for 10 minutes without asking. After that it asks the server whether it changed. For a file whose name changes whenever its content does, that's very cautious: it could be cached for a year with `Cache-Control: immutable`. But GitHub Pages sends the same headers for everything, and doesn't let me change them.
- **The ETag.** When the browser asks "has it changed?", it sends the ETag it has, and if it still matches, the server answers `304 Not Modified`, with no body. I tried it, and got a 304. But look at the ETag: `6aedbb5c` is a number in hexadecimal, `1793964892`, which is exactly the `last-modified` time. The second part, `23e`, is the size. The ETag is made from **when the file was written**, not from what's in it.

And every deploy writes every file again.

## So, half right

Not every deploy renames everything: identical files keep their names. But after any deploy, every ETag changes, so a returning visitor's browser gets each file it asks for in full, once, even if it's identical to the one it has.

For a small site that's a few hundred kilobytes per visitor per deploy. I'm keeping it for now. If it ever matters, the options are:

- **A service worker** that keeps the `_app/immutable/` files in the browser and serves them from there. Those names change whenever the content does, so serving them from a cache is safe. Pages should still come from the network, or visitors would get old ones.
- **A host that lets me set headers**, like Cloudflare Pages or Netlify, with `Cache-Control: public, max-age=31536000, immutable` for `/_app/immutable/*`.

## The same question for my images

My images are processed at build time, and GitHub Actions starts every run on a fresh machine, so it processes every image again, every run. That one has a fix that works on GitHub Pages too: [caching between GitHub Actions runs](./2026-11-06-caching-between-github-actions-runs).

## Links

- [MDN: HTTP caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching)
- [MDN: ETag](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/ETag)
- [SvelteKit: service workers](https://svelte.dev/docs/kit/service-workers)
