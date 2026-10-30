---
title: Responsive images with @sveltejs/enhanced-img
date: 2026-10-29
tags: [images, sveltekit, performance]
draft: true
description: My hero photo in AVIF, WebP and JPEG at two densities, with no layout shift, from a single import.
---

My portfolio's hero has a photo. I wanted it self-hosted (no hot-linking my GitHub avatar), in modern formats, and without the page jumping when it loads.

## Self-hosted first

I downloaded my GitHub avatar into `src/lib/assets/avatar.jpg`. Linking to `github.com/abafdez.png` would work, but every visitor would then make a request to GitHub. I keep third parties out of my pages.

## One import, many files

SvelteKit's `@sveltejs/enhanced-img` processes images at build time:

```ts
import photo from '#lib/assets/avatar.jpg?enhanced';
```

```svelte
<enhanced:img src={photo} alt="" class="photo" />
```

From one 24 KB JPEG, the build produced six files: AVIF, WebP and JPEG, each at 1x and 2x. The HTML is a `<picture>` element, and the browser picks the best format it supports.

It also sets `width` and `height` on the `<img>`. The browser reserves the right amount of space before the image arrives, so nothing jumps.

## Passing it as a prop

When the image comes from a parent component, the prop type is `Picture`:

```ts
import type { Picture } from '@sveltejs/enhanced-img';

interface Props {
	photo?: Picture;
}
```

## 1x/2x or sizes?

I added a `sizes` attribute out of habit. Then I looked at the output:

```html
<source srcset="avatar.avif 1x, avatar@2x.avif 2x" sizes="…" type="image/avif" />
```

`1x`/`2x` are **density descriptors**: they pick a file based on the screen's pixel density. `sizes` only works with **width descriptors** (`400w`, `800w`), where the browser needs to know how wide the image will be displayed. With `1x`/`2x`, browsers ignore it. My photo is always 8rem or 12rem, a small fixed size, so density descriptors are the right fit. I removed `sizes`.

## alt=""

The photo sits right next to my name in a big heading. `alt="Alfonso Baeza"` would make screen readers say my name twice in a row. When an image adds nothing that the text next to it doesn't already say, `alt=""` tells assistive technology to skip it.
