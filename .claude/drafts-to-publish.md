# Drafts to publish

Every post is still a draft in `content/blog/drafts/`. Publishing one is Alfonso's call:

```sh
git mv content/blog/drafts/<slug> content/blog/published/
```

Before moving a draft:

1. Read it through: Claude wrote these in Alfonso's voice.
2. Fill or delete its `<!-- TODO -->`s. Svelte drops HTML comments, so readers wouldn't see a TODO, only the gap where Alfonso's part goes.
3. Publish (or unlink) every draft it links to. A published post that links to a draft fails the build (`prerender_http_error … was linked from …`).
4. Decide on the date: keep the draft's, or use the day it goes live.

After the first post is live, remove the `handleUnseenRoutes` exceptions in `vite.config.ts`.

Update this list as posts go up, or regenerate it: `grep -n '<!-- TODO' content/blog/drafts/*/*.md` for the TODOs, `grep -o '](\./[^)]*)' content/blog/drafts/*/*.md` for the links.

The how-to for images, links and the publishing checklist is in `content/blog/published/README.md`.

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
- `2026-11-02-filters-in-a-svelte-class`
  - whether AND felt right for tags, or OR
  - what a screen reader said when toggling a tag and typing a search
- `2026-11-03-smooth-scroll-only-where-you-mean-it`
  - a recording of the glide before the fix
  - whether the jump feels better than a glide or a fade

- `2026-11-04-breadcrumbs-from-route-ids`
  - a screenshot of the breadcrumbs and the nav marker on /projects/cv
  - what a screen reader said on the breadcrumbs
  - try it: the relative hrefs in `build/projects/cv.html`, and the marker with JS off

## Groups that go up together

A post needs every draft it links to, and those drafts need theirs.

**Design system** (Phases 2–4.5). 14 TODOs in all, from the posts marked with a number:

- `2026-10-27-design-tokens` → cascade layers, dark-first palette
- `2026-10-29-cascade-layers` → design tokens, dark mode
- `2026-10-29-dark-mode` → design tokens, theme toggle
- `2026-10-30-theme-toggle-view-transition` (2: the header values and why; a demo GIF) → dark mode, route transitions
- `2026-10-31-route-transitions-composition` (2: a video of the nav; the durations tried) → theme toggle
- `2026-10-31-dark-first-palette` (3: an ink scale screenshot; the contrast table; what I'd still change) → design tokens, dark mode, blueprint
- `2026-10-31-blueprint-background` (2: a screenshot and GIF; a DevTools experiment) → scroll-driven header and footer, decoration under text
- `2026-11-04-decoration-under-text-needs-contrast` (3: a before/after screenshot; how light feels now; the 45% experiment in DevTools) → blueprint, contrast checker
- `2026-10-31-scroll-driven-header-footer` (see above)

These need that whole group live first:

- `2026-10-22-open-props-jit-vite` → design tokens
- `2026-10-29-self-hosted-fonts` → design tokens, dark-first palette
- `2026-10-31-sticky-intro-scroll-spy` (2: a desktop video; where the line goes and why a third of the way down) → route transitions, scroll-driven header and footer

**Svelte styles:**

- `2026-11-01-svelte-styling-resources` (4: a verdict on each; whether the Joy of Code course is free; the video worth it; the experiments) → scoped styles

**Markdown and code** (Phase 7):

- `2026-10-31-markdown-with-mdsvex` (3: why mdsvex; what I tried; the Network tab) → markdown links, Shiki
- `2026-11-06-linkable-headings-in-markdown` (3: the link I wanted to write; what a screen reader said; the hover-click-copy exercise) → markdown with mdsvex
- `2026-11-06-images-next-to-the-post` (2: which post needed an image first; deleting an alt and reading the error) → markdown with mdsvex, drafts that never ship
- `2026-11-07-callouts-that-read-well-everywhere` (1: the part of the plugin I found most interesting) → linkable headings, markdown with mdsvex
- `2026-11-06-videos-in-markdown-posts` (2: the hashed name the build wrote for my first video; the sizes of my first clip, raw, MP4 and WebM) → images next to the post, pages that jump
- `2026-11-02-shiki-with-design-tokens` (3: light and dark screenshots; a token from the inspector; how I checked contrast) → code block frame
- `2026-11-02-tag-pages-from-frontmatter` (2: the unseen-routes error; a screenshot of the tag index) → drafts that never ship

**About page** (Phase 5):

- `2026-11-03-brand-colors-at-my-themes-lightness` (3: raw vs final screenshot; changing `--icon-tone` in DevTools; the logo that surprised me) → contrast checker
- `2026-11-03-icons-as-data-and-an-svg-sprite` (2: editing the YAML vs the TypeScript; the build error from a wrong logo) → filters in a Svelte class
- `2026-11-03-windows-that-collapse-and-still-search` (4: a video of windows opening and collapsing; the collapse slowed down in the Animations panel; Ctrl+F inside a collapsed window; what a screen reader says on the title bar)
- `2026-11-03-htop-bars-and-a-border-spotlight` (4: a video of the bars and the glow; the three showcases and why terminal and spotlight; a stepped fill next to the smooth one; logos.svg in the Network tab) → icons as data and an SVG sprite

**CV builder** (Phase 5.5):

- `2026-11-03-radio-buttons-for-a-filter` (4: a screenshot with a profile picked; what a screen reader said; the inputs without `opacity: 0`; the flash before the filter) → filters in a Svelte class
- `2026-11-03-a-form-that-remembers` (3: a screenshot with made-up data; junk in localStorage and what `read()` kept; how I'd have found the select bug). Links to no draft.
- `2026-11-03-printing-a-cv-from-a-web-page` (3: a print preview screenshot; the print rule tried in global.css; select-all from the PDF). Links to no draft.
- `2026-11-03-form-validation-without-a-library` (3: screenshots in both themes; `:user-invalid` alone in DevTools; what a screen reader said). Links to no draft.
- `2026-11-03-store-the-changes-not-the-copy` (3: a screenshot of the editor; my edits as stored in DevTools; the broken `??=` in the playground). Links to no draft.
- `2026-11-03-an-accordion-without-javascript` (3: a recording of the sections; what a screen reader says on a summary; browser support for `name` on details). Links to no draft.

**SEO and tests** (Phase 9):

- `2026-11-04-seo-on-a-github-pages-project-site` (3: what I decided about indexing and why; a link preview screenshot once deployed; the sitemap in Search Console) → unit tests with Vitest, cover images
- `2026-11-06-does-a-deploy-bust-the-cache` (1: what I expected before the diff) → caching between runs
- `2026-11-06-caching-between-github-actions-runs` (2: a screenshot of the Caches page; the build times with and without the cache, once there are images) → does a deploy bust the cache, GitHub Pages workflow
- `2026-11-06-cover-images-and-cards` (3: a screenshot of /blog with covers; what a screen reader said on a card; the tab-and-click exercise) → images next to the post, SEO
- `2026-11-04-unit-tests-with-vitest` (2: what I watched first and what clicked; breaking summary() on purpose in watch mode). Links to no draft.
- `2026-11-06-a-smoke-test-with-playwright` (2: what I used to check by hand before each merge; breaking a page and reading the trace) → unit tests with Vitest
- `2026-11-06-pages-that-jump` (3: a recording of the Awesome list jumping; what my fonts are for; the DevTools Performance panel exercise) → filters in a Svelte class
