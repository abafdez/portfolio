---
title: A robots.txt that never worked, and SEO on purpose
date: 2026-11-04
phase: 9
tags: [sveltekit, seo, github-pages]
---

## What we did

- Decided issue 3 from the start of the learning path: the site is **findable**. Only `/mascot` (a review sheet, not a page yet) says `noindex`.
- Removed `static/robots.txt`: it had never done anything (see below).
- `Seo.svelte`, one component every page uses instead of its own `<svelte:head>`: `<title>`, description, canonical URL, Open Graph tags and a Twitter card. No image yet, so link previews are text cards (my call, an image can come later).
- Titles end in "Alfonso Baeza" instead of "AB": `CV builder · Projects · Alfonso Baeza`.
- `sitemap.xml`, a prerendered endpoint built from the same lists as the pages (sections, projects, Awesome lists, posts, tags, Bitácora entries), with `lastmod` where there's a date.
- Bitácora entries get a description from their body: `summary()` in `content.ts` takes the first paragraph or list item, as plain text, cut at a word under 160 characters.
- Lighthouse SEO, accessibility and best practices 100 on home, the CV builder and an entry. `/mascot` gets 63 for SEO, on purpose: "blocked from indexing".

## What I learned

- Crawlers only read `robots.txt` at the root of the host: `abafdez.github.io/robots.txt`. My site is a project site under `/portfolio/`, so my file at `/portfolio/robots.txt` was never read, and the root one is a 404. The `Disallow: /` I thought was hiding the site did nothing. On a project site, the `<meta name="robots">` tag on each page is the only switch I control.
- `Disallow` and `noindex` aren't the same anyway. `Disallow` stops crawling, but a blocked URL can still be listed if other sites link to it. `noindex` keeps a page out of results, and the crawler has to be allowed in to read it.
- While prerendering there's no real request, so SvelteKit makes up `page.url` with the origin `http://sveltekit-prerender`. `paths.origin` in the config (in SvelteKit 3 it's under `paths`, next to `base`) makes it the real one, so canonical and `og:url` are absolute URLs that work.
- The canonical URL leaves out the query: `/projects/cv?profile=support` is the same page as `/projects/cv`.
- A sitemap can't be announced in a `robots.txt` I don't control, so it has to be submitted by hand (Google Search Console).

## Links

- [Google: robots.txt introduction](https://developers.google.com/search/docs/crawling-indexing/robots/intro)
- [Google: Block indexing with noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing)
- [The Open Graph protocol](https://ogp.me/)
- [sitemaps.org protocol](https://www.sitemaps.org/protocol.html)
- [SvelteKit: configuration, paths](https://svelte.dev/docs/kit/configuration#paths)

## Next

- Submit `sitemap.xml` in Google Search Console once this is deployed.
- Phase 9 goes on: Vitest for `content.ts` (`summary()` is a good first test), Playwright smoke tests, and tests in CI.
