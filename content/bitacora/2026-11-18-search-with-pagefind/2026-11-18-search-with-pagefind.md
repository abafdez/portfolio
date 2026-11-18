---
title: Search with Pagefind
date: 2026-11-18
tags: [search, sveltekit, view-transitions, animation]
---

## What we did

- Added search: a magnifying-glass button in the header opens a box under it (a `popovertarget` popover, like the colour theme menu). `/` opens it from anywhere.
- Pagefind 1.6.0 runs after both Vite builds (`pagefind --site build`) and writes a static index into `build/pagefind/`, one per `<html lang>`. A search downloads only the slices it needs; no server, so it works on GitHub Pages.
- Only elements marked `data-pagefind-body` are indexed (posts, Devlog entries, project headers, Awesome lists, the About intro), each with `data-pagefind-meta="section:…"` for the label over a result. Date lines, tag lists and code-block labels are `data-pagefind-ignore`: they made the excerpts noisy.
- `search.ts` imports `pagefind.js?lang=…` at run time: a different URL is a different module, so switching language (which doesn't reload the page) gets the other index.
- The box animates in and out (`@starting-style` and `allow-discrete`), the results stagger in, and a result is a morph card: its title and excerpt fly into the page's header.
- `pnpm preview` and the e2e tests now serve `build/` with `scripts/serve.ts`, which copies GitHub Pages' rules.

## What I learned

- `vite preview` serves `.svelte-kit/output`, not `build/`: anything added after SvelteKit (the search index, the CMS at `/admin`) isn't there. That's why search "didn't work on preview".
- A popover closes instantly by default, because `display` can't be animated; `transition-behavior: allow-discrete` on `display` and `overlay` keeps it on screen until the fade ends.
- The search box stays in the page while the page behind it changes, so the result would still be there in the transition's "after" picture with the same name as the new heading, and the browser would skip the transition. `leave()` in `morph.ts` unmarks it and closes the box without its animation (which also cancels one already running).
- Svelte drops CSS rules for attributes set from JavaScript (`data-instant`) unless they're `:global(...)`.

## Next

- Maybe filters by section in the box.
