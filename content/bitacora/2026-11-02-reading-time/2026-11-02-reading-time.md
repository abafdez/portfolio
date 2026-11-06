---
title: Reading time, counted at build time
date: 2026-11-02
phase: 7
tags: [content, sveltekit]
---

## What we did

- Added `minutes` to every `Entry` in `content.ts`: the words in the file without its frontmatter, at 200 words a minute, rounded up, at least 1.
- Shown as `· N min read` in `ArticleHeader` (the post and entry pages) and `TeaserCard` (the lists and the home page).

## What I learned

- `content.ts` is the only place that has every file as text, all at once. The layout only gets the rendered content (a snippet), and the `[slug]` page gets a compiled component, not words.
- `/blog` needs the number for every card. Computed in the post page, it would mean loading every post's body to show a list. Computed in `content.ts`, it's a few bytes of data in the prerendered page (`"minutes":14` in `__data.json`).
- Rule of thumb: compute a value where its input already is, and pass it as data to everyone who needs it. Tags work the same way: they're already on every `Entry`, and the list of all tags is one more step over `allPosts`.
- Counting the raw markdown means HTML tags and Shiki's `<span>`s are never counted. That's a side effect, not the reason.
- 200 words a minute is a bit under the usual ~238 for non-fiction: these posts are technical and full of code.

## Links

- [Brysbaert (2019): How many words do we read per minute?](https://doi.org/10.1016/j.jml.2019.104047)
- [Vite: `import.meta.glob`](https://vite.dev/guide/features#glob-import)

## Next

- Tag pages, `/blog/tags/[tag]`.
