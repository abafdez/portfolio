---
title: Back to mdsvex, and this time I measured first
draft: true
date: 2026-11-26
tags: [markdown, mdsvex, sveltekit, testing]
description: Two weeks after leaving mdsvex for svelte-markdown, mdsvex 1.0 came out and I moved back. I only switched once every blog and Devlog page, in both languages, matched the old build block by block. Here's what changed, and the two things a compiled post forced me to rethink.
---

On 2026-11-11 I [replaced mdsvex with svelte-markdown](/blog/2026-11-11-markdown-drawn-by-my-own-components): mdsvex 0.12 clashed with enhanced-img, shipped more JavaScript per post, and I wanted the markdown drawn by my own components. A week later mdsvex 1.0 came out, a rewrite with its own parser, its own highlighter and a plugin system. The reason to look again wasn't any of the old problems. It was that I want **components and live demos in my posts**, and svelte-markdown can't give me that: it draws markdown, it doesn't compile it.

Moving a site's posts twice in a month only makes sense if nothing gets lost on the way. So the rule for this spike was simple: no switch until the new build matched the old one.

## Measuring "nothing lost"

I built the `main` branch in a separate git worktree, so I always had the old pages to compare against. Then a script read every blog post and Devlog entry from both builds, in English and Spanish, and compared the body block by block: the tag, the text without whitespace, the heading ids, every link's target and `rel`, every image's alt text, and which inline tags appeared.

The first try matched 69 of 72 English posts. The last one matched **158 of 158 pages in English and 158 of 158 in Spanish**. Everything in between was a difference the script found and I fixed, and some of them I'd never have spotted by eye.

## A slightly different markdown

mdsvex 1.0 reads its own dialect, [Penguin-Flavoured Markdown](https://github.com/pngwn/MDsveX/blob/main/PFM.md): CommonMark with the ambiguous parts taken out. A few rules differ from what GitHub and Obsidian do:

- `_text_` is italic and `*text*` is bold. `**text**` is bold inside bold: it looks the same, and it's on purpose. My files already use `_` and `**`, because Prettier rewrites `*text*` to `_text_` when it formats them, so they read the same everywhere.
- Bare URLs stay text; a link is written `<https://…>`.
- A brace is a Svelte expression: `{1 + 1}` in a sentence prints `2`. My posts are text, so a brace outside backticks now fails the build (more on why below).

And one bug: a mark that never closes inside link or image text cancels the whole link. `[~/dir](https://example.com)` came out as the raw text, because `~` starts a subscript. In a sentence a lone `~` is fine. One screenshot's alt text hit it; writing `\~`, a standard escape that GitHub and Obsidian show as `~`, fixed it.

## My rules as parse plugins

With svelte-markdown, my own pass over marked's tokens turned `> [!tip]` into a callout, a lone captioned image into a figure, and stopped the build on HTML in the text. mdsvex has [parse plugins](https://mdsvex.pngwn.at/docs/plugins/writing/parse-plugins) for that: handlers keyed by node type, which can return a function that runs once the node has closed, when everything inside it is known.

```ts
// An image is a file next to the post, with alt text: anything else fails the build.
function checkImage(node: NodeView, ctx: Context) {
	return () => {
		const src = String(node.attrs.src ?? '');
		if (!src.startsWith('./'))
			throw new Error(`${ctx.filename}: ${src} should be a file next to the post (./…)`);
		if (!node.text_content.trim())
			throw new Error(`${ctx.filename}: ${src} needs alt text: ![What it shows](${src})`);
	};
}
```

The callout took three tries. A plugin can't replace a node's attributes object, only change it key by key. A new element I invented got no props from mdsvex. What worked: keep it a blockquote, add `kind`, `title` and the file to its attributes, and let my blockquote component decide whether to draw a callout box or a plain quote.

## A compiled post changes two things

Before, the server turned each post into HTML and the page inserted it. Now each post is a Svelte component, loaded by the page and running in the browser too. Two things I took for granted stopped working.

**Links can't know the language when the post is compiled.** On the Spanish site, `[my CV builder](/projects/cv)` has to lead to `/es/projects/cv`. svelte-markdown knew the page's language while drawing. But a compiled post is compiled once, and an untranslated post shows its English file on the Spanish page too. So the link component adds the base path and the language when the page shows, reading the page's language from a Svelte context. A context and not the site's usual `getLocale()`, because the CMS preview draws posts without SvelteKit.

**A plugin can't add imports.** My ` ```video ` and ` ```yt ` blocks name files next to the post, and in a build a file has to be an `import` to get its hashed URL. mdsvex imports markdown images itself, but a plugin has no way to add an import of its own. So the blocks plugin writes the files it saw into the post's plugin data, which mdsvex exports from the compiled module, and the page's load function reads that list and loads just those files before the page shows. The components get them through another context.

## The old clash, smaller

mdsvex tells Vite that `.md` files are Svelte files. enhanced-img has a step that parses any Svelte file containing `<enhanced:img`, and its hook is marked `order: 'pre'`, which Vite runs before every hook without an order. mdsvex's hook has none. Four of my posts mention that tag in code examples, so enhanced-img got their raw markdown, parsed it as Svelte and failed.

It's the clash from [when I first used mdsvex](/blog/2026-10-31-markdown-with-mdsvex), and the fix is the same: mdsvex's transform gets `order: 'pre'` too. Among `pre` hooks, mdsvex's plugin goes first (it's `enforce: 'pre'`), so enhanced-img sees the compiled post, where the example is escaped text. mdsvex has no option for that, so a few lines in `vite.config.ts` set it, and I've reported it.

## What I got, and what's next

Today, about the same: identical pages, a first visit a few kilobytes heavier (I'll come back to that), synchronous highlighting with colours in CSS, plugins like external links instead of my own code, and about 300 lines less once the old pipeline was deleted. What I wanted is the next step: components in posts, written as [directives](https://mdsvex.pngwn.at/docs/guides/directives) (`:name[text]` inline, `::name` on a line of its own, `:::name … :::` around a block). GitHub and Obsidian will show them as plain text, which I can live with.

## Links

- [mdsvex 1.0's docs](https://mdsvex.pngwn.at/docs) and [its markdown](https://mdsvex.pngwn.at/docs/learn/markdown)
- [Penguin-Flavoured Markdown](https://github.com/pngwn/MDsveX/blob/main/PFM.md), the spec
- [The post where I left mdsvex](/blog/2026-11-11-markdown-drawn-by-my-own-components)
