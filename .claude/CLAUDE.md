# Portfolio — project guide for Claude

Alfonso's personal portfolio, built as a **learning project** (Alfonso is a junior dev).

## How we work

- **Faster learning mode (since Phase 3).** Claude may write the code for each step, then explains the concepts behind it, with doc links.
- **Before moving to the next step, Claude interviews Alfonso** with 2–4 short questions on that step's concepts (the why, not trivia). If an answer is off, clarify and re-check before moving on.
- Keep the code small and in the project's style so Alfonso can read all of it. Point out anything worth trying by hand (small experiments in DevTools or the build output).
- One branch and one PR per phase. Write **one Bitácora entry per topic** (not one per phase), and copy each one to the Obsidian vault project `10 Projects/Portfolio/` (use the `obsidian-obsidianai` skill).
- Write **one draft blog article per topic** too (e.g. design tokens, cascade layers, dark mode), in `content/blog/drafts/`. Drafts only exist in dev; publishing a post means moving it up to `content/blog/` (Alfonso's call).
- The learning path (phases 0–9) is in [learning-path.md](learning-path.md). Check which phase is current before suggesting work.
- **Progress:** Phases 0–4.5, 6, 7 and 8 done (4.5 merged in PR #8, 6 in PR #9, 7 in PR #10 on 2026-11-02, 8 in PR #11). Phase 6–8 were done before Phase 5 (Alfonso's call: Phase 5 needed his real CV data). The mascot moved to later (draft at `/mascot`, `design/mascot.md`, card on the vault board). What Phase 6 built:
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
- **What Phase 8 built** (merged in PR #11). If we ever render markdown we didn't write (Awesome lists from outside), sanitize it: `{@html}` never does.
  - **Step 1 done** (Bitácora `2026-11-02-contrast-checker`, draft `a-contrast-checker-for-my-own-tokens`): `src/lib/projects/` is the feature folder (`projects.ts`, a typed list whose `tool` is a dynamic `import()`, plus one folder per tool). `/projects` card grid (a "Tools" `h2` for heading order), `/projects/[tool]` (`entries()` + universal `+page.ts` returning the component), landing teasers from the list. The **contrast checker** reads tokens in the browser (hidden probe + `getComputedStyle` + 1×1 canvas → sRGB, WCAG ratios cut not rounded), the pair in `?text=&surface=` read in `onMount` (no `searchParams` while prerendering) and written with `goto(url, { shallow: true, replace: true })`; the layout's `onNavigate` skips `navigation.shallow`. **`tokens.css` now declares the tokens on `:root, [data-theme]`** and the theme rules are `[data-theme='…']` without `:root`: Chrome resolves `light-dark()` in a custom property where it's declared, so a child's `color-scheme` couldn't flip inherited tokens. Lighthouse a11y 100 on `/`, `/projects`, the tool, both themes; no scroll at 320px.
  - **Step 2 done** (Bitácora `2026-11-02-awesome-list-filters`, draft `filters-in-a-svelte-class`): Awesome lists are **YAML** in `content/awesome/<slug>.yaml` (data, not prose), loaded by `src/lib/awesome/awesome.ts` (build fails on a non-https url or a bad tag; `checkTags` exported from `content.ts`). `LinkFilter` in `filter.svelte.ts` (`$state` query/tags, `$derived` results/count, `params`/`read()`; categories passed as a getter). `AwesomeList.svelte` renders the filters only after `onMount` (no-JS = full list), writes `?q=&tag=` with a shallow goto via a function binding, `aria-pressed` toggles, `role="status"` count, Clear focuses the search box. `/awesome/[list]` wraps it in `{#key list.slug}`. First list: Modern CSS (25 links from docs the Bitácora cites; Alfonso to review). Lighthouse a11y 100 on `/awesome` and the list, both themes; no scroll at 320px.
  - Still open from Phase 8: Alfonso reviews the Modern CSS list. Optional: a three.js trick for `/projects` (learning path).
- **Current: Phase 5, now `/about`, on `feat/about`** (branched from `main` after PR #11, 2026-11-03). **The CV stays private** (phone, email, employers): never commit it or put its contact data, employer names or dates on the site; only skills go public. `/cv` was removed; nav "About". The `2026-11-03-*` Bitácora entries have the details:
  - `src/lib/skills/`: `skills.ts` (typed groups → skills with `level` 1–4, `note`, `evidence` union narrowed with `in`, `evidenceHref()`), `Skill.svelte` (a row; `<details>` when it has more; level word visually-hidden-comma'd, bar `aria-hidden`), `brand-color.ts` (hex → OKLab hue/chroma, chroma ≤ 0.17), `BrandIcon.svelte` (Simple Icons path, `currentColor`). Icons: `@lucide/svelte` (import one file each) + `simple-icons` (no LinkedIn/VS Code/Adobe/IBM). Brand color: `--glow: oklch(from var(--icon-tone) l var(--chroma, c) var(--hue, h))` on the row; `--icon-tone` in `tokens.css`.
  - Look (picked from three showcase branches, now deleted): terminal windows (title bar, `contain: inline-size` path), htop bars (`[||||||......]`, text ticks, `1ch` each). `fill.ts`: one shared IntersectionObserver (`threshold: 1`) on the **bar** (a clipped fill never counts as visible) sets `data-filling` + a cascade `--delay`; the fill starts empty under `@media (scripting: enabled) and (prefers-reduced-motion: no-preference)`; `count-up` keyframes need `inset()` at **both** ends (`inset()` ↔ `none` doesn't interpolate). `spotlight.ts`: `--x/--y` on every row, a masked 1px ring (`content-box exclude`) in `--glow`, edges only. Hover: spring `scale` on the bar, a blinking block cursor on its last tick. `LogoMarquee.svelte`: never pauses (still under reduced motion), second copy via `<use href="#logo-…">`.
  - `SectionNav.svelte` (also the landing): scroll-spy from positions on every scroll (last section whose top passed innerHeight/3; first before that, last at the bottom), not an IntersectionObserver, which desynced on fast scrolls.
  - Verified: Lighthouse a11y 100 both themes, performance 93 (HTML ~278 KB: the logo paths are in the rows and the marquee; an SVG sprite would fix it). No scroll at 320px; reduced motion and no-JS show full bars.
  - **Next:** Alfonso reviews the levels, the intro text and the extra groups (Ways of working, AI workflows), then pushes and opens the PR. Optional: the SVG sprite.
- **Publishing drafts** is Alfonso's call, one `git mv` from `content/blog/drafts/` to `content/blog/`. [drafts-to-publish.md](drafts-to-publish.md) lists each draft's TODOs and its links to other drafts. A published post can't link to a draft: the crawler fails the build (`prerender_http_error`, tested). Once one post is live, remove `handleUnseenRoutes`' exceptions in `vite.config.ts`.
- **Open for Alfonso:** pick `a11y` or `accessibility` as a tag; the `/blog` tag index reads as "#css 17" to a screen reader (an `aria-label` or a hidden "posts" would fix it); "components inside markdown" is only covered by the layout's components so far; check whether the Joy of Code course is free (it answered 402 to a script); an Emmet post (card on the vault board); from 4.5, the step 3 re-check (Q2 `$effect` for the observer, Q4 sticky min-height). From Phase 8 step 1 (Alfonso skipped the re-check): why `color: light-dark(red, blue)` on the probe follows its `color-scheme` but `var(--text-1)` doesn't; where Back lands after 5 picks with and without `replace: true`.
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
