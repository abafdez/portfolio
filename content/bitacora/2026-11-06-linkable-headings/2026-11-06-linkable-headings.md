---
title: Linkable headings, AVIF covers and a draft badge
date: 2026-11-06
tags: [markdown, accessibility, images, dx]
---

## What we did

- **Headings in markdown have ids now.** `rehype-slug` gives every heading an `id` from its text (`## The base path` → `#the-base-path`, a repeated one gets `-1`), and `rehype-autolink-headings` with `behavior: 'wrap'` makes its text a link to itself. A `#` shows on hover and focus (CSS, with empty alt text so it isn't read out). Posts and Bitácora entries both get them.
- The svelte pages already had ids on their section headings (13, used by `aria-labelledby` and the section navs), so `#links` to those already worked.
- **Covers can be AVIF**: `cover.avif` joins `.png`, `.jpg` and `.webp`.
- **A draft/published badge in dev** (`PostStatus.svelte`) on post cards and post headers: a dashed, muted "draft" or a green "published", each with a Lucide icon. It's not in the build at all.
- The publishing guide (`content/blog/published/README.md`) explains heading ids and AVIF.

## What I learned

- **SvelteKit checks `#links` while prerendering**: a link to an id that isn't on the page fails the build with `prerender_missing_id`. I tested it with a link to `#nope`.
- **'wrap' vs 'append'**: wrapping the heading's text in the link keeps its accessible name as it was ("The base path"). Appending a separate "#" link inside the heading would add that link's text to the heading's name.
- mdsvex 0.12 uses an older `unified` (v9) than the rehype plugins (v11). They work on the same trees, so it runs fine, but TypeScript disagrees; one cast in `vite.config.ts`, with a comment.
- SvelteKit 3 renamed `$app/environment` to `$app/env` (`dev`, `browser`, `building`).
- When a value only matters in dev, `dev` from `$app/env` leaves it out of the build completely: the badge isn't hidden there, it isn't there.
- An AVIF source should be exported at a high quality: the build encodes it again, and compressing twice loses detail twice.
- With the sticky header, a jump to a heading stops below it, thanks to the `scroll-padding-block-start` on `html` from Phase 4.5.

## Links

- [rehype-slug](https://github.com/rehypejs/rehype-slug)
- [rehype-autolink-headings](https://github.com/rehypejs/rehype-autolink-headings)
- [SvelteKit: prerender, handleMissingId](https://svelte.dev/docs/kit/configuration#prerender)
- [Amber Wilson: Are your anchor links accessible?](https://amberwilson.co.uk/blog/are-your-anchor-links-accessible/)
