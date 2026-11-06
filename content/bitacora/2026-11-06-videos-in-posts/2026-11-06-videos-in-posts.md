---
title: Videos in posts
date: 2026-11-06
tags: [markdown, video, dx]
---

## What we did

- **Videos next to a post**, written as HTML in the markdown (`<video>`, `<source>`, `<track>`, `poster`). The markdown step turns every `./` `src` or `poster` into an import, so the build gives it a real, hashed URL and fails if the file is missing.
- **A `<video>` without `width` and `height` fails the build**, like an image without alt text: without them, the page jumps when the video loads.
- `enhance-images.ts` is now `enhance-media.ts` (`enhanceMedia()`), with five new tests (11 in the file).
- `.prose` styles videos like images (border, radius, scaled down with `block-size: auto`).
- The publishing guide has a Videos section: MP4 and WebM, the attributes, and the ffmpeg commands to compress a recording.

## What I learned

- **An animated GIF in a post would come out still**: enhanced-img opens files with `sharp` without asking for animation, so only the first frame is kept. A video is also much smaller, and can be paused.
- Vite already treats `.mp4`, `.webm` and `.vtt` as assets: a plain `import clip from './clip.mp4'` gives the hashed URL. Videos are used as they are, not re-encoded, so compress them before committing.
- With several `<source>`s, the browser plays the first one it can: WebM (smaller) first, MP4 (plays everywhere) last.
- `muted` matters to Svelte: it warns about a video without a captions `<track>`, unless it's muted.
- Playwright can record a browser as WebM (`recordVideo`), handy for a test video.

## Links

- [MDN: the video element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video)
- [web.dev: Replace animated GIFs with video](https://web.dev/articles/replace-gifs-with-videos)
- [Vite: static asset handling](https://vite.dev/guide/assets)

## Next

- Record the Awesome list jumping (from the commit before the fix) for "Pages that jump".
