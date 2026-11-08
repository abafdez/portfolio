---
title: Blog drafts that never ship
date: 2026-11-02
phase: 7
tags: [sveltekit, vite, blog]
---

## What we did

- Moved every post to `content/blog/drafts/`. A post is a draft because of where it lives, so `Entry.draft` comes from the path and the `draft: true` frontmatter is gone.
- Wrapped the drafts glob in `import.meta.env.DEV ? import.meta.glob(…) : {}`, in `content.ts` (frontmatter) and in `blog/[slug]/+page.ts` (bodies).
- Built `/blog` (posts grouped by year with `Map.groupBy`) and `/blog/[slug]` the same way as the Devlog. Both `[slug]` pages now share `ArticleHeader.svelte`.
- Added a `prerender.handleUnseenRoutes` handler that ignores only `/blog/[slug]`.

## What I learned

- Hiding a draft with a filter isn't enough. A glob is resolved when the site builds, from file paths only, before any frontmatter is read. Vite makes a chunk for every file it matches, so a filtered draft would still sit in `build/_app/immutable/` as a public `.js` file.
- In a build, Vite replaces `import.meta.env.DEV` with `false`, and the dead branch is removed with the glob inside it. No draft is read or bundled.
- A server `load` returns data that gets serialized (`devalue`), and a component is a function, so it can't be. That's why the body comes from `+page.ts`, a universal `load` that can `import()` the chunk in the browser too.
- Two checks catch different link problems: a link to a missing page fails the crawl (and `resolve()` with a typo fails in TypeScript), and `handleUnseenRoutes` catches a route nobody links to. I kept the check on for everything except `/blog/[slug]`, which has no pages until a post is published.

## Links

- [Vite: Glob import](https://vite.dev/guide/features.html#glob-import)
- [Vite: Env variables](https://vite.dev/guide/env-and-mode.html)
- [SvelteKit: Universal vs server load](https://svelte.dev/docs/kit/load#Universal-vs-server)
- [SvelteKit: Configuration, prerender](https://svelte.dev/docs/kit/configuration#prerender)

## Next

- Syntax highlighting with Shiki.
