---
title: Callouts that read well everywhere
date: 2026-11-07
tags: [markdown, accessibility, sveltekit]
description: GitHub and Obsidian both draw "> [!note]" as a callout box. A small rehype plugin makes my site draw it too, and it's still a plain blockquote anywhere else.
cover: Markdown callout syntax turning into note, warning and tip boxes.
---

I wanted boxes in my posts: a tip, a warning, a "careful, this breaks on GitHub Pages". There are two ways to get them, and only one of them still reads well when the markdown isn't on my site.

## One syntax, three places

I write my posts in Obsidian, they sit on GitHub, and they're published here. GitHub ("alerts") and Obsidian ("callouts") already agree on a syntax: a blockquote whose first line is `[!type]`.

```md
> [!tip]
> Test the production build, not dev: dev has no base path.
```

Which comes out as:

> [!tip]
> Test the production build, not dev: dev has no base path.

Anywhere that doesn't know the syntax, a plain editor or another markdown site, it's a blockquote with `[!tip]` on its first line. Still readable. The other common syntax, `:::tip`, shows the colons on GitHub and in Obsidian.

GitHub has five types: `note`, `tip`, `important`, `warning` and `caution`. Obsidian also lets the rest of the first line be a title:

```md
> [!warning] Not on GitHub Pages
> It can't set headers, so every file is cached for ten minutes.
```

> [!warning] Not on GitHub Pages
> It can't set headers, so every file is cached for ten minutes.

## Where the plugin runs

mdsvex turns a post into a Svelte component in steps: markdown text → a markdown tree → an HTML tree → Svelte code. A plugin can change either tree: **remark** plugins work on the markdown tree, **rehype** plugins on the HTML one.

There are remark plugins for callouts, but mdsvex 0.12 bundles an old markdown parser and they don't run on it. The HTML tree, though, looks the same in every version, so mine is a rehype plugin, like the `rehype-slug` I already use for heading ids.

By the time it runs, `> [!tip]` is already this:

```html
<blockquote>
	<p>[!tip] Test the production build…</p>
</blockquote>
```

So the plugin looks for blockquotes whose first paragraph starts with `[!type]`, and turns them into an `<aside>`: the type (or the custom title) first, then the rest.

> [!note] A surprise in the tree
> The old parser reads `[!tip]` as a link to a reference called `!tip`. There's none, so it puts the text back, but as a text node of its own. The plugin joins the text at the start of the paragraph before looking at it.

## Not colour alone

Each type has a colour, but colour can't be the only way to tell them apart: someone who doesn't see it, or a screen reader, gets nothing. So the box always says its type in words, "Tip", and has an icon too. With a custom title the type is still there, as visually hidden text before it: a screen reader reads "Warning: Not on GitHub Pages".

The five colours are tokens (`--callout-tip`…), from the same steps as my code colours, so they already pass 5.3:1 on the box's background in both themes.

## A wrong type fails the build

Obsidian has more types than GitHub (`info`, `bug`, `quote`…). On GitHub those show as plain blockquotes, so I'd rather know: `> [!info]` fails the build, naming the file and listing the five types.

> [!caution]
> A blockquote that really starts with `[!something]` can't be written any more. I haven't needed one yet.

## Links

- [GitHub's alerts](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#alerts)
- [Obsidian's callouts](https://help.obsidian.md/callouts)
- [rehype](https://github.com/rehypejs/rehype) and the [HTML tree it works on (hast)](https://github.com/syntax-tree/hast)
