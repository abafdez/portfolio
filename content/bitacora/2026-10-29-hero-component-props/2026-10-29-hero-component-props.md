---
title: 'Hero component: typed props, links and fallbacks'
date: 2026-10-29
phase: 4
tags: [svelte, typescript, components]
---

## What we did

- Built `Hero.svelte` (name, tagline, photo, links) and `TeaserCard.svelte`, and composed them in the home page.
- Added `src/lib/links.ts` with a `Link` type and a shared `profiles` list (GitHub, LinkedIn) used by the hero and the footer.
- Replaced fake "Coming soon" cards with typed, empty lists and `{#each}…{:else}` fallbacks.

## What I learned

- The page holds the data and the component holds the layout. Hero knows nothing about my content.
- `Link` is a union of two shapes: a `route` (a `RouteId`) or a `url` (an `https://` string). `'route' in link` narrows it, so TypeScript knows whether to call `resolve()` or use the URL.
- A template literal type (`` `https://${string}` ``) rejects `http://` and bare strings at compile time.
- Required props (`name`, `links`) turn a missing value into a type error. A default like `''` would render an empty `<h1>`: it looks fine, but screen readers get a heading with no text, and nothing warns me.
- Optional props (`tagline?`, `photo?`) are for things the component still makes sense without.
- `<script module>` runs once per file, not once per instance, so it's where a shared `Teaser` type goes. Pages import it with `import TeaserCard, { type Teaser } from '…'`.
- `{#each list as item}…{:else}…{/each}` renders a fallback for an empty list. When real data arrives, nothing else changes.
- `as const satisfies readonly Link[]` checks each entry is a valid `Link` but keeps the exact type, so the footer knows every profile has a `url`. With `: Link[]` it would need an `if`.
- The `#lib/*` alias in `package.json` maps to exact paths, so TS files need the extension: `#lib/links.ts`.

## Problems & fixes

- `Cannot find module '#lib/links'`: added the `.ts` extension.
- `svelte-check` reported "`<script>` was left open" because a comment in my script contained the literal text `<style>`. It finds blocks by their tags in the raw text, so I reworded the comment.

## Links

- [Svelte: $props](https://svelte.dev/docs/svelte/$props)
- [Svelte: each blocks](https://svelte.dev/docs/svelte/each)
- [TypeScript: satisfies](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#the-satisfies-operator)

## Next

- Write the real tagline (TODO in `src/routes/+page.svelte`).
