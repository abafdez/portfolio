---
title: Live demos, and a sandbox for the CMS preview
date: 2026-11-27
phase: 12
tags: [mdsvex, svelte, cms, security]
---

## What we did

- **Code blocks that run.** ` ```svelte run ` makes the block a module the page imports; `markdown/Pre.svelte` draws its component above its code, in a region named "Live demo". A ` ```ts run ` block's default export is called and its result shown; `run=client` waits for a "Run the demo" button. `:::demo[Title]` frames a demo in a window.
- The demo and its code block share a frame outside the `<figure>`: Svelte's accessibility check said a `<figcaption>` must stay first or last. Plain code blocks keep exactly their old markup.
- **In the CMS preview, demos run in a sandbox.** Each demo's module is `SandboxDemo.svelte`, which compiles the demo and posts the JavaScript to `<iframe sandbox="allow-scripts">` loading `demo.html`; the page inside mounts it with its own copy of Svelte and sends back its height and any error. Script blocks don't run there; a line says so.
- `cms/blob-modules.ts` holds the import rewriting the preview and the frame share. The runner page is a second input of the CMS build; `scripts/serve.ts` sends `Access-Control-Allow-Origin: *` like GitHub Pages.
- Tested: a hostile demo in the preview got `SecurityError` reading `localStorage`, `parent.document` and `document.cookie`, and navigating `top`; the counter demo worked in its frame; the built runner worked from an opaque origin too. A draft post tells the story, in both languages.

## What I learned

- `sandbox="allow-scripts"` without `allow-same-origin` gives the frame an **opaque origin**: no storage, no cookies, no access to the page around it, and no navigating the tab (Chrome logs "Unsafe attempt to initiate navigation").
- An opaque origin sends `Origin: null`, and module scripts are fetched with CORS, so the server has to allow it. GitHub Pages already sends `*`; Vite's dev server needed `'null'` in `server.cors`.
- `postMessage` from a frame's code goes to whichever window you call it on, and `event.source` is the window whose code sent it, not the frame that holds the element.

## Problems & fixes

- The first sandbox ran nothing: Sveltia draws its preview in a frame of its own, so the CMS's code (in the top window) sent the demo, not the frame's `parent`, and the runner ignored it; its answers went to `parent`, where nobody listened. It now accepts its parent or the top window and answers whichever asked.
- An `{#if}` on its own line added a whitespace node to every code block; the demo now lives outside the figure, so nothing changed for plain blocks.

## Links

- [mdsvex: code that runs](https://mdsvex.pngwn.at/docs/reference/code-that-runs)
- [MDN: iframe `sandbox`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe#sandbox)

## Next

- The braces post (what `{ }` could do, kept banned), then page-data and an RSS feed.
