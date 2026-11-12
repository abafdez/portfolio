# Publishing a post

Posts start in `../drafts/`, which only exists in dev. Publishing one is a move:

```sh
git mv content/blog/drafts/<slug> content/blog/published/
```

## In the CMS

Posts, drafts, the Devlog and the Awesome lists can be edited in a CMS ([Sveltia CMS](https://sveltiacms.app/en/docs), dev only): run `pnpm dev` and open `http://localhost:5173/admin` in Chrome or Edge (it needs the File System Access API, which Firefox and Safari don't have). Click "Work with Local Repository" and pick the repo's folder; from WSL, pick "Linux" in the folder picker's sidebar first. It edits the files themselves, so check `git diff` and commit as usual.

- **English and Spanish** are side by side. A new entry starts in English only; switch Spanish on from the three-dot menu when you translate it.
- **A save changes only what you edited**: the CMS writes files in this repo's own style and runs Prettier on them (`src/lib/content-files.ts`, `src/lib/cms/formats.ts`). After editing frontmatter by hand (in Obsidian, say), run `pnpm content:format` so the files stay in that shape; `pnpm test` fails until they are.
- **The body** opens as markdown; the button at the end of the toolbar switches to rich text. Both keep callouts, HTML in backticks and the blocks below.
- **` ```yt ` and ` ```video `** are in the Insert menu and filled in a dialog.
- **Images**: the image button uploads next to the post and writes `![alt](./file.png)`; its Title field becomes the caption.
- **The preview** is drawn in the browser as you type, by the site's own markdown components and CSS (`src/lib/markdown/`, the same code that renders the page): callouts, blocks, code and headings as on the page; pictures as they are, without enhanced-img's optimised copies. Anything the build would refuse (HTML in the text, a block with a wrong field, an image without alt text) shows its error there instead. The Awesome list's preview is the page as last saved, in dev only.
- **Publishing** is still the `git mv` above: drafts and published posts are two lists in the CMS, and it can't move a post between them.
- **Cover focal point** is stored as `focus: x% y%`; the site doesn't use it yet.

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

**Quote a value that contains `: ` (colon and space)**, or YAML reads it as a new field and the build fails (the error names the file): `description: 'Two things: this and that.'`. A value with a `'` inside is easiest in double quotes. Don't quote the others: `pnpm content:format` (and the CMS) take quotes off where YAML doesn't need them. The CMS quotes for you.

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
- **The file must be next to the post** (`./…`): an image from another site fails the build.
- **Alt text is required**: the build fails without it. It says what the image shows, for someone who can't see it. Don't start with "Image of…".
- **A caption** (the quoted part) is for everyone: context, a source, what to notice. Don't repeat the alt text in it.
- **Screenshots: check for personal data before committing**: open tabs, notifications, email addresses, the CV builder with real details. Once it's pushed, it's public.

### Videos

Markdown has no syntax for video, so write a `video` block: a code block whose language is `video`, with fields in YAML. On the site it becomes the `<video>` below; in Obsidian and on GitHub it reads as five lines of YAML.

````md
```video
src: ./awesome-list-shift.mp4
webm: ./awesome-list-shift.webm
poster: ./awesome-list-shift.png
width: 1280
height: 720
caption: The filters appear after the list has loaded, and push it down.
```
````

| Field     | Required | What                                                            |
| --------- | -------- | --------------------------------------------------------------- |
| `src`     | yes      | The video, next to the post (`./`). MP4 plays everywhere.       |
| `width`   | yes      | The size you exported at, in pixels.                            |
| `height`  | yes      | Same.                                                           |
| `webm`    | no       | A smaller WebM copy; browsers that can play it get it first.    |
| `poster`  | no       | An image shown before it plays, at the video's size.            |
| `caption` | no       | What it shows (a video has no alt text). Makes it a `<figure>`. |

The build fails on a missing required field, a field that isn't in the table (`autoplay` included, on purpose), a size that isn't a number, or a file without `./`, naming the post. The block always adds `controls muted playsinline preload="metadata"` (why each one, below).

The video it makes looks like this (poster, WebM and MP4 sources, a caption). You can't write it as HTML yourself: HTML in a post fails the build (see [Tags and code in the text](#tags-and-code-in-the-text)). If you need something the block doesn't do, ask Claude to add a field.

- **Format:** **MP4** (H.264) plays in every browser; if you make one file, make that one. **WebM** (VP9) is usually smaller for the same quality. With both, put WebM first: the browser plays the first `<source>` it can.
- **`width` and `height` are required** (the build fails without them): the size you exported at. Like an image, the video's space is kept before the file arrives, so the page doesn't jump.
- **Short and small:** a few seconds, 1280 px wide, under about 1 MB per file. Unlike images, videos are used as they are: the build doesn't compress them, so compress before committing (below).
- **No sound, no autoplay.** `controls` lets a reader play and pause it (WCAG asks that anything moving can be paused), `muted` says there's no sound (Svelte asks for captions, a `<track>`, on a video with sound), and without `autoplay` nothing moves until the reader asks, which also respects reduced motion.
- **`preload="metadata"`** downloads only the start of the file (size, length) until it's played. **`poster`** (optional) is the image shown before that; it's used as it is, so export it at the video's size.
- **Say what it shows**, in `caption` or in the text around it: a video has no alt text.
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

### YouTube videos

Someone else's talk or tutorial: a `yt` block. It shows the video's picture and title as a card that opens the video on YouTube in a new tab. **Nothing loads from Google on your page**: no player, no scripts, no cookies, until a reader clicks.

````md
```yt
src: https://www.youtube.com/watch?v=gd5uJ7Nlvvo
title: Plain Text, by Dylan Beattie (NDC Copenhagen 2022)
thumbnail: ./plain-text-talk.jpg
```
````

| Field       | Required | What it is                                                                                           |
| ----------- | -------- | ---------------------------------------------------------------------------------------------------- |
| `src`       | yes      | The video's link, any shape (`youtube.com/watch?v=…`, `youtu.be/…`, `/shorts/…`). A `?t=90` is kept. |
| `title`     | yes      | The card's text: what the reader is about to open. Usually the video's title and who made it.        |
| `thumbnail` | no       | A picture next to the post, 16:9. Without one, a blueprint tile with a play sign.                    |
| `caption`   | no       | A line under the card, like an image caption.                                                        |

- **The thumbnail is a file of yours, not a link to YouTube's**: a picture from `i.ytimg.com` would be a request to Google on every visit. To save the video's own: `https://i.ytimg.com/vi/<id>/maxresdefault.jpg` (1280 × 720; `hqdefault.jpg` if that one is missing, it's 4:3 and loses its black bars). It's the video owner's picture, used to link to their video.
- **"Opens in a new tab" is written on the card**, in the post's language, so nobody is surprised by a new tab.
- A link that isn't YouTube, or a missing `title`, fails the build and names the file.

## Callouts

A box for a note, a tip or a warning. It's a blockquote whose first line is `[!type]`, the same syntax GitHub ("alerts") and Obsidian ("callouts") draw, so the file reads well in both:

```md
> [!tip]
> Test the production build, not dev.

> [!warning] Not on GitHub Pages
> The rest of the first line is a title of your own.
```

- **Five types**, GitHub's: `note`, `tip`, `important`, `warning`, `caution` (any case). Any other `[!type]` fails the build, naming the file: Obsidian's extra types (`info`, `bug`…) would be plain blockquotes on GitHub.
- **The title** says the type ("Tip") unless you write your own; a screen reader still hears the type first ("Warning: Not on GitHub Pages").
- **Folding** (Obsidian's `[!note]-`) is accepted, but the box is always shown open.
- **Use them sparingly**: one or two per post. When everything is a callout, nothing stands out.

## In Spanish

A post's Spanish version is a second file in the same folder, `<slug>.es.md`, next to `<slug>.md`. It shares the images (`./diagram.png` works from both) and is published with the same `git mv`.

```md
---
title: Un acordeón sin JavaScript
description: One or two sentences, like the English one (optional: without it, the first paragraph).
cover: The cover's alt text, in Spanish (required if the folder has a cover).
reviewed: false
---
```

- **Only words go in its frontmatter.** `date`, `tags` and `phase` come from the English file, so the two can't disagree; writing them here fails the build.
- **`reviewed: false`** until you've read it (Claude writes the translations); in dev, the post shows a "sin revisar" badge. Set it to `true` once it reads like you.
- **Callout titles** come out in Spanish by themselves ("Sugerencia", "Advertencia"). Code stays as it is.
- **Without a Spanish file**, `/es/blog/<slug>` shows the English post inside the Spanish site, marked "en inglés", and tells search engines the English page is the real one.

## Tags and code in the text

**Always put an HTML tag in backticks** when you write about it: `` `<details>` ``, `` `<video>` ``, `` `<profile>` ``. **HTML outside backticks fails the build**, naming the post and the tag, whether it's a made-up tag like `<profile>` or a real one like `<aside>`: nothing written in a post reaches the page as raw markup. Every element on the page comes from the site's own components (the blocks above for what markdown can't say). The CMS preview shows the same error. A comment (`<!-- note to self -->`) is the one exception: it's dropped.

`{` and `}` are plain text now, inside backticks or not. Frontmatter (`title`, `description`) is plain text too, so no backticks there: they'd show as they are.

## Links

| To                          | Write                                                 | Notes                                                                                               |
| --------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Another post                | `[text](./2026-10-31-markdown-with-mdsvex)`           | `./` and the other post's folder name. **Only published posts**: a link to a draft fails the build. |
| Any other page on this site | `[text](/devlog/2026-10-21-layout-routing-base-path)` | One `/` at the start, then the path. The base path (`/portfolio`) is added for you: never write it. |
| A tag                       | `[text](/blog/tags/github-actions)`                   | Like any other page.                                                                                |
| Another site                | `[text](https://svelte.dev/docs/kit/images)`          | The full `https://` address. Gets `rel="external"`, opens in the same tab.                          |
| A heading in the same post  | `[text](#the-base-path)`                              | Every heading has an `id` made from its text (see below).                                           |

- **Heading ids** come from the heading's text: lowercase, spaces become `-`, punctuation goes, accents stay. `## Gotcha: the base path` is `#gotcha-the-base-path`; a second heading with the same text gets `-1`. The easiest way to get one: hover the heading in `pnpm dev`, click it, and copy the address. To a heading in another post: `[text](./2026-10-31-markdown-with-mdsvex#the-layout)`; on any other page: `[text](/devlog/2026-10-21-layout-routing-base-path#what-we-did)`.
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
5. Description, tags, date; cover and its `cover:` if it has one. The same for the Spanish file, `<slug>.es.md`: does it say what the English one says now, and have you read it (`reviewed: true`)?
6. Move it: `git mv content/blog/drafts/<slug> content/blog/published/`
7. Build and look at it as visitors will:
   ```sh
   BASE_PATH=/portfolio pnpm build && BASE_PATH=/portfolio pnpm preview
   ```
   The build fails on a link to a missing page, a missing image or video, a missing alt text, or a video without width and height, and names the file.
8. Commit on a branch and open a PR as usual. Update `.claude/drafts-to-publish.md`.

The first post to go up also needs a small change in `vite.config.ts` (the `handleUnseenRoutes` exceptions for `/blog/[slug]` and `/blog/tags/[tag]`): ask Claude.
