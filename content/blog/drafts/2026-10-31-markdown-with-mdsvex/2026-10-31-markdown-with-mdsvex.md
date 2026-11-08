---
title: 'Markdown pages with mdsvex, and a lesson in Vite plugin order'
date: 2026-10-31
tags: [sveltekit, mdsvex, markdown, vite]
description: Turning a folder of markdown files into prerendered SvelteKit pages with mdsvex, why the usual preprocess setup broke on my own posts, and how Vite really orders plugins.
---

The Bitácora and this blog are folders of markdown files. Until now the site only read their frontmatter, to list the latest ones on the home page. This post renders the bodies too: every file in `content/bitacora/` becomes its own prerendered page, and adding a file is the only step to publish one.

My first try failed, and the reason turned out to be more interesting than the setup.

## Why mdsvex

There are two ways to get HTML out of markdown in SvelteKit:

- **Render it yourself** in a server `load`, with a markdown library, and put the HTML string on the page with `{@html}`.
- **mdsvex**, which turns each markdown file into a Svelte component. You import it and render it like any other component, and the markdown can use Svelte components too.

<!-- TODO: why I picked mdsvex -->

mdsvex has two versions right now: 0.12, the stable one, and a `1.0.0-next` rewrite that is still a prerelease. I'm using 0.12.

## The usual setup, and how it broke

The mdsvex docs add it as a preprocessor. A preprocessor changes a file's source before the Svelte compiler sees it, so mdsvex turns markdown into Svelte markup, and Svelte compiles that like a `.svelte` file. In SvelteKit 3 the config lives in `vite.config.ts`:

```ts
sveltekit({
	extensions: ['.svelte', '.md'],
	preprocess: [mdsvex({ extensions: ['.md'] })]
});
```

`extensions` tells Svelte to compile `.md` files as components. The build failed on my own Bitácora entry about images:

```
[plugin vite-plugin-enhanced-img-markup] content/bitacora/2026-10-29-enhanced-img-avatar.md
CompileError: `<enhanced:img>` was left open
```

The line it complained about was prose: "rendered it with `<enhanced:img>` in Hero". mdsvex knows that's inline code and escapes it. But the error didn't come from mdsvex. It came from enhanced-img, the plugin that optimizes my images.

enhanced-img has to find every `<enhanced:img>` tag in my components before Svelte compiles them, so it parses every Svelte file. Once `.md` counted as a Svelte file, it parsed my markdown too. And it did that **before mdsvex ran**, so it read the raw text, found `<enhanced:img>` with no closing tag, and gave up.

## How Vite orders plugins

I thought the order of the `plugins` array decided who runs first. It does, but only after something else. Vite sorts the `transform` hooks in three groups:

1. Every hook with `order: 'pre'`.
2. Every normal hook.
3. Every hook with `order: 'post'`.

The order in the array (and a plugin's `enforce`) only matters inside each group. enhanced-img's hook is `'pre'`. The hook that runs preprocessors isn't. So enhanced-img always went first, wherever I put it in the array.

<!-- TODO: what I tried before I understood this -->

## A tiny plugin of my own

If mdsvex has to run before a `'pre'` hook, it needs to be a `'pre'` hook too, and first in that group. So instead of `preprocess`, I call mdsvex from my own Vite plugin:

```ts
function markdown(): Plugin {
	return {
		name: 'markdown',
		enforce: 'pre',
		transform: {
			order: 'pre',
			filter: { id: /\.md$/ },
			async handler(code, id) {
				const out = await compile(code, { filename: id, extensions: ['.md'] });
				if (!out) return;
				return {
					code: out.code.replace('<script context="module">', '<script module>'),
					map: { mappings: '' }
				};
			}
		}
	};
}
```

It goes first in the array, and `extensions: ['.svelte', '.md']` stays so Svelte still compiles the result. Now enhanced-img sees the HTML mdsvex made, where my tag is the harmless text `&lt;enhanced:img&gt;`.

Three small things in there:

- **The filter.** `content.ts` still imports the same files with `?raw`, to read their frontmatter as plain text. Vite turns those into a JS module (`export default "---\ntitle: …"`), and every transform hook runs on that module too. Their id ends in `?raw`, not `.md`, so the `$` in `/\.md$/` keeps my plugin away from them. Without it, mdsvex would wrap that JS in a `<p>` and the build would fail.
- **`<script module>`.** mdsvex 0.12 still writes the Svelte 4 syntax `context="module"`. Svelte 5 accepts it with a deprecation warning, one per file. One `replace` and the warnings are gone.
- **The empty sourcemap.** A plugin that changes code should say how the new lines map to the old ones. Markdown to HTML has no useful mapping, and `{ mappings: '' }` says so on purpose. Without it, the build warned once per file.

The plugin grew a little later. It passes two more options to `compile`: a `highlight` function for code blocks (see [Syntax highlighting with Shiki](./2026-11-02-shiki-with-design-tokens)), and a `layout`, a Svelte component every file is wrapped in. The layout brought one more piece of Svelte 4 syntax, `{...$$props}`, which runes mode doesn't allow, so a second `replace` removes it. My layout swaps every link for a component that knows the base path: [Markdown links that know the base path](./2026-11-02-markdown-links-with-an-mdsvex-layout).

## One page per file

The page lives in `src/routes/bitacora/[slug]/` and is split across two load files.

`+page.server.ts` runs only at build time. It lists the pages to prerender and finds the entry's frontmatter in the same list the home page uses:

```ts
export const entries: EntryGenerator = () => allLog.map(({ slug }) => ({ slug }));

export const load: PageServerLoad = ({ params }) => {
	const entry = allLog.find(({ slug }) => slug === params.slug);
	if (!entry) error(404, 'No Bitácora entry with that name');
	return { entry };
};
```

The prerenderer only finds pages that something links to. Nothing linked to an entry yet, so without `entries()` the build made none of them.

`+page.ts` adds the body. It has to be a universal load because server data is saved as JSON next to the page, and a component is a function, which JSON can't hold:

```ts
const bodies = import.meta.glob<Component>('/content/bitacora/*/*.md', { import: 'default' });

export const load: PageLoad = async ({ data, params }) => ({
	...data,
	Body: await bodies[`/content/bitacora/${params.slug}/${params.slug}.md`]()
});
```

The glob isn't eager: each value is a function that imports one file. Every entry gets its own small JS chunk, and the browser only downloads the one it shows.

**Update:** an entry can now be in two files, English and Spanish, so the server load picks the file for the page's language and the body comes from it: `bodies[data.entry.path]()`.

<!-- TODO: what I saw in the Network tab moving between two entries -->

The page renders `<Body />` under a header with the date, title and tags.

## A type that broke

Adding `[slug]` broke `pnpm check` in four components. They all called `resolve(link.route)` with a route typed as `RouteId`, and `RouteId` now includes `'/bitacora/[slug]'`, which `resolve()` can't build without a slug. Those links never point to a route with a parameter, so I said that in the type, with a template literal type:

```ts
export type RouteWithoutParams = Exclude<RouteId, `${string}[${string}`>;
```

Any route id with a `[` in it is left out.

## Links

- [mdsvex docs](https://mdsvex.com/docs)
- [Vite: plugin ordering](https://vite.dev/guide/api-plugin#plugin-ordering)
- [Vite: glob import](https://vite.dev/guide/features#glob-import)
- [SvelteKit: universal vs server load](https://svelte.dev/docs/kit/load#Universal-vs-server)
- [SvelteKit: entries](https://svelte.dev/docs/kit/page-options#entries)
