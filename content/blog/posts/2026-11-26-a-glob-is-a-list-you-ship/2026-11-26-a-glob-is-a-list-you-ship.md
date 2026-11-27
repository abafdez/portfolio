---
title: A glob is a list you ship
date: 2026-11-26
tags: [performance, vite, sveltekit, mdsvex]
description: 'After moving my posts to mdsvex, Lighthouse said every post got heavier: 13 to 26 kB gzipped on a first visit. Two lines of mine were to blame: a glob of every post, sent to every post, and one small import that brought a YAML parser along.'
---

When I [moved my posts back to mdsvex](/blog/2026-11-26-back-to-mdsvex-measured), every page matched the old build block by block. Matching isn't the same as weighing the same, though, so before merging I ran Lighthouse on five pages of each build: the longest post, one with a video, one with a YouTube card, a code-heavy one and a Devlog entry. Mobile settings, three runs each, keeping the median.

Accessibility, best practices and SEO were 100 on both, nothing shifted and nothing blocked the main thread. But performance was 1 to 5 points lower, the first paint came 0.2 to 0.5 s later, and Lighthouse counted about 110 kB more JavaScript per post.

## Measure what visitors get

That 110 kB was misleading in one way: my local server doesn't compress, and GitHub Pages does. So I took the list of scripts each page loaded, gzipped each file from the build, and added the HTML:

| page         | old build | mdsvex   |
| ------------ | --------- | -------- |
| longest post | 94.3 kB   | 107.6 kB |
| YouTube post | 87.4 kB   | 113.9 kB |
| Devlog entry | 86.0 kB   | 100.3 kB |

Some of that was expected. Each post is a JavaScript module now, and its text, which used to come inside the HTML, comes in that module instead. The HTML got smaller by about as much as the module weighs. The rest was two files that had no business being there.

## Leak one: every post's address, on every post

To load a post, the page has to find its compiled module, and the module's file name is only known to the bundler. So I had written a glob:

```ts
const bodies = {
	...import.meta.glob(['/content/blog/posts/*/*.md', '!/:drafts:']),
	...import.meta.glob('/content/bitacora/*/*.md')
};
```

[`import.meta.glob`](https://vite.dev/guide/features#glob-import) turns that into an object: one key per file, each with a function that imports it. That's what makes every post its own lazy chunk, which is good. But the object itself is code, and it's in the chunk every post page loads: 316 paths (posts and Devlog entries, in both languages), each with its import function and the list of chunks it needs. 68 kB before compression, 11 kB after, so a blog post could find a Devlog entry it would never show.

Two changes. Each section's page makes its own glob, so a blog post only gets the blog's list. And the `base` option makes the keys short (`./slug/slug.md` instead of the full path):

```ts
const bodies = import.meta.glob<Body>(['/content/blog/posts/*/*.md', '!/:drafts:'], {
	base: '/content/blog/posts'
});
```

The glob of the files next to the posts, which only posts with a video or a YouTube card need, now loads with a dynamic `import()` only when a post's blocks name files.

## Leak two: a YAML parser for a file type

The other new file contained a YAML parser, and it loaded on every post with a video or YouTube block. Those components needed two small things, a function that says whether a file is `video/webm` or `video/mp4`, and the "Watch on YouTube" text. They imported them from `blocks.ts`, the file that defines my blocks' fields. That file also reads each block's YAML for the build and the CMS, with `import { parse } from 'yaml'`.

Importing one function from a file isn't supposed to bring the whole file, and usually it doesn't: the bundler drops what nobody uses. It can only drop a module it can prove has no side effects, though, and here the YAML parser came along anyway, 12 kB gzipped, for a function of one line. The fix was to give the browser's helpers a file of their own, `values.ts`, with no imports; `blocks.ts` re-exports them for everything else.

## Finding them

Neither showed up in my tests or in the page comparison. What found them was boring: the list of scripts Lighthouse saw on the same page in both builds, side by side, sorted by size. The new files stood out, and opening them was enough: one began with the paths of every post I've written, the other with `Symbol.for('yaml.alias')`.

## After

| page         | old build | before the fixes | after    |
| ------------ | --------- | ---------------- | -------- |
| longest post | 94.3 kB   | 107.6 kB         | 102.8 kB |
| YouTube post | 87.4 kB   | 113.9 kB         | 99.8 kB  |
| Devlog entry | 86.0 kB   | 100.3 kB         | 95.9 kB  |

Performance is now 80 on the longest post (the old build: 79) and 81 to 82 on the others (the old build: 82 to 86). The gap that's left is the price of a post being a component: the components that replace headings, code blocks and links, and one section's list of posts. That's the price of components and live demos in my posts, which is why I switched. The 23 kB I had added without noticing wasn't.

## Links

- [Vite: glob import](https://vite.dev/guide/features#glob-import), including `base`
- [Lighthouse](https://developer.chrome.com/docs/lighthouse/overview)
