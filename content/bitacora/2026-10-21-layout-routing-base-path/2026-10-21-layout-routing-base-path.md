---
title: Layout, routing and the GitHub Pages base path
date: 2026-10-21
phase: 2
tags: [sveltekit, routing, github-pages, typescript]
---

## What we did

- Set `paths.base` from `BASE_PATH`, which CI sets to `/${{ github.event.repository.name }}`. The value is validated in `vite.config.ts`, and the build throws if it's malformed.
- Created stub routes: `/cv`, `/projects`, `/awesome`, `/blog`, `/bitacora`. Moved the `/dev` content into `/bitacora`.
- Built `Header`, `Nav` and `Footer` in `src/lib/components/` and wrapped pages in `<main>`.
- The nav is built from a typed array (`href: RouteId`) with a keyed `{#each}`, and the active link gets `aria-current="page"`.

## What I learned

- `process` needs `@types/node`. `tsconfig` `include` takes file paths, not package names.
- `as` checks nothing. Validate runtime values (env vars) first, then cast. A cast right after a check is honest.
- Types protect values written in code. Runtime checks protect values that arrive from outside, like env vars, input and frontmatter.
- `resolve()` only accepts real routes. Typing `href` as `RouteId` turned typos and missing routes into type errors.
- `href="resolve('/')"` is a string. `href={resolve('/')}` is code, and svelte-check can't tell the difference.
- On GitHub Pages `page.url.pathname` includes the base, so compare against `resolve(href)`.
- Svelte drops attributes whose value is `undefined`, which keeps `aria-current={active ? 'page' : undefined}` clean.
- Prerendered links are relative (`./blog`), so `/portfolio` doesn't appear in the HTML.
- `VAR=x a && b` sets `VAR` only for `a`. To preview like GitHub Pages: `BASE_PATH=/portfolio pnpm build && BASE_PATH=/portfolio pnpm preview`.
- One `<h1>` per page. The site name in the header is not a heading.

## Problems & fixes

- `pnpm lint` failed on the workflow because of double quotes. Read which file the tool names before blaming the environment (Node 24 vs 22 wasn't the cause).
- Nav hrefs were `'home'` and `'about'` (missing `/`, and routes that don't exist). The `RouteId` type caught them.

## Next

- Phase 3: design system with Open Props.
