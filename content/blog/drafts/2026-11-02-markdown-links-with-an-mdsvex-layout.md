---
title: 'Markdown links that know the base path: an mdsvex layout'
date: 2026-11-02
tags: [mdsvex, sveltekit, links]
description: My site lives under /portfolio on GitHub Pages, so a markdown link to /cv broke. An mdsvex layout swaps every link for a component that fixes it.
---

My site is served from `/portfolio`, because that's where GitHub Pages puts a project site. In my Svelte components, every link goes through SvelteKit's `resolve()`, which adds that base path. But my posts are markdown, and a markdown link to `/cv` is just `<a href="/cv">`. It points at the root of the domain, outside my site, and 404s.

<!-- TODO: how I noticed (the dev server has no base path, so it only broke in the build) -->

## A layout for every markdown file

mdsvex can wrap every file in a Svelte component, its layout. It's an option of `compile`, and it has to be a file path, because mdsvex reads the file:

```ts
const layout = fileURLToPath(
	new URL('./src/lib/components/MarkdownLayout.svelte', import.meta.url)
);

const out = await compile(code, { filename: id, extensions: ['.md'], layout });
```

The layout gets the content as `children`. Mine only renders it: the post page already shows the title and date.

## Replacing elements

The useful part is the layout's module script. If it exports a component named like an HTML element, mdsvex uses that component for every such element in the markdown:

```svelte
<script module lang="ts">
	import a from './MarkdownLink.svelte';

	export { a };
</script>
```

Now every link in every post is a `MarkdownLink`. It gets the same props the `<a>` would have had (`href`, `title`) and the link text as `children`.

mdsvex imports the layout as `* as Components`, so the other exports are reachable too. My code blocks use that: the Shiki highlighter wraps each one in `Components.CodeBlock`, and `CodeBlock` doesn't replace any element.

## The link component

```svelte
<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Snippet } from 'svelte';

	const withBase = resolve as (path: string) => string;

	interface Props {
		href: string;
		title?: string;
		children: Snippet;
	}

	let { href, title, children }: Props = $props();

	let external = $derived(/^https?:\/\//.test(href));
	let url = $derived(href.startsWith('/') ? withBase(href) : href);
</script>

<a href={url} {title} rel={external ? 'external' : undefined}>{@render children()}</a>
```

Three kinds of links:

- **`/cv`**, a page on my site. It gets the base path. In the build it comes out as `href="../cv"`, because SvelteKit writes relative links in prerendered pages.
- **`https://…`**, another site. It gets `rel="external"`.
- **`./other-post` or `#a-heading`.** These are relative, so they already work under any base.

## The cast, and who checks the links

`resolve()` is typed from my routes: it only accepts a path it knows, like `'/cv'` or `'/blog/[slug]'` with a slug. A markdown `href` is just a `string`, so TypeScript can't check it. For a path with no `[param]`, `resolve()` only adds the base, so I widen its type once, in `withBase`.

That gives up a check, so something else has to do it. The prerender crawler does: it follows every link while it builds the site, and a link to a page that doesn't exist fails the build. I tried it with a link to `/nope`, and the build stopped.

<!-- TODO: the error message the build gave me -->

## Dropping `nofollow`

mdsvex adds `rel="nofollow"` to every link. It tells search engines I don't vouch for the page I link to. That's meant for links I don't control, like comments. The links in my posts are ones I recommend, so `MarkdownLink` never reads the `rel` prop, and it's gone.

## One more replace

mdsvex 0.12 still writes Svelte 4 syntax, and with a layout it adds `{...$$props}` to the layout call. Runes mode has no `$$props`, and nothing passes props to a post anyway, so my Vite plugin removes it with one more `replace`.

<!-- TODO: anything else I'd replace with the layout (images? headings with anchor links?) -->
