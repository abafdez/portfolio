---
title: Markdown drawn by my own Svelte components
date: 2026-11-11
tags: [markdown, svelte, sveltekit, performance]
description: I replaced mdsvex with svelte-markdown. Posts are rendered on the server by my own components, the CMS preview mounts the same ones, and every page got lighter.
---

My posts are markdown files. Until now, [mdsvex](./2026-10-31-markdown-with-mdsvex) turned each one into a Svelte component at build time, and a stack of plugins around it added what my site needs: callouts, code-block components, Shiki, linked headings, optimised images. It worked, but it had grown hacks: a Vite plugin to run before enhanced-img, a rewrite of the Svelte 4 syntax mdsvex still writes, regexes over its HTML for images, and a second, slightly different pipeline for my CMS's preview.

So I tried [svelte-markdown](https://markdown.svelte.page): marked turns markdown into tokens, and Svelte components draw them, one per kind of element. You can give it your own components, which is the whole point.

## Compare before you switch

Before changing anything, I rendered all 262 posts and Devlog entries with svelte-markdown and compared them with the mdsvex build, block by block: text, inline markup, heading ids, links, images, code. Ignoring curly quotes (mdsvex adds them; I decided to show the text as typed), 234 were identical. The rest came down to three things:

- **A bug in svelte-markdown.** Its inline-code component prints the raw markdown with every backtick removed, so code that contains a backtick (a template literal type in one of my posts) lost it. marked's token already has the right text; my own component uses it.
- **A bug in mdsvex.** `` `&rarr;` `` showed an arrow instead of the entity I wrote.
- **My comparison script.**

After the switch, 258 of 262 pages are identical block by block to the old build. The 4 others are that mdsvex bug, fixed.

## My own pass over the tokens

I lex the markdown myself and hand svelte-markdown the finished tokens. That gives me one place, `parse.ts`, to:

- turn `> [!tip]` into a `callout` token (svelte-markdown draws any token type that has a component, and passes the token's fields to it as props);
- turn an image with a caption, alone in its paragraph, into a `figure` token;
- collect the languages of the code blocks and the files the post uses;
- fail the build.

## Strict

Markdown lets you write HTML, and mdsvex passed it through: a made-up tag became an element that never closed, and a real one silently became markup. Now **HTML in a post fails the build**, whatever the tag. Nothing written in a post reaches the page as raw markup: every element comes from one of my components, and what markdown can't say goes in [a fenced block](./2026-11-07-components-in-code-blocks). An image without alt text, or from another site, fails too. All of it is thrown by `parse()`, before anything renders.

## Rendered on the server, shown as HTML

svelte-markdown renders at runtime. If the post page used `<SvelteMarkdown>` directly, the browser would download marked, svelte-markdown, my components, the markdown and Shiki, just to draw HTML the server had already drawn.

So each post page renders it in its server load, with `render()` from `svelte/server`, and shows the string:

```svelte
{#key html}
	<div class="prose" {lang} {@attach copyCode}>{@html html}</div>
{/key}
```

Three things follow from that:

- **A component can't wait while it renders.** Shiki loads languages asynchronously, and images are imported. So `parse()` lists both, and they're loaded before `render()`; then highlighting and image lookup are synchronous.
- **A component only the server uses never sends its CSS to the page.** The code block's styles moved to my global stylesheet, under `.prose`, where the callouts' already were.
- **Nothing in `{@html}` is a live component.** The code blocks' copy buttons are in the HTML, `hidden`, and one attachment shows them and handles every click with a single listener on the container. `{#key html}` runs it again when you move to another post.

The body ends up in the page twice: as HTML, and in the data SvelteKit sends for hydration. It's still lighter than before, when the page carried the HTML plus the post as a compiled JavaScript chunk:

| Average, gzipped        | mdsvex  | svelte-markdown |
| ----------------------- | ------- | --------------- |
| First visit to a post   | 11.6 kB | 9.6 kB          |
| Moving to another post  | 4.1 kB  | 3.5 kB          |
| JavaScript in the build | 3.5 MB  | 0.56 MB         |

## The same components in the CMS

My CMS preview used to run a copy of the build's plugins in the browser. Now it [mounts the very same `Markdown.svelte`](./2026-11-10-a-preview-built-from-my-own-build) with the same tokens. The page renders it on the server, the preview runs it in the browser: one parser, one set of components, the same errors.

## Two glob traps

- **`'!/content/**/cover.*'` excludes nothing.** In Vite's `import.meta.glob`, a negative pattern that starts with `/` and has `**` in the middle doesn't apply. My dev server hung reading every cover at full size. `'!**/cover.*'` works.
- **An eager glob inside a dev-only branch still reaches the build.** `import.meta.env.DEV ? import.meta.glob(…, { eager: true }) : {}` becomes imports at the top of the module, outside the branch, and the image plugin writes the drafts' files into the build as it reads them. A lazy glob stays inside the branch, which the build removes.

## Links

- [svelte-markdown](https://markdown.svelte.page)
- [marked: the lexer](https://marked.js.org/using_pro#lexer)
- [Svelte: render on the server](https://svelte.dev/docs/svelte/svelte-server)
- [Svelte: attachments](https://svelte.dev/docs/svelte/@attach)
- [Vite: glob import](https://vite.dev/guide/features.html#glob-import)
