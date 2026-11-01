# Portfolio — project guide for Claude

Alfonso's personal portfolio, built as a **learning project** (Alfonso is a junior dev).

## How we work

- **Faster learning mode (since Phase 3).** Claude may write the code for each step, then explains the concepts behind it, with doc links.
- **Before moving to the next step, Claude interviews Alfonso** with 2–4 short questions on that step's concepts (the why, not trivia). If an answer is off, clarify and re-check before moving on.
- Keep the code small and in the project's style so Alfonso can read all of it. Point out anything worth trying by hand (small experiments in DevTools or the build output).
- One branch and one PR per phase. Write **one Bitácora entry per topic** (not one per phase), and copy each one to the Obsidian vault project `10 Projects/Portfolio/` (use the `obsidian-obsidianai` skill).
- Write **one `draft: true` blog article per topic** too (e.g. design tokens, cascade layers, dark mode), in `content/blog/`.
- The learning path (phases 0–9) is in [learning-path.md](learning-path.md). Check which phase is current before suggesting work.
- **Progress:** Phases 0–4.5 done. Phase 4.5 (Identity & motion: oklch dark-first palette, Fira Code, blueprint background, Julibe scroll styling, landing with sticky intro and scroll-spy, route view transitions, per-route composition, tagline) is merged in PR #8; the mascot moved to later (draft at `/mascot`, `design/mascot.md`, card on the vault board). **Current: Phase 6 (content), on `feat/content`, before Phase 5** (Alfonso's call on 2026-10-31; Phase 5 needs his real CV data). Already on the branch: `src/lib/content.ts` returns typed, sorted lists from the **frontmatter only** of `content/blog` and `content/bitacora` (`import.meta.glob` with `?raw`, parsed with the `yaml` package), read in the landing's `+page.server.ts` so markdown never ships to the browser; the landing shows the 4 latest Bitácora entries and (in dev only, all posts are drafts) the 3 latest posts; `TeaserCard` has optional `date` and `tags`. **Decided (2026-10-31): mdsvex 0.12.8** (stable; the `1.0.0-next` rewrite is a prerelease). It runs from a small `markdown()` Vite plugin in `vite.config.ts`, not from `preprocess`: enhanced-img's markup plugin parses every Svelte file in a `'pre'` transform, before preprocessors, and choked on `<enhanced:img>` in prose. The plugin also rewrites mdsvex's Svelte 4 `<script context="module">`. `/bitacora/[slug]` works (step 1): `entries()` + frontmatter in `+page.server.ts`, the body component from a lazy `import.meta.glob` in `+page.ts`. `RouteWithoutParams` (`src/lib/links.ts`) replaced `RouteId` for links passed to `resolve()` alone. Step 2 done: `.prose` in global.css's `components` layer, `/bitacora` as a timeline grouped by phase, and `TeaserCard` takes a resolved `href` (callers use `resolve('/bitacora/[slug]', { slug })`). The route view transition now names only `.site-header`: pages have their own `<header>`s. The dev page's old `<details>` notes were removed (Alfonso's call; an Emmet post is a card on the vault board). Next: commit, then the Phase 6 PR (Alfonso pushes). Open from 4.5: the optional `wide` composition exercise for `/cv`; the step 3 re-check (Q2 `$effect` for the observer, Q4 sticky min-height) was explained, not re-answered. Update this line when a phase is merged. The latest `content/bitacora/` entries have the details.
- When the work changes something a `draft: true` post in `content/blog/` describes, update that post too. Leave `<!-- TODO -->` placeholders where Alfonso's own code goes rather than writing the solution into the post.

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
