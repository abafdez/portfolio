# Portfolio Learning Path — SvelteKit 3 + Svelte 5 + Open Props + mdsvex + TS

## Context

Alfonso (junior) wants to build a portfolio and level up while doing it. The site has these parts: Hero, CV, Subprojects, Awesome-X, Blog, and Bitácora. The stack is SvelteKit 3, Svelte 5 runes, Open Props, mdsvex markdown, adapter-static and GitHub Pages.

**Working mode (agreed):** Alfonso writes the code. Claude guides each phase with goals, concepts, hints and docs, then reviews the PR-sized diff. Claude gives full solutions only when Alfonso is stuck. Each phase ends with a Bitácora entry written by Alfonso, so the site documents its own construction.

**Current state:** fresh scaffold on branch `styling`.

- [vite.config.js](vite.config.js): adapter-static (`fallback: '404.html'`), runes forced
- [src/routes/+layout.js](src/routes/+layout.js): `prerender = true`
- [src/routes/dev/+page.svelte](src/routes/dev/+page.svelte): hand-written TODO `<details>`, which become the seed Bitácora entries
- [.github/workflows/SK3toGHPages.yaml](.github/workflows/SK3toGHPages.yaml): builds and deploys on push to main **and on PRs**
- JS + JSDoc ([jsconfig.json](jsconfig.json)). Decision: **switch to TypeScript**.

**Issues found to fix along the way (good first lessons):**

1. Hard-coded links (`href="/dev/"`) will break on GitHub Pages if the repo isn't `<user>.github.io`, because of the base path. Lesson: `paths.base` plus `resolve()` from `$app/paths`.
2. Broken href in the dev page: `https://open-props.style/>open-props`.
3. `robots.txt` uses `Disallow: /` and a `noindex` meta is planned. That's a deliberate choice, but it conflicts with a portfolio being findable. Revisit it in Phase 9.
4. The workflow runs `deploy` on `pull_request`. Split it so PRs only build, which also answers the note "test CI without pushing to main".

---

## Phase 0 — Foundations & workflow (½ week)

- **Learn:** git branching, PR flow to `main`, conventional/gitmoji commits, `pnpm` scripts, reading SvelteKit file-based routing.
- **Do:** fix issues 2 and 4. Add `pnpm check` and `pnpm lint` as a CI job on PRs. Write the README with the project's goals.
- **Done when:** a PR runs build and check but doesn't deploy, and merging to main deploys.

## Phase 1 — TypeScript migration (½ week)

- **Learn:** TS basics (types, interfaces, unions, generics lite), `lang="ts"` in Svelte, typing `$props()`, `./$types` for `PageLoad`/`PageData`, `app.d.ts`.
- **Do:** rename `jsconfig.json` to `tsconfig.json`, convert `+layout.js` to `.ts` and `vite.config.js` to `.ts`, and add `lang="ts"` to components.
- **Done when:** `pnpm check` reports 0 errors and 0 warnings.

## Phase 2 — Layout, routing & base path (1 week)

- **Learn:** `+layout.svelte`, snippets/`children`, `$app/paths` (`resolve`), `$app/state` (`page.url` for active nav), semantic HTML (header/nav/main/footer), a11y basics.
- **Do:** create routes `/`, `/cv`, `/projects`, `/awesome`, `/blog`, `/bitacora` (replaces `/dev`) as stubs. Build a shared `Header`/`Nav`/`Footer` in `src/lib/components/` and fix issue 1.
- **Done when:** every route is reachable from the nav on the deployed GH Pages URL, and the active link is highlighted.

## Phase 3 — Design system with Open Props (1–1.5 weeks)

- **Learn:** CSS custom properties, cascade layers, Open Props tokens (size, font, color, shadow), the `normalize`/`buttons` imports, `prefers-color-scheme`, a light/dark toggle with a `$state` rune plus `localStorage`, fluid type, container queries, and Svelte scoped vs `:global` styles.
- **Do:** install `open-props`. Create `src/lib/styles/{tokens,global}.css` with your own semantic tokens (`--surface-1`, `--text-1`, `--brand`) mapped onto Open Props. Self-host fonts (from the dev-page TODO) and add a theme toggle component.
- **Done when:** the theme switches without a flash (an inline script in `app.html`) and contrast passes the Lighthouse a11y check.

## Phase 4 — Hero landing (1 week)

