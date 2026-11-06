# Publishing a post

Posts start in `../drafts/`, which only exists in dev. Publishing one is a move:

```sh
git mv content/blog/drafts/<slug> content/blog/published/
```

## The folder

One folder per post, named like its markdown file, with the post's images next to it:

```text
published/
  2026-10-20-sveltekit-3-github-pages-workflow/
    2026-10-20-sveltekit-3-github-pages-workflow.md
    cover.png
    workflow-run.png
```

- The name is the URL: `/blog/2026-10-20-sveltekit-3-github-pages-workflow`. Write it as `YYYY-MM-DD-a-few-words`, lowercase, words joined by `-`.
- The folder and the file must have the same name, or the build fails. Rename both, or neither.
- Once a post is published, don't rename it: the old URL would stop working, and links to it with it.

## Frontmatter

```yaml
---
title: Deploying SvelteKit 3 to GitHub Pages, step by step
date: 2026-10-20
tags: [sveltekit, github-actions, github-pages, ci]
description: One or two sentences for search results and link previews, up to 160 characters.
cover: What the cover image shows, for people who can't see it
---
```

| Field         | Required          | Notes                                                                                                |
| ------------- | ----------------- | ---------------------------------------------------------------------------------------------------- |
| `title`       | yes               | The `<h1>`, the card, the browser tab and the link preview.                                          |
| `date`        | yes               | `YYYY-MM-DD`. Keep the draft's, or use the day it goes live.                                         |
| `tags`        | no                | Lowercase, words joined by `-` (the build checks). Reuse the tags on `/blog` before making new ones. |
| `description` | yes               | Shown under the title, on the card, in search results. Search engines cut at about 160 characters.   |
| `cover`       | with a cover file | The cover's alt text. Only together with `cover.png` (the build checks both ways).                   |

**Quote a value that contains `: ` (colon and space)**, or YAML reads it as a new field and the build fails (the error names the file): `description: "Two things: this and that."`. A value with a `'` inside is easiest in double quotes.

## Images

Put them in the post's folder. The build turns each one into AVIF and WebP copies at the sizes the page needs, with width and height set (so the page doesn't jump while they load). Commit a good-quality original at the size below; don't make small versions yourself.

### The cover (optional)

