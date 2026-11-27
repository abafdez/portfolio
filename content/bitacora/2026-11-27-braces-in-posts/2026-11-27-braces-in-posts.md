---
title: Braces in posts, shown as code in the preview
date: 2026-11-27
phase: 12
tags: [mdsvex, cms, security]
---

## What we did

- **A plain `{expression}` is allowed in posts again.** It runs when the site is built and again in the reader's browser, and sees the frontmatter as `metadata`: `{metadata.title}: {6 * 7} posts` prints "Braces: 42 posts".
- **The CMS preview never runs it.** A preview-only parse plugin (`cms/preview-braces.ts`) turns each expression into inline code showing its source. Checked in the real preview: an expression that reads the token's storage shows as code and runs nothing.
- **Svelte blocks and tags still fail the build**, now naming them: `{#if}` (in markdown a block can swallow the paragraphs after it), `{@html}` (it would slip HTML past the no-HTML rule), `{@const}`, `{@debug}`.
- Docs and the posts that described the ban (the preview draft, the publishing guide, two Devlog entries) updated; the board card is done.

## What I learned

- The preview isn't sandboxed: Sveltia's preview frame has the CMS's origin, and the post is mounted by the CMS's own code. Only the demos run in a sandboxed frame. So "show the source" was the safe way to allow braces.
- mdsvex has three kinds of brace nodes: `mustache` (`{expr}`), `svelte_block` (`{#if}`) and `svelte_tag` (`{@html}`). The first ban covered only two of them.

## Problems & fixes

- `{@html …}` passed yesterday's ban unnoticed: it's a `svelte_tag`, and only `mustache` and `svelte_block` were checked. It fails the build now.

## Next

- Page-data, then an RSS feed.
