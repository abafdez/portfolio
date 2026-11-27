---
title: A CMS preview that compiles Svelte in the browser
draft: true
date: 2026-11-26
tags: [cms, svelte, mdsvex, security]
description: "Once my posts became Svelte components, the CMS preview had nothing to mount until the post was compiled. So it compiles it, in the browser, the way the build does: mdsvex, then Svelte's compiler, then a module whose imports point at the CMS's own copies. All 72 posts preview exactly as the site shows them."
---

My CMS, [Sveltia](https://sveltiacms.app), shows a preview next to the editor. Until now it mounted the site's own markdown component in that pane, so what I saw while typing was drawn by the same code as the page. Then I moved my posts to [mdsvex](https://mdsvex.pngwn.at) 1.0, where each post is compiled into a Svelte component, and the preview had a problem: there's no component to mount until the post is compiled.

This was the question that could have ended the switch. If the preview couldn't follow, I'd have stayed where I was.

## Compiling in the browser

Two pieces make it possible. `mdsvex/compile` has no Node imports, so it runs in a browser. And Svelte's compiler runs in a browser too: it's what the [Svelte playground](https://svelte.dev/playground) uses. So the preview does what the build does, about 150 ms after I stop typing:

```text
markdown --mdsvex compile()--> Svelte source --svelte/compiler--> a JS module --> mount()
```

The options come from one file both use, so the build and the preview can't drift apart: heading ids, my parse plugins, the plugin for external links, the highlighter with the same languages.

## Imports a browser can't resolve

The compiled module starts like any compiled component:

```js
import * as $ from 'svelte/internal/client';
import { h2 as H2_MDSVEX_G, pre as Pre_MDSVEX_G } from 'preview:components';
```

In a build, Vite resolves those names. In the browser, a module loaded from a string has nobody to ask. And it must not get its own copy of Svelte anyway: the module has to use the same Svelte runtime as the CMS that mounts it.

So for each name it may import, the preview makes a tiny module that hands out the CMS's own copy:

```js
const m = globalThis.__previewModules['svelte/internal/client'];
const v0 = m['mount'];
const v1 = m['await'];
export { v0 as 'mount', v1 as 'await' /* …every export */ };
```

The exports go through local variables because one of Svelte's runtime functions is called `await`, and `export const { await }` isn't valid JavaScript. That was the first error I hit. Each of those modules becomes a `blob:` URL, the import statements at the top of the compiled code are rewritten to point at them, and the result is loaded with `import()`. Only the statements at the top: a post about imports has the same words in its code blocks further down.

One more surprise: Svelte refuses `import 'svelte/internal/client'` inside a `.svelte.ts` file. It's private and changes without notice. A plain `.ts` file can import it. The compiler and the runtime come from the same package, so they always match; the risk is Svelte closing that door one day, which seems unlikely while its own playground needs it.

## Files and language from the CMS

On the site, an image next to the post is an import, and the language of links comes from the page. In the preview, files come from Sveltia (`getAsset()`, which answers with an empty URL while it reads a file), and the language is the file's. Both reach the post's components through Svelte contexts, which `mount()` accepts, so the same components serve the page and the preview.

## Exactly the same, measured

With Sveltia's test backend, a script pasted each of my 72 published posts into a new entry and compared the preview with the built page, block by block and token by token in every code block: **72 of 72 identical.** A warm compile takes about 6 ms, 45 ms at worst.

Mistakes show before saving, as "The build would stop here": an unknown callout type, HTML in the text, a block with a misspelled field.

## Braces run on the site, not in the preview

In mdsvex, `{…}` in a sentence is a Svelte expression, and the preview _runs_ what it compiles. That's harmless in a build. In the CMS, it would run in the page where my GitHub token is stored: a post someone sent me, opened in the editorial workflow, could read it. At first I banned braces outright. Now a plain expression is allowed in a post, and the preview shows it as code, its source, instead of running it: `{metadata.title}` reads `metadata.title` while I write, and the title on the site. Svelte's blocks and tags (`{#if}`, `{@html}`) still fail the build and the preview alike, like HTML.

## The cost

About 490 kB gzipped more than the old preview: Svelte's compiler, mdsvex's compiler and its grammars. Only whoever opens the CMS downloads it, once, in a CMS that weighs 23 MB already. Visitors never see any of it.

## Links

- [mdsvex's compile](https://mdsvex.pngwn.at/docs/reference/compile)
- [Svelte's compile and mount](https://svelte.dev/docs/svelte/svelte-compiler)
- [Sveltia CMS](https://sveltiacms.app)