- **Learn:** component composition, props typing, `@sveltejs/enhanced-img` (already installed), CSS grid, `transition:`/`animate:` directives, `prefers-reduced-motion`.
- **Do:** build the Hero (name, tagline, CTA links) and add "latest posts / featured projects" teasers. Leave these as placeholders until Phases 6–7.
- **Done when:** the page is responsive from 320px to desktop and respects reduced motion.

## Phase 4.5 — Identity & motion (2 weeks)

Added after Phase 4. The site gets a look that stands out: **technical** (terminal, monospace, blueprints, code), **designed for dark first** (light is adapted afterwards), animated, and with a mascot. The theme colors and tokens stay shared across the site. Each route gets its own composition (layout, navigation) and one signature trick.

- **Learn:** the View Transitions API (`startViewTransition`, transition types, the `::view-transition-*` pseudo-elements, SvelteKit's `onNavigate`), SVG basics (`viewBox`, `mask`, animating shapes with CSS), scroll-driven animations (`animation-timeline: view()`/`scroll()` behind `@supports`), `IntersectionObserver` for scroll-spy, pointer media queries (`pointer: fine`), progressive enhancement.
- **Do:**
  1. ✅ A theme toggle with a sun/moon icon and a circular reveal from the button (inspired by [nerdy.dev](https://nerdy.dev)). Merged in PR #7.
  2. ✅ A dark-first technical identity: palette, monospace type, blueprint/grid backgrounds.
  3. ✅ The landing layout (inspired by [brittanychiang.com](https://brittanychiang.com)): a sticky intro beside scrolling sections, a scroll-spy nav, a cursor spotlight on fine pointers, and scroll-driven reveals for mobile.
  4. The mascot as an animated SVG. **Moved to later:** a draft exists (`Mascot.svelte`, `/mascot`, `design/mascot.md`).
  5. ✅ View transitions between routes, plus a way for each route to set its own composition.
  6. ✅ The real tagline.
- **Done when:** the Phase 4 checks still pass, every effect is an enhancement (no JS, no view transitions or reduced motion still give a complete site), and the dark theme is the polished one.
- **Status:** ✅ merged in PR #8 (2026-10-31). Step 4, the mascot, moved to later.

Each later route phase (5–8) also builds that route's own composition and trick. Projects (Phase 8) can use three.js, loaded only on that page and with a static fallback.

## Phase 5 — CV from data (1 week)

- **Learn:** separating data from presentation, TS types for data (`src/lib/data/cv.ts`), `{#each}` with keys, `$derived`, print CSS (`@media print`).
- **Do:** create typed CV data (experience, education, skills) and add a filterable skills list using `$state`/`$derived`. Add a print stylesheet so the CV prints well and "Save as PDF" works.
- **Done when:** the browser print preview looks like a real CV.
- **Changed (2026-11-03, Alfonso's call):** no public CV: it has contact details and employers, so it's sent on request. Phase 5 became `/about` on `feat/about`: skills as typed data (`src/lib/skills/skills.ts`) in groups, with levels and evidence links, brand icons (Lucide + Simple Icons, OKLCH brand hues at the theme's lightness), terminal windows with htop bars that fill on view, a border spotlight and a logo marquee, and LinkedIn/GitHub buttons to ask for the CV. Print CSS moved to Phase 5.5. The skills then moved to `content/skills.yaml` with job profiles (web, support, mainframe), icons as data and a `/logos.svg` sprite endpoint. Then collapsible, animated windows. Ready for its PR (2026-11-03); the profile filter moved to Phase 5.5.

## Phase 5.5 — CV builder (1–1.5 weeks)

- **Why:** Alfonso applies for different kinds of jobs (web, support, mainframe) and needs a CV for each, readable by applicant tracking systems (ATS).
- **Learn:** print CSS (`@media print`, `@page`, page breaks), what ATS parsers need (one column, real text, standard headings, no tables, images or icons), forms and validation in Svelte, `localStorage` behind a `$state` class, importing and exporting a JSON file (File API, `Blob`, a download link), the Clipboard API.
- **Do:** first, a profile filter on `/about` (`?profile=support`, shareable, like the Awesome filters). Then a `/projects/cv` tool. Pick a profile, and the skills come from `content/skills.yaml` (only that profile's, strongest first). The personal part (contact, experience, education) is typed into a form or imported from a JSON file Alfonso keeps; it stays in the browser (`localStorage`) and never reaches the repo or the build. A print stylesheet makes "Save as PDF" give an ATS-friendly text PDF. Optional later: a plain-text copy, `.docx`.
- **Done when:** for each profile, the PDF from the print dialog reads well, selecting all its text gives the CV in order, and a reload keeps the data while the repo has none of it.

## Phase 6 — Markdown with mdsvex: Bitácora (1.5 weeks)

- **Learn:** preprocessors, mdsvex config (`extensions: ['.svelte', '.md']`), frontmatter, `import.meta.glob` (eager), `+page.ts` `load`, dynamic routes `[slug]`, `entries()` for prerendering, sorting dates.
- **Do:** set up `src/content/bitacora/*.md` with typed frontmatter (`title`, `date`, `tags`) and write a `src/lib/content.ts` helper that returns a typed, sorted list. Build `/bitacora` as a timeline and `/bitacora/[slug]`. **Migrate each `<details>` from the dev page into its own entry.**
- **Done when:** adding a `.md` file is the only step needed to publish an entry, and `pnpm build` prerenders it (strict mode passes).
- **Notes:** done before Phase 5. The markdown lives in `content/` at the repo root, not `src/content/`. Started early on `feat/content`: a frontmatter-only `src/lib/content.ts` (the `yaml` package) feeds the landing. Rendering the bodies is still open: mdsvex broke on code samples in the posts (see the Progress line in CLAUDE.md).

## Phase 7 — Blog (1–1.5 weeks)

- **Learn:** reuse the Phase 6 helper (generalise it with a generic `<T>`), custom mdsvex layouts, syntax highlighting (Shiki), components inside markdown, tag pages, reading time. (RSS dropped: Alfonso's call, 2026-11-02.)
- **Do:** build `/blog`, `/blog/[slug]`, and `/blog/tags/[tag]`. Support draft posts that are hidden in production.
- **Done when:** code blocks are highlighted, posts can be browsed by tag, and drafts don't ship.
- **Status:** ✅ merged in PR #10 (2026-11-02). Drafts live in `content/blog/drafts/` and never reach a build; code blocks get our own Shiki theme and a frame (language, copy, line numbers); reading time; tag pages.

## Phase 8 — Subprojects & Awesome-X (1.5 weeks)

- **Learn:** modular feature folders, client-only code (`browser`, `onMount`), Web APIs (Clipboard, Canvas, Web Audio, etc.), `$state` classes, `$effect` and when _not_ to use it, and search/filter UX.
- **Subprojects:** create `/projects` as a card grid from data, plus `/projects/[tool]` where each tool is a small self-contained Svelte app. Start with one small tool, for example a color/contrast checker built on your own tokens.
- **Awesome-X:** create `/awesome/[list]` from markdown or JSON (categories, links, descriptions, tags). Add client-side search and tag filtering with `$derived`, and optionally sync the state into URL search params.
- **Done when:** there's at least one working tool and one awesome list, and both are filterable and shareable via URL.
- **Status:** on `feat/projects` (branched 2026-11-02). Step 1 ✅: `/projects` from data and the contrast checker (`/projects/contrast`, shareable via URL). Step 2 ✅: Awesome lists from YAML (`content/awesome/*.yaml`, not markdown: a list is data), search + tag filters in a `$state` class, saved in the URL. Next: the PR.

## Phase 9 — Quality, SEO & polish (1 week)

- **Learn:** `<svelte:head>` meta and Open Graph, a sitemap route, Lighthouse, unit tests with Vitest for `content.ts`, e2e smoke tests with Playwright, and adding tests to CI.
- **Do:** decide on robots/noindex (issue 3), add a reusable `Seo` component, test the content helpers, and run an e2e check that every nav link loads.
- **Done when:** CI runs check, lint, test and build on PRs, and Lighthouse scores are ≥ 90 across the board.

## Ongoing habits

- One branch and one PR per phase (or sub-step). Ask Claude for a review before merging.
- Write a Bitácora entry per phase covering what you learned, what broke, and links.
- Use the Svelte MCP autofixer and docs when unsure about runes or Kit APIs.

## Target structure (end state)

```
src/
  content/{blog,bitacora,awesome}/*.md
  lib/{components,styles,data,content.ts,types.ts}
  routes/{cv,projects/[tool],awesome/[list],blog/[slug],bitacora/[slug]}
```

## Verification (each phase)

- `pnpm check` and `pnpm lint` are clean, and `pnpm build` succeeds (adapter-static `strict` catches non-prerenderable routes).
- `pnpm preview`, then click through the pages in the browser (Claude can drive Playwright to verify).
- The PR CI is green; after merging, check the live GitHub Pages URL.

## First step after approval

Start Phase 0: Claude explains the workflow split and the fix for the broken href, and Alfonso implements them on a new branch. The current uncommitted change on `styling` should be committed or stashed first.
