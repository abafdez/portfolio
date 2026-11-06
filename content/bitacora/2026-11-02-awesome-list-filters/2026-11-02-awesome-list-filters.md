---
title: An Awesome list with filters in the URL
date: 2026-11-02
phase: 8
tags: [svelte, sveltekit, runes, accessibility]
---

## What we did

- Awesome lists are YAML files in `content/awesome/`, one per list: categories, then links with a title, url, description and tags. A list is data, not prose, so no markdown. The file name is the URL: `modern-css.yaml` → `/awesome/modern-css`.
- `src/lib/awesome/awesome.ts` loads them at build time (`import.meta.glob` with `?raw` and the `yaml` package, like `content.ts`). A link that isn't `https://` or a tag that isn't kebab-case fails the build. `checkTags` is now exported from `content.ts` for this.
- `LinkFilter` (`filter.svelte.ts`) holds the search text and the picked tags as `$state`, and the matching links and their count as `$derived`. It turns itself into URL params and reads them back.
- `AwesomeList.svelte` shows a search box, tag toggle buttons (`aria-pressed`), a live count (`role="status"`) and a "Clear filters" button. The filter goes into the URL (`?q=grid&tag=docs`), so a filtered view can be shared.
- `/awesome` lists the lists. The first one, Modern CSS, has 25 links taken from the docs this Bitácora already cites.

## What I learned

- Runes work in classes, but only in `.svelte` and `.svelte.ts` files. A class keeps the state, what's derived from it and the ways to change it in one place, and a component gets all of it as one object.
- `$derived` is lazy: `results` is recomputed only when it's read and something it uses has changed.
- The class gets the categories as a function (`() => list.categories`), not the array. A plain array would be read once, when the class is created.
- `{#key list.slug}` makes a fresh component when the list changes. Otherwise moving from one list to another would keep the old filter.
- A function binding, `bind:value={() => get, (v) => set}`, runs my code right where the value changes. I use it to update the URL after the filter, in that order.
- The filters only render once `onMount` has run. Without JS they'd be controls that do nothing, and the prerendered page already has every link.
- The descriptions are our own data, shown as text with `{…}`, which Svelte escapes. Only HTML through `{@html}` would need sanitizing.
- `page.url.searchParams` is read-only. `read()` asks only for `Pick<URLSearchParams, 'get' | 'getAll'>`, the two methods it uses, so the read-only params fit.

## Problems & fixes

- "Clear filters" hides itself once nothing is filtered, and focus fell to `<body>`. Clearing now focuses the search box.
- An unknown `?tag=` from a link would have hidden every link behind a button that doesn't exist. `read()` keeps only the list's own tags.

## Links

- [Svelte: `$state` in classes](https://svelte.dev/docs/svelte/$state#Classes)
- [Svelte: `$derived`](https://svelte.dev/docs/svelte/$derived)
- [Svelte: function bindings](https://svelte.dev/docs/svelte/bind#Function-bindings)
- [Svelte: `{#key}`](https://svelte.dev/docs/svelte/key)
- [MDN: `<search>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/search)
- [MDN: aria-pressed](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-pressed)

## Next

- Review the Modern CSS list (descriptions, what's missing), then open the Phase 8 PR.
