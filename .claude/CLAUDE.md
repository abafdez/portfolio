# Portfolio — project guide for Claude

Alfonso's personal portfolio, built as a **learning project** (Alfonso is a junior dev).

## How we work

- **Faster learning mode (since Phase 3).** Claude may write the code for each step, then explains the concepts behind it, with doc links.
- **Before moving to the next step, Claude interviews Alfonso** with 2–4 short questions on that step's concepts (the why, not trivia). If an answer is off, clarify and re-check before moving on.
- Keep the code small and in the project's style so Alfonso can read all of it. Point out anything worth trying by hand (small experiments in DevTools or the build output).
- One branch and one PR per phase. Write **one Bitácora entry per topic** (not one per phase), and copy each one to the Obsidian vault project `10 Projects/Portfolio/` (use the `obsidian-obsidianai` skill).
- Write **one `draft: true` blog article per topic** too (e.g. design tokens, cascade layers, dark mode), in `content/blog/`.
- The learning path (phases 0–9) is in [learning-path.md](learning-path.md). Check which phase is current before suggesting work.
- **Progress:** Phases 0–4 done (CI split, TypeScript, layout/routing/base path, Open Props design system, hero landing: PR #6). **Phase 4.5 (Identity & motion) is built on `feat/identity-2`, ready for its PR** (step 1, the theme toggle, was merged in PR #7). Steps 2, 3, 5 and 6 are done: the oklch dark-first palette, Fira Code headings/labels and the `Blueprint.svelte` background; the Julibe styling (accent scrollbar, detaching header, footer hint); the landing (sticky intro with `SectionNav.svelte` scroll-spy, `--header-space`/`scroll-padding`, `proximity` snapping, `clip-path` scroll reveals); route view transitions (`onNavigate`, type `route`, sliding nav `.marker`, shared `canTransition()`); per-route composition (`App.PageData.composition`, `<main data-composition>`, `reading` for blog and bitácora); and the tagline. Lighthouse accessibility is 100 on home, blog and bitácora in both themes. **Step 4, the mascot, moved to later** (draft: `Mascot.svelte`, `/mascot`, `design/mascot.md`; card on the vault board). Open interview items: the step 3 re-check (Q2 `$effect` for the observer, Q4 sticky min-height) was explained, not re-answered; the optional `wide` composition exercise for `/cv` is still open. **Next:** the 4.5 PR (Alfonso pushes and opens it), then the PR for **`feat/content`** (Phase 6 groundwork: `src/lib/content.ts` cards on the landing), then Phase 5. Update this line when a phase is merged. The latest `content/bitacora/` entries have the details.
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
