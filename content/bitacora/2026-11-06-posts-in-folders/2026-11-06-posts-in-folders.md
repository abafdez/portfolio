---
title: Every post in its own folder, with its images
date: 2026-11-06
tags: [content, images, vite, markdown]
---

## What we did

- Moved every post, draft and Bitácora entry into a folder with its own name (`<slug>/<slug>.md`), 95 files with `git mv`, so their images can sit next to them. The file names didn't change, so the slugs and URLs didn't either.
- The blog has two explicit folders now: `content/blog/drafts/` (dev only) and `content/blog/published/`. Publishing is `git mv content/blog/drafts/<slug> content/blog/published/`.
- The globs became `*/*.md`. A new `slugOf()` in `content.ts` fails the build when a folder and its file have different names.
- Images are written as plain markdown, `![What it shows](./diagram.png)`. The `markdown()` plugin in `vite.config.ts` turns each one into an import plus an `<enhanced:img>`: AVIF and WebP copies, width and height set.
- The build fails on an image without alt text, or a file that doesn't exist.
- `summary()` skips a line that is only an image, and drops images inside a sentence. 83 unit tests now.

## What I learned

- I compared six places for images: `static/`, next to the file, a folder per post, a shared folder, imports by hand, an external host. A folder per post keeps a post and its images together: one move to publish, one delete to remove.
- `![alt](./x.png)` becomes `<img src="./x.png">`, and the browser reads `./` from the **page's URL**, not from the markdown file's folder. The prerender crawler checks `src` too, so the build failed with a 404 instead of shipping a broken image.
- `<enhanced:img src="./x.png">` written in markdown couldn't find the file, but an import did: `import photo from './x.png?enhanced'`. So the plugin writes the imports for me.
- An import is checked by the bundler: a missing image is a build error naming the file, not a broken picture on the live site.
- mdsvex leaves `alt` out entirely when it's empty, which makes a missing alt easy to catch.
- Images in `.prose` need `block-size: auto`: with width and height attributes and `max-inline-size: 100%`, a wide screenshot would be squeezed narrower but keep its full height.
- Git keeps every image forever, even after deleting it. Commit them at about twice the display width, compressed.

## Links

- [Vite: static asset handling](https://vite.dev/guide/assets)
- [SvelteKit: images, @sveltejs/enhanced-img](https://svelte.dev/docs/kit/images)
- [MDN: the img element, alt](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img#alt)

## Next

- Add the first real images to a post or an entry.
