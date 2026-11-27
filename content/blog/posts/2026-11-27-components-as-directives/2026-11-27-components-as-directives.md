---
title: Components in my posts, written as directives
date: 2026-11-27
tags: [markdown, mdsvex, svelte, components]
description: "Since my posts are Svelte components, they can hold components too. I write them as directives: a colon, a name and some brackets, no HTML. Keycaps, a section you open, two things side by side, steps, tabs and a table of contents, each one a few lines of Svelte and drawn in the site's own look."
---

My posts are compiled by [mdsvex](https://mdsvex.pngwn.at), so each one is a Svelte component. That was the reason to move back to it: a component can hold other components. The question was how to write them in markdown without writing HTML, which my build refuses in a post.

mdsvex's answer is [directives](https://mdsvex.pngwn.at/docs/guides/directives). A directive is a colon, a name and some brackets, and mdsvex draws it with the component of that name. There are three forms:

- `:name[text]` sits inside a sentence.
- `::name[text]` takes a line of its own.
- `:::name[text]` opens a block that ends at a line of `:::`, with markdown inside.

Arguments go in parentheses after the brackets, `(open=true)`, and reach the component as strings.

::toc[On this page]

## Keys

Press :kbd[Ctrl+Shift+P] to open the command palette, and :kbd[Esc] to close it.

```md
Press :kbd[Ctrl+Shift+P] to open the command palette.
```

The component draws one keycap per key, with the `+` between them as text, so a screen reader and a copy both read "Ctrl+Shift+P". One detail made it more than a component: a component gets the text in the brackets as content to render, not as a string it could split. So my plugin reads the text when the directive closes and passes it as a `keys` argument. That's three lines, and it's the kind of thing a plugin is for.

## A section you open

:::details[What happens without JavaScript?]
Nothing changes. It's a native `<details>`: it opens and closes without a line of script, it works with the keyboard, and find in page opens it when the word you search for is inside.
:::

```md
:::details[What happens without JavaScript?]
Nothing changes. It's a native `<details>`…
:::
```

The summary is required. A `:::details` without brackets fails the build, naming the file and the line, like every other mistake in a post.

## Two things side by side

:::compare

### Before

```md
> [!note]
> A callout is a quote with a type.
```

### After

```md
:::details[A callout you open]
A directive with markdown inside.
:::
```

:::

Each heading inside `:::compare` starts a side, and the sides sit next to each other while each has room, then stack on a phone. A heading of another depth stays inside its side. The headings stay headings, with their ids and their links to themselves, so the table of contents above lists them.

## Steps

These come from mdsvex itself, as a plugin. Each heading inside `:::steps` starts a numbered step:

:::steps

### Install the plugins

```sh
pnpm add -D --save-exact @mdsvex/plugin-steps @mdsvex/plugin-tabs @mdsvex/plugin-toc
```

### Add them to the options

`tabs()`, `steps()` and `toc()` go in the `plugins` list, with `css: false` on the first two so they come without their own styles.

### Style them

The site draws them with its own colours, next to the callouts: a frame like a code block's, and the numbers in brand circles.

:::

## Tabs

:::tabs

```sh [pnpm]
pnpm add -D @mdsvex/plugin-tabs
```

```sh [npm]
npm install -D @mdsvex/plugin-tabs
```

:::

A tab group of code blocks is a `:::tabs` around them, each fence named in brackets after its language. The buttons follow the ARIA tabs pattern: arrow keys move between them, and the open one is announced.

## Table of contents

The list at the top of this post is `::toc[On this page]`. It lists the headings of the post, nested, from the ids mdsvex already gives them.

## What GitHub and Obsidian show

A directive is plain text to anything that isn't mdsvex: GitHub and Obsidian show `:kbd[Esc]` with its colon and brackets. The text inside still reads, so a post stays readable there, just without the drawing. That was the price I accepted for components that need no HTML in the post.

## Links

- [mdsvex: directives](https://mdsvex.pngwn.at/docs/guides/directives)
- [mdsvex's plugins](https://mdsvex.pngwn.at/docs/plugins): steps, tabs and table of contents
- [MDN: `<kbd>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/kbd), and nesting it for a key combination
- [MDN: `<details>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/details)
