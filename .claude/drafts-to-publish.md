# Drafts to publish

Every post was published on 2026-11-08 (Alfonso's call), all 57 with covers, and the same day Alfonso decided to skip the `<!-- TODO -->`s Claude had left for his own part: all of them were removed from the posts, English and Spanish.

New posts start as drafts in `content/blog/posts/<slug>/` with `draft: true` (dev only). Publishing one is deleting that line; a published post that links to a draft fails the build (`prerender_http_error … was linked from …`). The how-to for images, links and the publishing checklist is in `content/blog/posts/README.md`.

List new drafts here, with their TODOs and the drafts they link to, until they go up.

**2026-11-26 (branch `articles`, Alfonso's call):** the 15 drafts from 2026-11-09 to 2026-11-18 were published **without covers** (the cards show the #tag tile); covers come with the cover pipeline (`design/cover-generation.md`). Their Spanish files are still `reviewed: false`. The spotlight post's update note now links to `2026-11-09-text-never-sits-on-the-grid` instead of the Devlog entry.

- `2026-11-09-what-the-mit-licence-asks`: porting MIT code and what its licence asks. Links to the Base64 draft: **publish both together** (a published post can't link to a draft).
- `2026-11-09-base64-encodes-bytes-not-text`: `btoa()` and UTF-8, `TextDecoder` `fatal`, base64url, data URLs. Links back to the licence draft.
- Both have screenshots Claude took (no personal data), no cover yet, and `.es.md` translations with `reviewed: false`.
- `2026-11-09-plain-text-is-utf-8` (Alfonso asked for it): characters vs code points vs bytes, mojibake, how UTF-8 works (worked example for ©), `<meta charset>`, UTF-16 in JavaScript. Mentions Dylan Beattie's talk through a `yt` block; its thumbnail `plain-text-talk.jpg` is NDC's own picture from i.ytimg.com (used to link to their video; replace it if you'd rather not). Links to the Base64 draft: publish together.
- `2026-11-09-text-never-sits-on-the-grid`: the grid readability audit and the sheet rule; before/after screenshots Claude took. Links to the published spotlight post. When it goes up, the spotlight post's update note (which points at the Devlog entry) can link to it instead.

## Phase 11 (CMS), 2026-11-09

- `2026-11-09-a-cms-that-only-changes-what-you-edit`: Sveltia CMS's first save rewrote untouched lines; our own file format and the save-everything test. Links to the preview draft below: **publish both together**. No cover, `.es.md` with `reviewed: false`.
- `2026-11-10-a-preview-built-from-my-own-build`: the CMS preview in four tries (real page as saved, live real page with a hidden `.preview.md`, the build's own plugins in the browser, then the site's own `Markdown.svelte` mounted live after the svelte-markdown switch, which made the live real page unnecessary: removed). No cover, no links to drafts, `.es.md` with `reviewed: false`.

## svelte-markdown instead of mdsvex, 2026-11-11 (branch `spike/svelte-markdown`)

- `2026-11-11-markdown-drawn-by-my-own-components`: why and how mdsvex was replaced (the comparison first, our own token pass, strict HTML, server render + `{@html}`, the CMS mounting the same components, two glob traps, the weight numbers). Links to the preview draft above: **publish together** (or after it). No cover, `.es.md` with `reviewed: false`. Only makes sense if the branch is merged.
- `2026-11-11-a-cms-from-npm-and-three-traps`: the CMS imported from npm (the top-level-await deadlock with `DOMContentLoaded`, Vite's optimizer losing Sveltia's assets, the React effect that returned the props) and what was deleted. Links to the preview draft above: **publish together** (or after it). No cover, `.es.md` with `reviewed: false`.
- The same branch added a dated "Update (2026-11-11)" note to eight published posts that described mdsvex (markdown-with-mdsvex, markdown-links-with-an-mdsvex-layout, images-next-to-the-post, shiki-with-design-tokens, linkable-headings-in-markdown, components-in-code-blocks, callouts-that-read-well-everywhere, videos-in-markdown-posts), English and Spanish. They don't link to drafts.

## 2026-11-18 (branch `feat/image-cache`)

All seven have an `.es.md` with `reviewed: false`, no cover, and screenshots Claude took (no personal data beyond Alfonso's public photo). None links to a draft, so each can go up on its own.

- `2026-11-18-minigames-on-a-404-page`: the four 404 variants, how the 404 works on GitHub Pages, rules without a canvas, `role="application"`, the project page. Screenshot of the project page.
- `2026-11-18-least-privilege-for-a-pages-workflow`: the build job that could push, the separate image-cache job, SHA pins + Dependabot, concurrency, the faster Playwright run. **Publish after the workflow change has run on `main` once.**
- `2026-11-18-a-light-theme-that-looks-like-paper`: the engineering-pad tokens, the brand grid in every theme, the spotlight contrast fix. Screenshot of a post in light.
- `2026-11-18-static-search-with-pagefind`: what's indexed, two languages, why preview didn't work, animating the popover, the result morph trap. Two screenshots.
- `2026-11-18-zoom-for-a-wider-reading-column`: wider pages, `zoom` for the reading column, the text size control, the Devlog font. Screenshot at 1920.
- `2026-11-18-a-hire-me-panel-with-five-looks`: the handle, the sheet, the five looks, the tilt overflow fix. Three screenshots. **Mentions "open to work": publish only if you're fine saying so.**
- `2026-11-18-a-cms-on-github-pages`: the second Vite build, the covers swap, what the authenticator Worker does, the shared-origin caveat. **Publish once GitHub sign-in works on the live site** (the Worker and GitHub App exist).

## 2026-11-19 (branch `feat/covers-icons-and-motion`)

- `2026-11-19-a-timeline-that-fills-as-you-read`: the Devlog timeline's three scroll-driven animations, the `view(50% 50%)` inset trick, the wipe's clip room for the dot. Screenshot Claude took. No cover, `.es.md` with `reviewed: false`, no links to drafts.
- `2026-11-19-an-icon-picker-inside-sveltia-cms`: a Svelte field inside Sveltia's React, the Lucide names from the package's files through a virtual module. Screenshot Claude took (Sveltia's test backend). No cover, `.es.md` with `reviewed: false`.
- `2026-11-19-site-settings-without-a-yaml-parser`: `content/site.yaml` as a singleton, the `?data` Vite plugin, the build-time checks, empty fields left out. No cover, `.es.md` with `reviewed: false`. **Publish after a real save from the CMS has worked** (the singleton with our `list` format).

## The mdsvex switch, 2026-11-26 (branch `feat/mdsvex`)

All four only make sense once `feat/mdsvex` is merged. Each has an `.es.md` with `reviewed: false`, no cover and no screenshots.

- `2026-11-26-code-colours-as-classes`: twinkleplop instead of Shiki: classes instead of inline styles, synchronous languages, per-language rules (`data-lang`), the character-by-character comparison (86.9 %). No links to drafts.
- `2026-11-26-back-to-mdsvex-measured`: why mdsvex again, the block-by-block comparison (158 of 158 in each language), PFM's dialect, parse plugins, links per language at run time, block files through plugin data, the enhanced-img clash, directives next. Links to the published svelte-markdown post only.
- `2026-11-26-a-cms-preview-that-compiles-svelte`: the preview compiling mdsvex + Svelte in the browser, blob modules, the private runtime import, 72 of 72 identical, why braces are banned. No links to drafts.
- `2026-11-26-a-glob-is-a-list-you-ship`: Lighthouse after the switch, the two leaks (a glob of every body, the YAML parser) and the numbers before and after. Links to `back-to-mdsvex-measured`: **publish together** (or after it).
