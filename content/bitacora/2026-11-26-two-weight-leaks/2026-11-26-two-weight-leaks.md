---
title: Lighthouse and two weight leaks
date: 2026-11-26
phase: 12
tags: [performance, vite, mdsvex]
---

## What we did

- **Lighthouse on five pages of both builds** (`main` and mdsvex), mobile, median of three runs: accessibility, best practices and SEO 100 on both, no layout shift, no blocking time; performance 1 to 5 points lower, first paint 0.2 to 0.5 s later.
- Weighed what visitors actually get (each file gzipped, as GitHub Pages serves it): 13 to 26 kB more per first visit. Found two causes and fixed both:
  - **one glob of every body** (blog and Devlog, both languages: 316 paths with their import functions), 11 kB on every post page. Now each section's `+page.ts` makes its own glob with short keys (`base`), and the files' list loads only when a post's blocks name files;
  - **the YAML parser** (12 kB) in every post with a video or YouTube block, because their components imported two helpers from `blocks.ts`, which parses YAML for the build. The helpers moved to `markdown/blocks/values.ts`.
- After: 96 to 103 kB per first visit (`main`: 86 to 94), performance 80 to 82 (`main`: 79 to 86).

## What I learned

- A glob is code: every key and import function is in the chunk that holds it, so put it where only the pages that need it load it.
- Importing one function can bring a whole dependency along when the bundler can't prove it's safe to drop.
- The local server doesn't compress, so Lighthouse's transfer sizes overstate what visitors download. Gzip the files to compare.
- What's left of the gap is the price of a post being a component (the replacement components and one section's list), which is what I switched for.

## Links

- [Vite: glob import](https://vite.dev/guide/features#glob-import)

## Next

- Step 4 of the switch: docs, update notes on the posts that describe svelte-markdown and Shiki.
