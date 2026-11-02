# Portfolio — project guide for Claude

Alfonso's personal portfolio, built as a **learning project** (Alfonso is a junior dev).

## How we work

- **Faster learning mode (since Phase 3).** Claude may write the code for each step, then explains the concepts behind it, with doc links.
- **Before moving to the next step, Claude interviews Alfonso** with 2–4 short questions on that step's concepts (the why, not trivia). If an answer is off, clarify and re-check before moving on.
- Keep the code small and in the project's style so Alfonso can read all of it. Point out anything worth trying by hand (small experiments in DevTools or the build output).
- One branch and one PR per phase. Write **one Bitácora entry per topic** (not one per phase), and copy each one to the Obsidian vault project `10 Projects/Portfolio/` (use the `obsidian-obsidianai` skill).
- Write **one draft blog article per topic** too (e.g. design tokens, cascade layers, dark mode), in `content/blog/drafts/`. Drafts only exist in dev; publishing a post means moving it up to `content/blog/` (Alfonso's call).
- The learning path (phases 0–9) is in [learning-path.md](learning-path.md). Check which phase is current before suggesting work.
- **Progress:** Phases 0–4.5, 6 and 7 done (4.5 merged in PR #8, 6 in PR #9, 7 in PR #10 on 2026-11-02). Phase 6 and 7 were done before Phase 5 (Alfonso's call: Phase 5 needs his real CV data). The mascot moved to later (draft at `/mascot`, `design/mascot.md`, card on the vault board). What Phase 6 built:
  - `src/lib/content.ts` reads the **frontmatter only** (`import.meta.glob` + `?raw`, the `yaml` package), server-side; the landing shows the latest entries and (dev only, all posts are drafts) posts.
  - **mdsvex 0.12.8** (stable; `1.0.0-next` is a prerelease) runs from a small `markdown()` Vite plugin in `vite.config.ts`, **not** from `preprocess`: enhanced-img parses every Svelte file in a `'pre'` transform, before preprocessors, and choked on `<enhanced:img>` in prose. The plugin rewrites mdsvex's `<script context="module">` and returns an empty sourcemap; its `/\.md$/` filter keeps `?raw` imports plain text. Phase 7 replaced its Prism with Shiki (`highlight.highlighter`).
  - `/bitacora/[slug]`: `entries()` + frontmatter in `+page.server.ts`, the body from a lazy glob in `+page.ts`, wrapped in `.prose` (global.css `components` layer). `/bitacora` is a timeline grouped by phase.
  - `TeaserCard` takes a resolved `href` (callers use `resolve('/bitacora/[slug]', { slug })`); `RouteWithoutParams` (`src/lib/links.ts`) types links passed to `resolve()` alone. The route view transition names only `.site-header` (pages have their own `<header>`s).
  - Lighthouse a11y 100 on `/bitacora` and an entry, both themes.
    What Phase 7 built (the `2026-11-02-*` Bitácora entries have the details):
  - **Drafts** live in `content/blog/drafts/` and are globbed only behind `import.meta.env.DEV`, so a build neither lists nor bundles them; `Entry.draft` comes from the path. `handleUnseenRoutes` ignores `/blog/[slug]` and `/blog/tags/[tag]` while every post is a draft.
  - **Shiki** in `vite.config.ts` (`highlight.highlighter`; languages load on demand; `{ } \` and backticks escaped as entities). Our own TextMate theme `src/lib/code-theme.ts` maps scopes to `--code-*` tokens (all ≥ 5.3:1 on `--surface-2`).
  - **`MarkdownLayout.svelte`** (mdsvex `layout`, a file path) exports `a` = `MarkdownLink` (single-slash paths get the base via a widened `resolve`; the crawler checks them; `https://` gets `rel="external"`; mdsvex's `nofollow` dropped) and `CodeBlock` (used by `highlight()` as `Components.CodeBlock`): language bar, copy button only once JS runs, wrapped lines, CSS-counter line numbers.
  - **Reading time** (`minutes`, 200 wpm, from the raw file) on every `Entry`; `--reading-width: 80ch` for the reading composition.
  - **Tags:** `postTags` / `postsTagged` in `content.ts`, `checkTags` fails the build on non-kebab-case tags; `/blog/tags/[tag]` grouped by year; tag index on `/blog`; `TagList.svelte` links tags only when given `tagHref` (`blogTag` in `links.ts`), so Bitácora tags stay text.
  - Verified (one draft temporarily published): Lighthouse a11y 100 on `/blog`, a tag page and a post, both themes; no horizontal scroll at 320px.
- **Current: Phase 8 (subprojects & Awesome-X), on `feat/projects`** (branched from `main` after PR #10, 2026-11-02; not started). This handoff is its first commit: no separate docs branch (Alfonso's call, to avoid duplicate branches). The plan is in [learning-path.md](learning-path.md); the first step isn't picked yet (the learning path suggests `/projects` as a card grid from data and a first small tool, e.g. a contrast checker on our own tokens). The home page's `projects: Teaser[]` is already waiting for that data. If Phase 8 renders markdown we didn't write (Awesome lists from outside), sanitize it: `{@html}` never does.
- **Publishing drafts** is Alfonso's call, one `git mv` from `content/blog/drafts/` to `content/blog/`. [drafts-to-publish.md](drafts-to-publish.md) lists each draft's TODOs and its links to other drafts. A published post can't link to a draft: the crawler fails the build (`prerender_http_error`, tested). Once one post is live, remove `handleUnseenRoutes`' exceptions in `vite.config.ts`.
- **Open for Alfonso:** pick `a11y` or `accessibility` as a tag; the `/blog` tag index reads as "#css 17" to a screen reader (an `aria-label` or a hidden "posts" would fix it); "components inside markdown" is only covered by the layout's components so far; check whether the Joy of Code course is free (it answered 402 to a script); an Emmet post (card on the vault board); from 4.5, the optional `wide` composition for `/cv` and the step 3 re-check (Q2 `$effect` for the observer, Q4 sticky min-height).
- When the work changes something a post in `content/blog/` (or `drafts/`) describes, update that post too. Leave `<!-- TODO -->` placeholders where Alfonso's own code goes rather than writing the solution into the post.

## Stack & decisions

- SvelteKit 3, Svelte 5 (runes forced), adapter-static, deployed to GitHub Pages via `.github/workflows/`.
- Open Props for design tokens; mdsvex for markdown; migrating JS+JSDoc → **TypeScript** (Phase 1).
- **Planned: named themes** (Tokyo Night, Dracula…) **and user-generated themes**, both as overrides of our semantic tokens. So components and other CSS use semantic tokens only; color primitives live only in `src/lib/styles/tokens.css`.
- **Identity (Phase 4.5):** technical look (terminal, monospace, blueprints, code), animated, with a mascot. **Dark first**: design and polish the dark theme, then adapt light (the site still follows the OS by default). Theme and tokens are shared site-wide; each route varies composition (layout, navigation) and has one signature trick. Every effect is a progressive enhancement and respects reduced motion. **Mascot:** Alfonso proposed Onsokumaru (Ninja Nonsense), but it's a copyrighted character, so we design an **original** SVG mascot inspired by the traits Alfonso likes about it. Claude doesn't draw or recreate Onsokumaru. The trait Alfonso picked: a **smug, cheeky attitude** (it comments on what you do: hovering, toggling the theme, scrolling).
- Package manager: `pnpm`. Checks: `pnpm check`, `pnpm lint`, `pnpm build`.

## Testing

- Test the production build, not dev: `BASE_PATH=/portfolio pnpm build && BASE_PATH=/portfolio pnpm preview`. Dev has no base path, so path bugs only show here.
- Restart `pnpm preview` after every rebuild. It reads the file list at startup and can serve stale or missing hashed assets.
- Check layouts at 320px and desktop width (no horizontal scroll), both themes, and with reduced motion on.
- Check new token color pairs for contrast when they're defined. Lighthouse only audits colors a page actually uses.

## Folders

- `content/` — markdown sources, published from Phase 6 on:
  - `bitacora/` — short, dated dev-log entries (`YYYY-MM-DD-slug.md`). Use the `bitacora-entry` skill.
  - `blog/` — long-form, polished articles.
  - `awesome/` — Awesome-X curated lists.
- `.claude/skills/`, `.claude/agents/` — project-local skills and agents (committed).
- `static/` — files served as-is (robots.txt, etc.).
- `design/` — design briefs (e.g. the mascot), not published.
