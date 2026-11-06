---
title: Self-hosted avatar with enhanced-img
date: 2026-10-29
phase: 4
tags: [images, sveltekit, performance]
---

## What we did

- Downloaded my GitHub avatar (460px JPEG, 24 KB) into `src/lib/assets/avatar.jpg`, rather than linking to GitHub.
- Imported it with `?enhanced` and rendered it with `<enhanced:img>` in Hero.

## What I learned

- `?enhanced` produces a `Picture` object. At build time it creates AVIF, WebP and JPEG versions at 1x and 2x, and the browser picks the best format it supports.
- It also sets `width` and `height`, so the layout doesn't shift while the image loads.
- When the image is a prop, the type is `Picture` from `@sveltejs/enhanced-img`.
- For a small image with a fixed display size, density descriptors (`1x`, `2x`) are right, and browsers ignore `sizes` with them. `sizes` only matters with width descriptors (`400w`).
- The photo has `alt=""` because my name is right next to it. Repeating it would be noise for screen reader users.

## Problems & fixes

- I first added a `sizes` attribute. The output used `1x`/`2x`, so `sizes` did nothing. I removed it.

## Links

- [SvelteKit: Images](https://svelte.dev/docs/kit/images)
- [MDN: Responsive images](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images)

## Next

- Use enhanced-img for project screenshots in Phase 8.
