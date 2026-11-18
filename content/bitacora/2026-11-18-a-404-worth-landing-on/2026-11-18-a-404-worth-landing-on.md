---
title: A 404 worth landing on
date: 2026-11-18
tags: [games, canvas, svelte, accessibility]
---

## What we did

- Rebuilt the 404 page (`src/routes/+error.svelte`): the status, the path that was asked for, links to every section, and one of four variants at random, with "Another 404" to cycle through them. Ideas from 404s.design; our own designs and code.
- The variants: **Breakout** (the bricks are the 404), **Snake** (the food is the 404, walls wrap), an **ASCII wave** that scrambles under the pointer, and **loose dots** that scatter and spring back. All four draw the same 47-cell bitmap (`digits.ts`).
- Game rules are plain functions (`breakout.ts`, `snake.ts`, `ascii.ts`) with unit tests and no canvas; the `.svelte` files only draw and listen (keys, pointer, touch, on-screen buttons).
- Without JavaScript, GitHub Pages' `404.html` was blank: `hooks.server.ts` now adds a small bilingual message with home links to it.
- Then made it a project, `/projects/404`: a radio group picks a variant, and under it how it's made and links to its files on GitHub. Every project and tool page now has "Source code on GitHub" (`source` in `projects.ts`, `sourceUrl()` in `links.ts`), and a test checks every linked path exists.

## What I learned

- On GitHub Pages a missing address gets `404.html` (adapter-static's `fallback`), which starts the app; the router finds no route and shows `+error.svelte` inside the root layout, so it's even in the right language.
- Pick the random variant in `onMount`, never while rendering: `pnpm dev` renders 404s on the server, and a different pick in the browser is a hydration mismatch.
- Keeping game state in a plain object and copying only what the template shows (`phase`, the counts) into `$state` means the loop doesn't trigger Svelte 60 times a second.
- A canvas game needs `role="application"` so a screen reader passes the arrow keys through, plus a `role="status"` line for what's happening.

## Problems & fixes

- Fira Code's ligatures merged characters in the ASCII art: `font-variant-ligatures: none`.
- An e2e regex assumed 48 bricks; the 404 has 47 cells.

## Next

- Maybe a fifth variant; the folder is ready for it (a component and a line in `variants.ts`).
