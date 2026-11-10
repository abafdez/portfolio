---
title: A CMS that saves files the way I write them
date: 2026-11-09
phase: 11
tags: [cms, markdown, testing]
---

## What we did

- Compared three ways to get a CMS: build our own, Sveltia CMS or TinaCMS (`design/cms-study.md`). Tina was out: its images must live in `static/`, it has no translations, and its editor drops markdown it doesn't know. Sveltia matched the content as it is, so we tried it on a branch first.
- **Sveltia CMS in dev only**: `cms/plugin.ts` serves it at `/admin/index.html` (`apply: 'serve'`, so the build never has it). It edits the repo's files through the browser's File System Access API; from WSL it works by picking "Linux" in Chrome's folder picker.
- `cms/config.yml`: blog posts, drafts, the Devlog and the Awesome list; `<slug>.md` + `<slug>.es.md` side by side; a new entry starts in English only.
- **Our own file format** (`src/lib/content-files.ts` + Prettier in `cms/formats.ts`): Sveltia's writer turned `tags: [a, b]` into a block list and rewrote quotes, in every file it saved. With ours, a save changes only the lines I edited. `content-files.test.ts` runs every file in `content/` through read → write → Prettier and expects the same bytes back.
- One clean-up, once: 74 titles lost quotes YAML didn't need (`pnpm content:format`, which I can run again after editing by hand in Obsidian).
- **The blocks as editor components**, generated from `blocks.ts` (`cms/components.ts`): ` ```yt ` and ` ```video ` are filled in a dialog and previewed with their own `render()`.
- **Images next to the post**: `media_folder: /content/blog/published/{{slug}}` with `public_folder: .` gives `![alt](./file.png)`, what the build expects.
- **The preview runs the build's own plugins in the browser** (`cms/render.ts`: unified + callouts, tables, heading links, our blocks and Shiki), with the site's CSS, redrawn as I type. It works without a dev server, so it'll work when the CMS talks to GitHub. Sveltia's own preview had no styles, no callouts and no covers.
- **A Real page tab in dev**: the CMS sends the unsaved entry to the dev server, which writes it to a hidden `.preview.md` next to the post (git-ignored); the post page, opened with `?preview`, renders that copy.
- **A cover focal point field** written in Svelte, mounted from the small React component Sveltia asks for (`cms/focal.svelte.ts`). It saves `focus: x% y%`; the site doesn't use it yet. The cover comes from a dev-only route, `/admin/cover/<folder>`.
- The Awesome list's comments moved to `content/awesome/README.md` (a CMS save can't keep them), and the "Color" category became `{ en, es }` like the others.

## What I learned

- A CMS only sees data, not my file. Whatever isn't data (comments, quote style, how a list is written) is decided by its writer, so the writer is what I needed to control.
- The best test for "saving doesn't change anything" is to save every file without editing it and compare bytes. It found the 74 titles in seconds.
- Sveltia's preview pane is a sandboxed iframe: my site's CSS never gets in. Showing the real page from the dev server is simpler than copying the site's styles into it, and a hidden copy of the unsaved entry makes it live.
- A file whose name starts with a dot matches none of my content globs (`*/*.md`), so the preview copy never becomes a post.
- In Sveltia, `media_folder: ''` with a path that ends in `{{slug}}` puts uploads in a `<slug>/` subfolder. Naming the entry's own folder fixes it.
- An on/off switch always writes `true` or `false`; a select can stay empty. That's why `reviewed` is a select: the English file must not have one.

## Problems & fixes

- A `pattern` on a list field checks the whole list, so every tag failed. The build already checks tags, so the list has no rule now.
- Uploading the same picture twice gave the first file's name: Sveltia skips files it already has.
- The first live preview reloaded the whole CMS, losing the edits, over and over: the focal-point component brought Vite's live-reload client into the CMS page, and Vite reloads every page with it when a markdown file changes. Compiling `cms/` components without hot reload and with their CSS inlined (`dynamicCompileOptions`) keeps the client out.
- SvelteKit refuses `url.searchParams` on a prerendered page, even in dev, so the post pages are prerendered only in the build (`prerender = !import.meta.env.DEV`).
- Playwright can't click the native folder picker, so the tests ran on an exact copy of `content/` in the browser's private storage (OPFS), compared byte by byte with the originals.

## Links

- [Sveltia CMS docs](https://sveltiacms.app/en/docs)
- [Sveltia: local workflow](https://sveltiacms.app/en/docs/workflows/local)
- [Sveltia: custom file formats](https://sveltiacms.app/en/docs/api/file-formats)
- [Sveltia: preview templates](https://sveltiacms.app/en/docs/api/preview-templates)
- [MDN: File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API)

## Next

- Use `focus` in the build, so card thumbnails crop around it instead of the middle.
- Later: the CMS as a standalone site, with a sign-in to GitHub.
