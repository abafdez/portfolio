# Drafts to publish

Every post is still a draft in `content/blog/drafts/`. Publishing one is Alfonso's call:

```sh
git mv content/blog/drafts/<slug>.md content/blog/
```

Before moving a draft:

1. Read it through: Claude wrote these in Alfonso's voice.
2. Fill or delete its `<!-- TODO -->`s. Svelte drops HTML comments, so readers wouldn't see a TODO, only the gap where Alfonso's part goes.
3. Publish (or unlink) every draft it links to. A published post that links to a draft fails the build (`prerender_http_error … was linked from …`).
4. Decide on the date: keep the draft's, or use the day it goes live.

After the first post is live, remove the `handleUnseenRoutes` exceptions in `vite.config.ts`.

Update this list as posts go up, or regenerate it: `grep -n '<!-- TODO' content/blog/drafts/*.md` for the TODOs, `grep -o '](\./[^)]*)' content/blog/drafts/*.md` for the links.

## Ready (no TODOs, no links to drafts)

- `2026-10-29-enhanced-img`
- `2026-10-29-page-controlled-animations`
- `2026-10-29-responsive-without-breakpoints`
- `2026-10-29-typed-component-props`

## Standalone, with TODOs

These link to no other draft.

- `2026-10-20-sveltekit-3-github-pages-workflow`
  - link the post or Bitácora entry where the base path is fixed (it's a Bitácora entry: `/bitacora/2026-10-21-layout-routing-base-path`)
- `2026-10-31-scroll-driven-header-footer`
  - a short video of scrolling the home page, top to bottom
  - try `animation-range: 0 50vh` in DevTools and describe the difference
- `2026-11-01-svelte-scoped-styles`
  - try it in the Svelte playground and say what surprised me
  - when I'd pick `:global()` in a component instead of a global class
- `2026-11-02-drafts-that-never-ship`
  - what I found in `build/` before the fix
  - try it: `pnpm build`, then grep a draft's title in `build/`
  - the first post I published, and whether I removed the exception
- `2026-11-02-markdown-links-with-an-mdsvex-layout`
  - how I noticed (dev has no base path, so it only broke in the build)
  - the error message the build gave me
  - anything else I'd replace with the layout (images? heading anchors?)
- `2026-11-02-reading-time-at-build-time`
  - does 200 wpm feel right? Time myself reading one of my posts
  - what I found in `build/` when I looked for "minutes"
- `2026-11-02-a-code-block-frame`
  - why one column
  - a screenshot of the overlapping numbers, or of the empty lines
  - what a screen reader said when I pressed the copy button
- `2026-11-02-a-contrast-checker-for-my-own-tokens`
  - add `data-theme="light"` to an element in DevTools and describe what happened
  - a link to the tool once it's live, and a screenshot of the tables

## Groups that go up together

A post needs every draft it links to, and those drafts need theirs.

**Design system** (Phases 2–4.5). 11 TODOs in all, from the posts marked with a number:

- `2026-10-27-design-tokens` → cascade layers, dark-first palette
- `2026-10-29-cascade-layers` → design tokens, dark mode
- `2026-10-29-dark-mode` → design tokens, theme toggle
- `2026-10-30-theme-toggle-view-transition` (2: the header values and why; a demo GIF) → dark mode, route transitions
- `2026-10-31-route-transitions-composition` (2: a video of the nav; the durations tried) → theme toggle
- `2026-10-31-dark-first-palette` (3: an ink scale screenshot; the contrast table; what I'd still change) → design tokens, dark mode, blueprint
- `2026-10-31-blueprint-background` (2: a screenshot and GIF; a DevTools experiment) → scroll-driven header and footer
- `2026-10-31-scroll-driven-header-footer` (see above)

These need that whole group live first:

- `2026-10-22-open-props-jit-vite` → design tokens
- `2026-10-29-self-hosted-fonts` → design tokens, dark-first palette
- `2026-10-31-sticky-intro-scroll-spy` (2: a desktop video; the `rootMargin` tried) → route transitions, scroll-driven header and footer

**Svelte styles:**

- `2026-11-01-svelte-styling-resources` (4: a verdict on each; whether the Joy of Code course is free; the video worth it; the experiments) → scoped styles

**Markdown and code** (Phase 7):

- `2026-10-31-markdown-with-mdsvex` (3: why mdsvex; what I tried; the Network tab) → markdown links, Shiki
- `2026-11-02-shiki-with-design-tokens` (3: light and dark screenshots; a token from the inspector; how I checked contrast) → code block frame
- `2026-11-02-tag-pages-from-frontmatter` (2: the unseen-routes error; a screenshot of the tag index) → drafts that never ship
