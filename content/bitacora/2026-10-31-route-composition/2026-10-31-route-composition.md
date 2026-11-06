---
title: Each route picks its composition
date: 2026-10-31
phase: 4.5
tags: [sveltekit, typescript, layout]
---

## What we did

- A route can now say how the root layout arranges it: `composition` in its load data. Two values for now: `default` and `reading`.
- The type lives in `App.PageData` (`src/app.d.ts`), so `page.data.composition` is typed everywhere.
- The root layout puts it on `<main data-composition>`, and `global.css` styles `main` for each value. Reading is one 60ch column.
- `/blog` and `/bitacora` set `reading` in their `+layout.ts`, so every page under them gets it too.
- Fixed `main` shrinking to its content: it now always takes its full max width (`inline-size: 100%`).

## What I learned

- Why not just style `main` from the page? A page's styles are scoped to the page component; `main` belongs to the root layout. The page can only send data up, and the layout decides what to do with it.
- A `+layout.ts` load applies to its route and everything below it, so `/bitacora/[slug]` will be `reading` without doing anything.
- `satisfies App.PageData` checks the value against the type and keeps `'reading'` as that exact string. Without it TypeScript widens it to `string`.
- In a grid, `margin-inline: auto` stops an item from stretching: it shrinks to fit its content. So each page was as wide as its text. `inline-size: 100%` plus `max-inline-size` fixes it.
- With the route view transitions, changing composition (home 1120px → blog 576px) needs nothing extra: the content box jumps to the new size and the new content fades in.

## Links

- [SvelteKit: page.data](https://svelte.dev/docs/kit/$app-state#page)
- [SvelteKit: App.PageData](https://svelte.dev/docs/kit/types#PageData)
- [TypeScript: satisfies](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#the-satisfies-operator)

## Next

- The real tagline (Alfonso's words), then the Phase 4.5 PR.