- **File:** `cover.avif`, `cover.png`, `cover.jpg` or `cover.webp`, exactly that name. One per post.
- **Size:** 16:9, **1600 × 900** (at least that; larger is fine, it's scaled down).
- **The middle matters most.** Cards show a square cut from the middle: for 1600 × 900, that's the middle 900 × 900. Keep the subject and any text inside it; the sides only show at the top of the post and in link previews.
- **Little or no small text.** On a card it's shown at 192 px: small text becomes noise.
- **Both themes.** The same image shows on the dark and the light theme; a mid or dark background sits well on both, a pure white one glares on dark.
- **Alt text** goes in the frontmatter as `cover:`. Say what it shows ("The Actions run page with the build job green and deploy skipped"), not "Cover image of…".
- Without a cover, the card shows a tile with the post's first tag. That's fine for a start.

The cover is used four times: the card's thumbnail (square), the top of the post (16:9), and the link preview on LinkedIn, Slack and the like (a 1200 px JPEG, made by the build).

### Images inside the post

```md
![What the image shows](./workflow-run.png)
![What the image shows](./workflow-run.png 'A caption shown under the image')
```

- **Name:** lowercase, words joined by `-`, saying what it is: `workflow-run.png`, `ruleset-settings.png`. Not `Screenshot 2026-11-06 at 13.42.png` (spaces, and it says nothing).
- **Width:** about **twice the width it's shown at**. The text column is about 740 px wide, so up to about 1500 px wide. Smaller is fine: it's never stretched bigger than the file.
- **Format:** **AVIF** is a good default: the smallest file in git for the same quality. Export it at a **high quality (70 or more)**: the build compresses it again for the page, and a file that's already heavily compressed loses detail twice. **PNG** is fine for screenshots and diagrams (text, flat colours), **JPEG** for photos, WebP too. Not SVG: the image step doesn't handle it yet (ask Claude). Not animated GIF either: only its first frame is kept. Use a video (below).
- **File size:** git keeps every version of every file forever, even after you delete it. Crop to what matters, and keep originals under about 1 MB.
- **Alt text is required**: the build fails without it. It says what the image shows, for someone who can't see it. Don't start with "Image of…".
- **A caption** (the quoted part) is for everyone: context, a source, what to notice. Don't repeat the alt text in it.
- **Screenshots: check for personal data before committing**: open tabs, notifications, email addresses, the CV builder with real details. Once it's pushed, it's public.

### Videos

Markdown has no syntax for video, so write the HTML. Paths start with `./` like images, and the build turns them into real URLs:

```html
<figure>
	<video
		width="1280"
		height="720"
		controls
		muted
		playsinline
		preload="metadata"
		poster="./awesome-list-shift.png"
	>
		<source src="./awesome-list-shift.webm" type="video/webm" />
		<source src="./awesome-list-shift.mp4" type="video/mp4" />
	</video>
	<figcaption>The filters appear after the list has loaded, and push it down.</figcaption>
</figure>
```

One file is fine too: `<video src="./clip.mp4" width="1280" height="720" controls muted playsinline preload="metadata"></video>`.

- **Format:** **MP4** (H.264) plays in every browser; if you make one file, make that one. **WebM** (VP9) is usually smaller for the same quality. With both, put WebM first: the browser plays the first `<source>` it can.
- **`width` and `height` are required** (the build fails without them): the size you exported at. Like an image, the video's space is kept before the file arrives, so the page doesn't jump.
- **Short and small:** a few seconds, 1280 px wide, under about 1 MB per file. Unlike images, videos are used as they are: the build doesn't compress them, so compress before committing (below).
- **No sound, no autoplay.** `controls` lets a reader play and pause it (WCAG asks that anything moving can be paused), `muted` says there's no sound (Svelte asks for captions, a `<track>`, on a video with sound), and without `autoplay` nothing moves until the reader asks, which also respects reduced motion.
- **`preload="metadata"`** downloads only the start of the file (size, length) until it's played. **`poster`** (optional) is the image shown before that; it's used as it is, so export it at the video's size.
- **Say what it shows**, in a `<figcaption>` or in the text around it: a video has no alt text.
- **In the vault:** copy the files to `_attachments/` and embed with `![[clip.mp4]]`.

Recording and compressing (install once with `sudo apt install ffmpeg`): record with Snipping Tool (Win+Shift+R) or Game Bar (Win+Alt+R), then:

```sh
# MP4: 1280 px wide, no audio, starts playing before it has fully downloaded
ffmpeg -i raw.mp4 -vf "scale=1280:-2" -c:v libx264 -crf 28 -preset slow -an -movflags +faststart clip.mp4
# WebM (optional, smaller)
ffmpeg -i raw.mp4 -vf "scale=1280:-2" -c:v libvpx-vp9 -crf 40 -b:v 0 -row-mt 1 -an clip.webm
# A poster from the first frame (optional)
ffmpeg -i clip.mp4 -frames:v 1 clip.png
# Its width and height, for the <video> tag
ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 clip.mp4
```

Higher `-crf` means a smaller file and lower quality; raise it if a file is too big.

## Links

| To                          | Write                                                   | Notes                                                                                               |
| --------------------------- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Another post                | `[text](./2026-10-31-markdown-with-mdsvex)`             | `./` and the other post's folder name. **Only published posts**: a link to a draft fails the build. |
| Any other page on this site | `[text](/bitacora/2026-10-21-layout-routing-base-path)` | One `/` at the start, then the path. The base path (`/portfolio`) is added for you: never write it. |
| A tag                       | `[text](/blog/tags/github-actions)`                     | Like any other page.                                                                                |
| Another site                | `[text](https://svelte.dev/docs/kit/images)`            | The full `https://` address. Gets `rel="external"`, opens in the same tab.                          |
| A heading in the same post  | `[text](#the-base-path)`                                | Every heading has an `id` made from its text (see below).                                           |

- **Heading ids** come from the heading's text: lowercase, spaces become `-`, punctuation goes, accents stay. `## Gotcha: the base path` is `#gotcha-the-base-path`; a second heading with the same text gets `-1`. The easiest way to get one: hover the heading in `pnpm dev`, click it, and copy the address. To a heading in another post: `[text](./2026-10-31-markdown-with-mdsvex#the-layout)`; on any other page: `[text](/bitacora/2026-10-21-layout-routing-base-path#what-we-did)`.
- **Renaming a heading changes its id**, and links to it stop matching. On this site the build catches it (below); links from other sites can't be checked.
- **The build checks every link to this site**: a page that doesn't exist fails it, and so does a `#heading` that isn't on the page. Links to other sites aren't checked, so click them once before publishing.
- **Link text says where it goes**: "the SvelteKit docs on images", not "here" or "this link". Screen reader users often jump from link to link, hearing only their text.
- **Prefer stable sources** for external links: official docs (MDN, svelte.dev, vite.dev), specs, the project's own repo. Link the page, not a search result.
- Most posts end with a `## Links` list of the docs they used.

## Before you publish

1. Read it through. Claude wrote the drafts in your voice: change anything that doesn't sound like you.
2. Fill or delete every `<!-- TODO -->`. Readers wouldn't see them, only the gap where your part goes:
   ```sh
   grep -n '<!-- TODO' content/blog/drafts/<slug>/<slug>.md
   ```
3. Check its links to other posts, and publish (or unlink) any that are still drafts:
   ```sh
   grep -o '](\./[^)]*)' content/blog/drafts/<slug>/<slug>.md
   ```
4. Is it still true? Posts describe the site as it was; if something changed since, update it.
5. Description, tags, date; cover and its `cover:` if it has one.
6. Move it: `git mv content/blog/drafts/<slug> content/blog/published/`
7. Build and look at it as visitors will:
   ```sh
   BASE_PATH=/portfolio pnpm build && BASE_PATH=/portfolio pnpm preview
   ```
   The build fails on a link to a missing page, a missing image or video, a missing alt text, or a video without width and height, and names the file.
8. Commit on a branch and open a PR as usual. Update `.claude/drafts-to-publish.md`.

The first post to go up also needs a small change in `vite.config.ts` (the `handleUnseenRoutes` exceptions for `/blog/[slug]` and `/blog/tags/[tag]`): ask Claude.
