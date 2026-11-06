---
title: Cover images, thumbnail cards and figures
date: 2026-11-06
tags: [images, components, seo, testing]
---

## What we did

- A post can have a **cover**: `cover.png` (or `.jpg`, `.webp`) in its folder, with its alt text as `cover:` in the frontmatter. `checkCover()` fails the build when one comes without the other.
- `src/lib/covers.ts` globs the covers with `?enhanced` at 1600, 800 and 480 px for the pages, and as a 1200 px JPEG for link previews.
- **Cards** (my picks): the cover as a thumbnail beside the text, and below 34rem of card width (a container query) on top. Without a cover, a generated tile: the blueprint grid with the post's first tag, a 4:1 strip when it's on top. The whole card is now the link.
- **Posts**: the cover at the top (`fetchpriority="high"`). `![alt](./x.png "Caption")` becomes a `<figure>` with a `<figcaption>`, and post images load lazily. Plain figures (my pick).
- **Link previews**: a post with a cover gets `og:image` and `twitter:card` `summary_large_image`.
- `enhanceImages()` moved from `vite.config.ts` to `src/lib/enhance-images.ts`, with 6 tests. `checkUniqueSlugs()` fails when a post is in both `drafts/` and `published/`. 99 unit tests.
- Lighthouse on `/blog` and a post with a cover (a copy, removed after): 96 / 100 / 100 / 100 in both themes, CLS 0. No scroll at 320px.

## What I learned

- One image has several names: **cover** (or featured image), **thumbnail** in a card, **hero** at the top of a post, **og:image** in a link preview.
- In a card, the image gets `alt=""`: the title right next to it already says what the post is, and a screen reader would read it twice. At the top of the post, it needs real alt text.
- `srcset` with widths (`480w, 800w, 1600w`) and `sizes` lets the browser choose: a 240px thumbnail downloads the 480px file, not the 1600px one. The card and the post use the same files with different `sizes`.
- A **stretched link**: the title's `<a>` gets `::after { position: absolute; inset: 0 }`, so the whole card is clickable with one link. The tags get `position: relative; z-index: 1` to stay clickable above it, and `:has(a:focus-visible)` draws the focus ring around the card.
- A **container query** asks how wide the card is, not the window, so the same card works in the wide `/blog` column and the narrow home page grid.
- mdsvex puts each attribute on its own line when a tag gets long. My regex had a single space after `<img`, so long images weren't converted and gave a 404. `\s+` fixed it, and a test with real mdsvex output keeps it fixed.
- Prettier rewrites a markdown title's double quotes to single ones; mdsvex accepts both.
- A preview server started before a build serves the old file list. My first Lighthouse run went to a stale preview on the same port: console errors and CLS 0.33 that weren't real.

## Problems & fixes

- A captioned test image showed as a 404: the regex bug above.
- A temporary copy of a draft in `published/` made two posts with the same slug in dev; `checkUniqueSlugs()` now catches that.

## Links

- [SvelteKit: images, dynamically choosing an image](https://svelte.dev/docs/kit/images#sveltejs-enhanced-img-Dynamically-choosing-an-image)
- [MDN: responsive images, srcset and sizes](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images)
- [MDN: CSS container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries)
- [Inclusive Components: cards](https://inclusive-components.design/cards/)
- [Open Graph protocol](https://ogp.me/)

## Next

- Real covers for the drafts I publish first.
