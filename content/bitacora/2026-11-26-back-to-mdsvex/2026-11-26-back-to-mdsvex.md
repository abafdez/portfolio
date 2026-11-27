---
title: Back to mdsvex
date: 2026-11-26
phase: 12
tags: [markdown, mdsvex, sveltekit, testing]
---

## What we did

- **Posts and Devlog entries are compiled by mdsvex 1.0 again** (two weeks after svelte-markdown replaced 0.12). The reason: components and live demos in posts, which svelte-markdown can't do.
- **No switch until nothing was lost:** `main` built in a separate worktree, and a script compared every blog and Devlog page of both builds, English and Spanish, block by block (text, heading ids, links and `rel`, alt texts, inline tags). Final result: 158 of 158 in each language.
- **Our rules as parse plugins** (`src/lib/markdown/plugins.ts`): callouts (a marked blockquote that our component draws as a callout), figures, the file on tables, and what fails the build: HTML, `{ }`, an image that isn't a `./` file with alt text.
- **Links follow the page's language at run time** (`Link.svelte`, reading a context): one compiled post serves both languages. `@mdsvex/plugin-external-links` adds `rel="external"`.
- **The `video` and `yt` blocks** are a plugin bundle that claims their fences and turns each into a component. A plugin can't add imports, so the block's files go into the post's plugin data and the page loads them.
- **svelte-markdown is gone** (marked, the old parse and render code, the old preview), everything is in one folder, `src/lib/markdown/`, and the tests are new: markdown written to a temporary file, imported through the real mdsvex plugin and rendered with `svelte/server`.
- Small commits on `feat/mdsvex`, each one checked on its own (install, types, tests).

## What I learned

- mdsvex reads Penguin-Flavoured Markdown: `_x_` is italic, `*x*` bold, `**x**` bold inside bold (on purpose); bare URLs stay text; a brace is Svelte. Prettier already writes `_` and `**`, so Obsidian's Ctrl+I can't reach the site as bold.
- A plugin can change a node's attributes key by key, not replace them; attributes become props only on elements mdsvex replaces.
- Generating the intermediate lockfiles from the final one keeps every commit's dependencies the versions we tested.

## Problems & fixes

- enhanced-img parsed the raw markdown of posts that mention `<enhanced:img>` in code (its step runs before every plugin): a wrapper makes it skip `.md` files.
- A mark that never closes inside link or image text cancels the link (`[~/dir](…)`): an mdsvex bug; `\~` fixed our one case.
- A callout's custom title keeps only its text now (no post uses markup there).

## Links

- [mdsvex 1.0](https://mdsvex.pngwn.at/docs), [Penguin-Flavoured Markdown](https://github.com/pngwn/MDsveX/blob/main/PFM.md)

## Next

- Components in posts as directives (`:name`, `::name`, `:::name`), starting with the first-party plugins.
- Report the bugs upstream; mdsvex 1.1.0 once pnpm allows it.
