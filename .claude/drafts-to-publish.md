# Drafts to publish

Every post was published on 2026-11-08 (Alfonso's call), all 57 with covers, and the same day Alfonso decided to skip the `<!-- TODO -->`s Claude had left for his own part: all of them were removed from the posts, English and Spanish.

New posts start as drafts in `content/blog/drafts/<slug>/` (dev only). Publishing one is `git mv content/blog/drafts/<slug> content/blog/published/`; a published post that links to a draft fails the build (`prerender_http_error … was linked from …`). The how-to for images, links and the publishing checklist is in `content/blog/published/README.md`.

List new drafts here, with their TODOs and the drafts they link to, until they go up.

## Phase 8.5 (toolbox), 2026-11-09

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
