---
title: svelte-markdown instead of mdsvex
date: 2026-11-11
phase: 11
tags: [markdown, svelte, cms, performance]
---

## What we did

- Compared first: rendered all 262 posts and entries with svelte-markdown and diffed every block (text, inline tags, heading ids, links, images, code) against the mdsvex build. Ignoring curly quotes, 234 were identical; the rest were one bug in svelte-markdown (its inline-code renderer deletes every backtick), one in mdsvex (`` `&rarr;` `` showed as an arrow) and my own script.
- Replaced mdsvex everywhere. `src/lib/markdown/parse.ts` lexes with marked and changes the tokens: `> [!type]` becomes a `callout` token, a lone captioned image a `figure`, and it collects the code languages and the files the post uses. Our renderers (heading, code, inline code, image, figure, link, table, callout, ` ```video `, ` ```yt `) replace svelte-markdown's own.
- Each `[slug]` page renders the post on the server (`render()` from `svelte/server` in `+page.server.ts`) and shows the HTML with `{@html}`. The copy buttons are in the HTML, hidden, and an attachment (`copy.ts`) shows them and handles the clicks.
- Strict: HTML written in a post fails the build, real tags too. So do an image without alt text or from another site. Every error is thrown by `parse()`, before rendering.
- The CMS preview mounts the same `Markdown.svelte` live in Sveltia's frame (`cms/markdown.svelte.ts`). `cms/render.ts`, the second pipeline, is gone.
- Removed mdsvex, unified, 7 remark/rehype packages, the `markdown()` Vite plugin, `enhance-media.ts`, `tables.ts`, the rehype callout plugin, `MarkdownLayout`, `MarkdownLink`, the old `CodeBlock` and the `onwarn` exceptions.
- Result: 258 of 262 pages identical block by block to the mdsvex build (the other 4 are mdsvex's entity bug). A blog post's first visit went from 11.6 to 9.6 kB gzipped, moving to another post from 4.1 to 3.5 kB. The build's JS went from 323 files (3.5 MB) to 59 (0.56 MB). Lighthouse a11y, best practices and SEO 100 in both themes, CLS 0.
- Added `parse.test.ts`, `render.test.ts` and `e2e/blog.test.ts` (the copy button works, after client-side navigation too; without JS the post is complete).

- Then the CMS got leaner, which has its own entry: [A leaner CMS](./2026-11-11-a-leaner-cms).

## What I learned

- A component can't wait while it renders. So everything async (Shiki's languages, the post's images) is loaded before `render()`, from lists `parse()` makes.
- A component that only the server renders never sends its CSS to the page. The code block's styles had to move to `global.css`.
- `route()` reads SvelteKit's `page`, which doesn't exist inside a `render()` call in a load function. The renderers get the page's language as a prop instead.
- Rendering on the server and showing `{@html}` means the body is in the page twice (the HTML and the hydration data). That's still less than mdsvex's HTML plus the post's JS chunk.

## Problems & fixes

- The dev server hung on post pages: `'!/content/**/cover.*'` excludes nothing. In Vite's globs, a negative pattern that starts with `/` and has `**` in the middle doesn't apply, so every cover was read at full size. `'!**/cover.*'` works.
- The drafts' images ended up in the build. An eager glob inside `import.meta.env.DEV ? … : {}` becomes imports at the top of the module, and imagetools writes the files as it reads them. A lazy glob stays inside the branch, which the build removes.
- `{@html}` leaves its own hydration marker (`<!--1xwl4yi-->`), which my first regex didn't strip.
- The CMS page hit a `504 Outdated Optimize Dep`: Vite discovered svelte-markdown late and re-bundled it. It's in `optimizeDeps.include` now.
- The live "Real page" tab stopped updating: the page now reads `.preview.md` with `readFileSync`, so Vite doesn't watch it. The CMS's Vite plugin sends a full reload after each write.
- A long inline `code` made two pages scroll sideways at 320 px (in the mdsvex build too). Inline code in `.prose` now breaks anywhere.

## Links

- [svelte-markdown](https://markdown.svelte.page)
- [marked: the lexer](https://marked.js.org/using_pro#lexer)
- [Svelte: render on the server](https://svelte.dev/docs/svelte/svelte-server)
- [Svelte: mount](https://svelte.dev/docs/svelte/imperative-component-api#mount)
- [Svelte: attachments](https://svelte.dev/docs/svelte/@attach)
- [Vite: glob import](https://vite.dev/guide/features.html#glob-import)

## Next

- Decide whether this merges.
- Check the CMS preview by hand (Sveltia's local-repository mode needs a folder picker the tests can't drive).
