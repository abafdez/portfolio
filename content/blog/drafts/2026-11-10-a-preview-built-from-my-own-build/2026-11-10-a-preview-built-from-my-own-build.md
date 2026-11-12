---
title: A CMS preview built from my own build
date: 2026-11-10
tags: [cms, markdown, svelte, vite]
description: My CMS showed a preview of something that wasn't my site. Four tries later, it draws the post with the same Svelte components as the page, in the browser, as I type.
---

My posts are markdown files, and I edit them in [Sveltia CMS](https://sveltiacms.app/en/docs) now. Its preview pane draws the markdown as you type, which is what a preview should do. But it drew something that wasn't my site: no styles, my callouts as plain quotes, my code-block components as YAML.

It took four tries to fix, and each one taught me something about where my site's look actually comes from.

## What a preview has to reproduce

A post on this site went through several steps on its way to HTML. The build ran them in `vite.config.ts`:

1. mdsvex turns the markdown into an HTML tree.
2. Code blocks: if the language is one of my components (` ```yt `, ` ```video `), its YAML becomes that component; anything else is highlighted by Shiki, with my own colour theme.
3. rehype plugins change the tree: `> [!tip]` becomes a callout box, wide tables get a scroll box, headings get ids and links to themselves.
4. enhanced-img turns `![alt](./diagram.png)` into AVIF and WebP pictures with their size.
5. The page wraps it all in the site's header, styles and layout.

Sveltia's preview does none of that, and it can't: those steps are mine.

## Try 1: the real page, as last saved

The simplest exact preview is the page itself. The dev server already renders every post, so the preview pane became an iframe of `/blog/<slug>`, reloaded after every save.

It was exact, but it only showed saved files. You'd type, save, look, type again. That's not a preview, it's a second tab.

## Try 2: the real page, live

To show unsaved text, the page needs it as a file. So, as I typed, the CMS sent the entry to the dev server, which wrote it to a hidden file next to the post, `.preview.md`. The post page, opened with `?preview`, rendered that file instead. Its images still worked, since it's in the same folder, and a name that starts with a dot matches none of my content globs, so it never turned into a post of its own.

Two things went wrong on the way:

- **SvelteKit refuses `url.searchParams` on a prerendered page, even in dev.** My pages are all prerendered, so these two are now prerendered only in the build: `export const prerender = !import.meta.env.DEV`.
- **The whole CMS reloaded every time I typed, losing my edits.** Vite tells every page that runs its live-reload client to reload when a markdown file changes. The CMS page had that client too, brought in by a Svelte component of mine. Compiling the CMS's components without hot reload keeps it out.

It worked, but every pause in the typing reloaded the whole page, with a flash. And it only works while the dev server runs. Later I want to use the CMS from anywhere, against the GitHub repo, with no dev server at all.

## Try 3: my build's plugins, in the browser

Looking at the list above again, most of those steps are small functions I wrote myself, in `src/lib`. A rehype plugin is a function that gets an HTML tree and changes it. My code-block components have a `render()` that returns HTML. Shiki runs in the browser. None of them need a server.

So the CMS imports the same files the build imports and runs them on the text as I type:

```ts
export async function renderMarkdown(markdown: string, file: string) {
	const tree = await toTree.run(toTree.parse(markdown)); // markdown → HTML tree
	await highlightAll(tree, file); // my blocks, then Shiki with my theme
	const done = await plugins.run(tree, { filename: file }); // callouts, tables, heading links
	return toHtml.stringify(done);
}
```

`file` is the post's file name. My plugins read it to pick a language: a callout in `<slug>.es.md` is titled "Sugerencia", not "Tip". The same goes for the blocks' text.

The rest is getting it to look like the page:

- **The site's CSS goes into the preview frame.** The frame is a separate document, so the page's styles don't reach it. Vite can import a stylesheet as a string (`?inline`), and Sveltia takes a string of CSS for its preview (`registerPreviewStyle`). The fonts needed one more fix: the frame is a `blob:` document, where a URL like `/node_modules/…` has nothing to resolve against, so they're made absolute.
- **The header** (date, reading time, title, tags, cover) is drawn from the form's fields, and the body from `renderMarkdown()`, about 150 ms after I stop typing. No reload, no flash, and the scroll position stays.
- **Images** are written `./diagram.png` in the post. Sveltia's `getAsset()` turns that into a URL the frame can show. While it's still reading the file it answers with an empty one, so the paths are looked up again every time the preview redraws.
- **Errors** show up early. A code block with a wrong field throws the same error the build would, and the preview shows it before I save.

It was close, but it was a copy of the build, not the build. mdsvex parsed markdown with an older parser than the preview's and turned quotes into curly ones, and the preview had its own idea of what a code block's frame looks like. Two pipelines that agree today can drift tomorrow.

## Try 4: the same components, mounted live

Then I replaced mdsvex with [svelte-markdown](https://markdown.svelte.page): marked turns the markdown into tokens, and Svelte components draw them, one per kind of element, and I can give it my own. On the site, each post page renders those components to HTML on the server and shows the string. There's no build step for markdown any more, so the CMS can run exactly the same thing.

The preview parses the text with the site's own `parse()`, loads the code's languages for Shiki, and mounts the site's own `Markdown.svelte` into the preview frame. Sveltia draws its preview with React, so a small React component gives Svelte an element to mount into, and hands over new props when they change:

```ts
let current = $state.raw(props); // the tokens are replaced whole, never edited
update.current = (next) => (current = next);
mount(Markdown, {
	target: target.current!,
	props: {
		get tokens() {
			return current.tokens;
		}
		// file, locale, highlighter and media the same way
	}
});
```

`$state.raw`, because a post is thousands of tokens and they're only ever replaced: there's nothing inside them for Svelte to watch.

- **One parser, one set of components.** The callout box, the code block's frame, the ` ```yt ` card: the page and the preview get them from the same `.svelte` files. A new block shows up in both because there's only one of it.
- **Errors come from the same place.** `parse()` throws everything the build stops on: HTML in the text, an unknown callout type, a block with a wrong field, an image without alt text. The preview shows that message instead of the post.
- **Images** go through an interface: the renderers ask "where is `./diagram.png`?", and the build answers with its optimised pictures while the preview answers with `getAsset()`.
- **Vite found svelte-markdown late.** The preview first used it after the page had loaded, Vite re-bundled it, and the page broke with a `504 Outdated Optimize Dep`. Listing it in `optimizeDeps.include` bundles it when the dev server starts.

## What it can't do, and what's kept

Pictures in the preview are the files as they are: enhanced-img's AVIF and WebP copies only exist in the build. That's all. With the page's own components in the preview, the live page from try 2 had nothing left to show me but the site's header and layout, so I removed it, and with it the endpoint that wrote the hidden file, the hidden files themselves and the `?preview` branches in my pages.

## What I'm taking from this

Try 3 worked because the build's steps were small functions in their own files. Try 4 is better because there's no copy at all: the preview isn't "like the page", it's the page's own code, running somewhere else. And for posts and entries, it let me delete tries 1 and 2.

## Links

- [Sveltia CMS: custom preview templates](https://sveltiacms.app/en/docs/api/preview-templates)
- [Sveltia CMS: custom preview styles](https://sveltiacms.app/en/docs/api/preview-styles)
- [svelte-markdown](https://markdown.svelte.page)
- [Svelte: mount](https://svelte.dev/docs/svelte/imperative-component-api#mount)
- [Svelte: $state.raw](https://svelte.dev/docs/svelte/$state#$state.raw)
- [Vite: importing CSS as a string with `?inline`](https://vite.dev/guide/features#disabling-css-injection-into-the-page)
- [Shiki in the browser](https://shiki.style/guide/install)
