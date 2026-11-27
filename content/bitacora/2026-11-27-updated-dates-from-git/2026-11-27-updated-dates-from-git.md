---
title: Updated dates from git, and page-data explored
date: 2026-11-27
phase: 12
tags: [mdsvex, seo, git]
---

## What we did

- **Explored mdsvex's page-data plugin** against every post: its reading time matched ours on 121 of 175 files (it skips code, ours counts it on purpose), and its excerpt found nothing for the 94 Devlog entries (they start with a heading and a list; it only takes a first paragraph). So our own reading time and summaries stay.
- What it adds is **when a post last changed**. I picked git as the source over a hand-written `updated:` field.
- With page-data's `last_modified: 'git'` on, a post using `:::steps` didn't build: `"steps" is not exported`, a clash between a static directive and a plugin that defers work, fixed on mdsvex's main branch and not released yet. So we read git ourselves: `src/lib/git-dates.server.ts`, one `git log` when the build starts.
- Every post and entry has an `updated` date (each language's file its own). The header shows "updated 2026-11-27" when that's after the post's date, the page gets `article:modified_time`, and the sitemap's `<lastmod>` is the latest of either language. CI fetches the whole history (`fetch-depth: 0`).

## What I learned

- `git log --name-status -M` says how each file changed: `R100` is a rename that changed nothing. The first count dated 48 posts to 2026-11-18, the day they all moved into one folder; skipping pure renames and carrying dates across them fixed that.
- Git dates count every commit: 27 posts now show 2026-11-10, a formatting pass. A list of commits to skip (like `.git-blame-ignore-revs`) would leave those out.

## Problems & fixes

- `ArticleHeader` runs in the browser, so the date helper lives in its own file (`content-dates.ts`) instead of `content.ts`, which imports every post's text.

## Next

- An RSS feed, with these dates as each item's updated time.
