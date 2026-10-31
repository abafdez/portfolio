# Portfolio — project guide for Claude

Alfonso's personal portfolio, built as a **learning project** (Alfonso is a junior dev).

## How we work

- **Faster learning mode (since Phase 3).** Claude may write the code for each step, then explains the concepts behind it, with doc links.
- **Before moving to the next step, Claude interviews Alfonso** with 2–4 short questions on that step's concepts (the why, not trivia). If an answer is off, clarify and re-check before moving on.
- Keep the code small and in the project's style so Alfonso can read all of it. Point out anything worth trying by hand (small experiments in DevTools or the build output).
- One branch and one PR per phase. Write **one Bitácora entry per topic** (not one per phase), and copy each one to the Obsidian vault project `10 Projects/Portfolio/` (use the `obsidian-obsidianai` skill).
- Write **one `draft: true` blog article per topic** too (e.g. design tokens, cascade layers, dark mode), in `content/blog/`.
- The learning path (phases 0–9) is in [learning-path.md](learning-path.md). Check which phase is current before suggesting work.
- **Progress:** Phases 0–4 done (CI split, TypeScript, layout/routing/base path, Open Props design system, hero landing: PR #6). **Phase 4.5 (Identity & motion) in progress.** Step 1, the theme toggle (sun/moon icon, circular view transition reveal, soft edge with `duration`/`blur` props), is merged in PR #7. The rest continues on `feat/identity-2`, one PR when the phase is done. **Step 2, the dark-first palette and type, is done (interview passed):** an oklch blue-gray `--ink-*` scale and terminal-green accent in `tokens.css`, Fira Code via `--font-heading`/`--font-label`, the sans font for body text. The background is `Blueprint.svelte` (fixed grid, plus marks, a cursor spotlight on fine pointers, which is part of step 3). **Julibe-inspired styling (part of step 3):** accent scrollbar, a header that detaches into a floating bar on scroll (scroll-driven animation, sticky from 48rem), and a footer that slides in with a bobbing hint tab until it does (view timeline). **Step 4 started early:** `Mascot.svelte` with a `costume` prop, review sheet at `/mascot`, brief and image-model prompts in `design/mascot.md`. The mascot is parked on the vault board for later. Bitácora entries and draft posts for the palette, the background and the scroll-driven header/footer are written. Julibe interview passed. **Step 3, the landing layout, is built (interview pending):** two columns from 64rem with a sticky intro (Hero plus `SectionNav.svelte`, a scroll-spy with `IntersectionObserver`), `--header-space` and `scroll-padding` for the sticky header, `proximity` snapping on wide screens, and scroll-driven reveals on each section's content. Not yet written: its Bitácora entry and draft post. Update this line when a phase is merged. The latest `content/bitacora/` entries have the details.
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
