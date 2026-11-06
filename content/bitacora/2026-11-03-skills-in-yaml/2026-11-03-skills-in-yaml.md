---
title: Skills in YAML, icons as data and an SVG sprite
date: 2026-11-03
phase: 5
tags: [sveltekit, yaml, svg, performance]
---

## What we did

- Planned what comes next: I'm applying for different kinds of jobs and need a CV for each. Phase 5.5 will be a CV builder (a `/projects` tool: pick a job profile, get an ATS-friendly CV), with my personal data kept in my browser, never in the repo. First, the skills had to become easy to edit and know which jobs they matter for.
- The skills moved from `skills.ts` to `content/skills.yaml`. Icons are names (a Simple Icons slug or a Lucide name), and every skill lists its job profiles: `web`, `support`, `mainframe`.
- `skills.server.ts` reads and checks the file at build time. `/about` gets the skills from a `+page.server.ts` load.
- Brand logos come from `/logos.svg`, a sprite that a `+server.ts` endpoint writes at build time. Pages draw them with `<use href>`.

## What I learned

- A `.server.ts` module can only be imported by server code; SvelteKit refuses to bundle it for the browser. The icon libraries are imported there, so they can't reach the page by accident.
- A server load can only send data. Lucide icons travel as `[tag, attributes]` pairs (from the plain `lucide` package) and `<svelte:element>` draws them; inside an `<svg>` it creates SVG elements.
- A server load's data is embedded in the page for hydration. A sprite drawn in the page put every path in the HTML twice: once drawn, once in that data. A separate file keeps them out of the page.
- A folder named `logos.svg` in `src/routes/` serves `/logos.svg`. An endpoint needs its own `export const prerender = true` (the layout's only reaches pages) and an entry in `prerender.entries` (the crawler follows links, and `<use href>` isn't one).
- TypeScript only narrows after `if (!x) fail()` when `fail` is a function declaration (or a const with a type annotation) returning `never`, not an untyped arrow.

## Problems & fixes

- The first build had no `logos.svg` and no error: the endpoint wasn't prerendered and nothing linked to it.
- My size comparison used `git stash`, which leaves new (untracked) files behind, so the "before" build was half new code. Compare against a commit instead.

## Links

- [SvelteKit: `+server`](https://svelte.dev/docs/kit/routing#server)
- [SvelteKit: server-only modules](https://svelte.dev/docs/kit/server-only-modules)
- [SvelteKit: prerender entries](https://svelte.dev/docs/kit/configuration#prerender)
- [Svelte: `<svelte:element>`](https://svelte.dev/docs/svelte/svelte-element)
- [MDN: `<use>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/use)
- [Lucide: the `lucide` package](https://lucide.dev/guide/packages/lucide)

## Next

- Edit `content/skills.yaml`: my levels, the profiles, what's missing.
- A profile filter on `/about`, then Phase 5.5, the CV builder.
