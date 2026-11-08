---
title: 'Icons as data, and an SVG sprite from a SvelteKit endpoint'
date: 2026-11-03
tags: [sveltekit, svg, performance, yaml]
description: My skills moved from TypeScript to a YAML file. The icons came along as data, the icon libraries stopped shipping to the browser, and the page lost half its weight.
cover: App icons flowing into an SVG sprite, then onto a web page.
---

My about page lists about seventy skills, each with an icon: a brand logo from Simple Icons, or a generic one from Lucide. At first the list was a TypeScript file that imported every icon. It worked, but it had two problems:

- **Editing it meant editing code.** Adding a skill was an import at the top and an object at the bottom, and I want to change the list often (and filter it by the kind of job I apply for).
- **It was heavy.** The page's JavaScript carried every icon object (each Simple Icon has its path _and_ the full SVG as a string), about 44 KB gzipped, and the HTML had every logo's path, twice. Lighthouse gave it 91.

This post is how both went away.

## The skills are a YAML file

Like my [Awesome lists](./2026-11-02-filters-in-a-svelte-class), the skills are data now, in `content/skills.yaml`:

```yaml
profiles:
  - id: web
    name: Web development
  - id: support
    name: IT support and systems

groups:
  - name: Web development
    id: web
    icon: globe
    skills:
      - name: Svelte and SvelteKit
        logo: svelte
        level: 2
        profiles: [web]
        note: 'This site: Svelte 5 runes, prerendered SvelteKit on GitHub Pages.'
```

Icons are names: `logo` is a Simple Icons slug, `icon` a Lucide name, both as they appear on the libraries' websites. `profiles` are the kinds of job a skill matters for, so a page can show only the skills for, say, support jobs.

## A loader that fails the build

`skills.server.ts` reads the file at build time and checks everything I could get wrong: a logo or icon that doesn't exist, a level that isn't 1 to 4, a profile that isn't declared at the top, two skills with the same name, an evidence link that isn't `https://`. A mistake stops the build and says where:

```
Error: content/skills.yaml, "Python" (Languages): "suport" isn't one of the profiles at the top
```

The `.server` in the file name matters. SvelteKit refuses to bundle a `.server.ts` module into browser code, so only `+page.server.ts` files can import it. That's where the icon libraries are imported, thousands of icons, and that guarantee keeps them on the build machine.

## Icons as data

A server load can only send data to the page: no components, no functions. So the loader turns every icon into data:

```ts
export type IconData = { logo: string } | { node: [string, Record<string, string>][] };
```

- **A Lucide icon** is a handful of SVG elements. The plain `lucide` package (not the Svelte one) has each icon as a list of `[tag, attributes]` pairs: a database icon is an `ellipse` and two `path`s. One component draws them with `<svelte:element this={tag} {...attributes} />`. Inside an `<svg>`, Svelte knows to create SVG elements.
- **A brand logo** is just its slug. Its path is somewhere else: in the sprite.

The page's own JavaScript went from about 44 KB to 5 KB gzipped.

## The sprite is an endpoint

A sprite is one SVG file with many shapes, each with an id. A page draws one with `<use>`:

```svelte
<svg viewBox="0 0 24 24" fill="currentColor">
	<use href="{resolve('/logos.svg')}#svelte" />
</svg>
```

I don't write that file by hand. A SvelteKit endpoint builds it from the skills, and since the site is prerendered, it becomes a static file in the build:

```ts
// src/routes/logos.svg/+server.ts
import { logoPaths } from '#lib/skills/skills.server.ts';

export const prerender = true;

const paths = logoPaths.map(({ slug, path }) => `<path id="${slug}" d="${path}"/>`).join('');

export const GET = () =>
	new Response(`<svg xmlns="http://www.w3.org/2000/svg"><defs>${paths}</defs></svg>`, {
		headers: { 'content-type': 'image/svg+xml' }
	});
```

The folder's name is the URL: `src/routes/logos.svg/` serves `/logos.svg`. Two things it needed:

- **`export const prerender = true` in the endpoint itself.** My root layout already says `prerender = true`, but layouts only apply to pages, not to endpoints.
- **An entry in `prerender.entries`.** SvelteKit finds pages to prerender by crawling links from the home page, and `<use href>` isn't a link. Without the entry, the build finished happily and `logos.svg` just wasn't there.

The paths stay in the file, never in the page: not in the HTML, and not in the data SvelteKit embeds in the page for hydration either. (My first try had the sprite inline, and the paths ended up in the HTML twice: once drawn, once in that data.) `fill="currentColor"` still works through `<use>`, so each logo still takes its color from the CSS.

## The result

|                               | Before | After  |
| ----------------------------- | ------ | ------ |
| `about.html`                  | 351 KB | 152 KB |
| The page's JS (gzipped)       | ~44 KB | ~5 KB  |
| `logos.svg` (gzipped, cached) | none   | 31 KB  |
| Lighthouse performance        | 91     | 96     |
