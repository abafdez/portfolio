# Portfolio — project guide for Claude

Alfonso's personal portfolio, built as a **learning project** (Alfonso is a junior dev).

## How we work

- **Faster learning mode (since Phase 3).** Claude may write the code for each step, then explains the concepts behind it, with doc links.
- **Before moving to the next step, Claude interviews Alfonso** with 2–4 short questions on that step's concepts (the why, not trivia). If an answer is off, clarify and re-check before moving on.
- Keep the code small and in the project's style so Alfonso can read all of it. Point out anything worth trying by hand (small experiments in DevTools or the build output).
- One branch and one PR per phase. Write **one Bitácora entry per topic** (not one per phase), and copy each one to the Obsidian vault project `10 Projects/Portfolio/` (use the `obsidian-obsidianai` skill).
- Write **one draft blog article per topic** too (e.g. design tokens, cascade layers, dark mode), in `content/blog/drafts/`. Drafts only exist in dev; publishing a post means moving it up to `content/blog/` (Alfonso's call).
- The learning path (phases 0–9) is in [learning-path.md](learning-path.md). Check which phase is current before suggesting work.
- **Progress:** Phases 0–4.5 and 6 done (4.5 merged in PR #8, 6 in PR #9; the mascot moved to later: draft at `/mascot`, `design/mascot.md`, card on the vault board). **Phase 6 (content) is merged in PR #9.** It was done before Phase 5 (Alfonso's call: Phase 5 needs his real CV data). What Phase 6 built:
  - `src/lib/content.ts` reads the **frontmatter only** (`import.meta.glob` + `?raw`, the `yaml` package), server-side; the landing shows the latest entries and (dev only, all posts are drafts) posts.
  - **mdsvex 0.12.8** (stable; `1.0.0-next` is a prerelease) runs from a small `markdown()` Vite plugin in `vite.config.ts`, **not** from `preprocess`: enhanced-img parses every Svelte file in a `'pre'` transform, before preprocessors, and choked on `<enhanced:img>` in prose. The plugin rewrites mdsvex's `<script context="module">` and returns an empty sourcemap; its `/\.md$/` filter keeps `?raw` imports plain text. Phase 7 replaced its Prism with Shiki (`highlight.highlighter`).
  - `/bitacora/[slug]`: `entries()` + frontmatter in `+page.server.ts`, the body from a lazy glob in `+page.ts`, wrapped in `.prose` (global.css `components` layer). `/bitacora` is a timeline grouped by phase.
  - `TeaserCard` takes a resolved `href` (callers use `resolve('/bitacora/[slug]', { slug })`); `RouteWithoutParams` (`src/lib/links.ts`) types links passed to `resolve()` alone. The route view transition names only `.site-header` (pages have their own `<header>`s).
  - Lighthouse a11y 100 on `/bitacora` and an entry, both themes.
  - Interviews: step 1, step 2 and scoped styles are done (Alfonso now understands hash per file, children get the parent's class, `:global()`, custom props via `<svelte-css-wrapper>`).
- **Current: Phase 7 (blog), on `feat/blog`** (started 2026-11-01; Phase 5 still waits for Alfonso's CV data). Step 1 done (uncommitted): drafts live in `content/blog/drafts/` (Alfonso's call), globbed only behind `import.meta.env.DEV` so a build drops them; `Entry.draft` comes from the path; `/blog` (by year) and `/blog/[slug]` like the Bitácora; `ArticleHeader.svelte` shared by both `[slug]` pages; `prerender.handleUnseenRoutes` in `vite.config.ts` ignores only `/blog/[slug]` (no pages while every post is a draft). Step 1 interview done. Step 2 done (uncommitted), interview done: Shiki in `vite.config.ts` (languages load on demand; braces, backticks and backslashes are escaped as HTML entities, because mdsvex's usual template-string pattern drops backslashes). Our own TextMate theme in `src/lib/code-theme.ts` maps scopes to `--code-*` semantic tokens (`tokens.css`; new teal primitive, livelier light palette, all ≥ 5.3:1 on `--surface-2`). Shiki's `createCssVariablesTheme` was tried first and dropped: its docs call it "a lot less granular", and the light theme looked dull. Alfonso understands escaping vs sanitizing (`{@html}` never sanitizes; sanitize if Phase 8 renders markdown we didn't write). Steps 1 and 2 committed (`8b7a484`, `fe74b9a`). Their Bitácora entries (`2026-11-02-drafts-only-in-dev`, `2026-11-02-shiki-code-theme`, copied to the vault) and draft posts are written, uncommitted until Alfonso reviews them. Docs committed. Step 3 done (uncommitted): `minutes` (reading time, 200 wpm, from the raw file) on every `Entry`, shown in `ArticleHeader` and `TeaserCard`; `MarkdownLayout.svelte` wraps every .md (mdsvex `layout`, a file path) and exports `a` = `MarkdownLink.svelte`: `/paths` get the base via `resolve` (type widened, the crawler checks them), `https://` gets `rel="external"`, mdsvex's `rel="nofollow"` is dropped; the plugin also strips mdsvex's `{...$$props}`. Verified `[CV](/cv)` renders `href="../cv"` and `/nope` fails the build. Then, at Alfonso's request: the reading composition is `--reading-width: 80ch` (tokens.css; his pick over a breakout layout or the full 70rem) for text and code; `CodeBlock.svelte` (exported from the layout, used by `highlight()` as `Components.CodeBlock`, which relies on mdsvex importing the layout `* as Components`) frames every block: a bar with the language and a copy button (shown only once JS runs, copies `textContent`, `role="status"` feedback), lines wrap (`pre-wrap`, `overflow-wrap: anywhere`), line numbers are a CSS counter in an in-flow `::before` with a negative margin (absolute broke empty lines), none on one-line blocks; Shiki's `tabindex` is removed (nothing scrolls). The old `.prose pre` rule is gone. Step 3 interview done (Q3 re-checked: tags are already on every `Entry`; the list of all tags is one more step over `allPosts` in `content.ts`). Its Bitácora entries (`2026-11-02-mdsvex-layout-links`, `-reading-time`, `-code-block-frame`, copied to the vault) and drafts (`2026-11-02-markdown-links-with-an-mdsvex-layout`, `-reading-time-at-build-time`, `-a-code-block-frame`) are written; the Shiki and mdsvex drafts link to them. All of step 3 is uncommitted until Alfonso reviews it. Next: tag pages `/blog/tags/[tag]` (RSS dropped, Alfonso's call); `handleUnseenRoutes` will need to ignore that route too while every post is a draft. Open: the `<!-- TODO -->`s in the drafts (mdsvex, scoped styles, styling resources: also check whether the Joy of Code course is free, it answered 402 to a script); an Emmet post (card on the vault board); from 4.5, the optional `wide` composition for `/cv` and the step 3 re-check (Q2 `$effect` for the observer, Q4 sticky min-height). The latest `content/bitacora/` entries have the details.
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
