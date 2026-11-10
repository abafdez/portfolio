---
title: A CMS preview built from my own build
date: 2026-11-10
tags: [cms, markdown, unified, vite]
description: My CMS showed a preview of something that wasn't my site. Three tries later, it runs the same markdown plugins as my build, in the browser, as I type.
---

My posts are markdown files, and I edit them in [Sveltia CMS](https://sveltiacms.app/en/docs) now. Its preview pane draws the markdown as you type, which is what a preview should do. But it drew something that wasn't my site: no styles, my callouts as plain quotes, my code-block components as YAML.

It took three tries to fix, and each one taught me something about where my site's look actually comes from.

## What a preview has to reproduce

A post on this site goes through several steps on its way to HTML. The build runs them in `vite.config.ts`:

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

## What it can't do, and what's kept

It isn't the build. mdsvex parses markdown with an older parser than the preview's and turns quotes into curly ones, and pictures are shown as they are, without enhanced-img. For those, the live page from try 2 stays as a second tab, in dev only.

## What I'm taking from this

The preview became possible because the build's steps were already small functions in their own files, each one tested on its own. Nothing had to be copied: the build and the CMS import the same code, so a new callout type or block shows up in both at once.

## Links

- [Sveltia CMS: custom preview templates](https://sveltiacms.app/en/docs/api/preview-templates)
- [Sveltia CMS: custom preview styles](https://sveltiacms.app/en/docs/api/preview-styles)
- [unified: how a processor runs plugins](https://unifiedjs.com/learn/guide/using-unified/)
- [Vite: importing CSS as a string with `?inline`](https://vite.dev/guide/features#disabling-css-injection-into-the-page)
- [Shiki in the browser](https://shiki.style/guide/install)
