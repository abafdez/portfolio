---
title: Components in code blocks
date: 2026-11-07
tags: [markdown, sveltekit, video]
description: A code block whose language is a component name, with YAML inside, becomes that component on my site. Everywhere else it's a readable block of YAML. And the build checks every field.
cover: A code block with a component tag flowing through a cube into a chart preview.
---

My posts needed a video, and markdown has no syntax for one. I could write the HTML, and I did for a while, but six attributes and two `<source>`s in the middle of my prose read badly in Obsidian and on GitHub. So now a video looks like this:

````md
```video
src: ./awesome-filter.webm
width: 960
height: 540
caption: Typing in the search box filters the list as you type.
```
````

And on this site, it comes out as:

```video
src: ./awesome-filter.webm
width: 960
height: 540
caption: Typing in the search box filters the list as you type.
```

In Obsidian or on GitHub it's a code block of YAML: five lines anyone can read.

## Why a code block

I wanted a syntax that every markdown tool already handles, and fenced code blocks are the one thing they all agree on. The text after the three backticks is meant to be the language, and nothing stops it from being `video`. Tools that don't know it show the block as plain text, which is fine, because YAML is readable as plain text.

The other common way, directives (`::video{src=…}`), needs a newer markdown parser than mine, and Obsidian and GitHub show the colons and braces as they are.

## The hook was already there

My site highlights code at build time: mdsvex calls a `highlight` function for every code block, with the code and its language. So that's where the components go. Before highlighting, the function asks a small registry whether the language is one of my components:

```ts
async function highlight(code: string, lang: string | null | undefined, file: string) {
	const component = renderBlock(lang, code, file);
	if (component !== undefined) return component;
	// …otherwise, highlight it with Shiki as before
}
```

Each component in the registry lists its fields and has a `render()` that returns markup. The video's is plain HTML: the same `<video>` I used to write by hand, with every attribute I'd otherwise forget (`controls`, `muted`, `playsinline`, `preload="metadata"`). A component that needs JavaScript could return a Svelte component instead.

## The build checks the YAML

A typo in a code block is easy to miss: it would just show the wrong thing, or nothing. So the build reads the YAML and fails, naming the post, when:

- a required field is missing (a video without `height`: the page would jump when it loads),
- there's a field the component doesn't have (`autoplay: true` fails, on purpose),
- a value is the wrong kind (`width: wide`, or a file without `./` in front).

````text
post.md: the ```video block has no "autoplay" field. Its fields: src, webm, poster, width, height, caption
````

The `./` files go through the same step as images: each becomes an import, so a missing file fails the build too, and the real one gets a hashed name.

**Update (2026-11-11):** mdsvex is gone. The blocks, their fields and their checks are the same (`blocks.ts`), but they're drawn by real Svelte components now: a `code` renderer for svelte-markdown hands ` ```video ` and ` ```yt ` to their components, and the files they name are loaded before the post renders. The CMS preview mounts the same components.

## Links

- [mdsvex: highlighting](https://mdsvex.pngwn.io/docs#highlight)
- [MDN: the video element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video)
- [The yaml package](https://eemeli.org/yaml/)
