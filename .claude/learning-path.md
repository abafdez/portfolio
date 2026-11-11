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
3. `robots.txt` uses `Disallow: /` and a `noindex` meta is planned. That's a deliberate choice, but it conflicts with a portfolio being findable. Revisit it in Phase 9. **Decided 2026-11-04: findable.** The file was never read anyway (crawlers only read `robots.txt` at the host root, and this is a project site under `/portfolio/`), so it's gone; `noindex` only on `/mascot`.
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
- **Changed (2026-11-03, Alfonso's call):** no public CV: it has contact details and employers, so it's sent on request. Phase 5 became `/about` on `feat/about`: skills as typed data (`src/lib/skills/skills.ts`) in groups, with levels and evidence links, brand icons (Lucide + Simple Icons, OKLCH brand hues at the theme's lightness), terminal windows with htop bars that fill on view, a border spotlight and a logo marquee, and LinkedIn/GitHub buttons to ask for the CV. Print CSS moved to Phase 5.5. The skills then moved to `content/skills.yaml` with job profiles (web, support, mainframe), icons as data and a `/logos.svg` sprite endpoint. Then collapsible, animated windows. **Status:** ✅ merged in PR #12 (2026-11-03); the profile filter moved to Phase 5.5.

## Phase 5.5 — CV builder (1–1.5 weeks)

- **Status:** ✅ merged in PR #13 (2026-11-03). Profile filter on `/about`; `/projects/cv` with the form in `localStorage`, print to PDF, export/import, native validation, skill edits and reordering per profile, an editable preview. Still to do by hand: print the three CVs with real data.

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

## Phase 8.5 — Toolbox (Alfonso's idea 2026-11-09, branch `feat/toolbox`)

- **Goal:** a dashboard of small browser-only tools at `/projects/toolbox` (each tool at `/projects/toolbox/<tool>`), in the site's own look (terminal windows). We pick and choose ideas from several collections, not one: [Omatsuri](https://github.com/rtivital/omatsuri) (MIT, where the first list of ideas came from), [it-tools](https://github.com/CorentinTh/it-tools), [DevToys](https://github.com/DevToys-app/DevToys), [tiny-helpers](https://github.com/stefanjudis/tiny-helpers).
- **Credit (decided 2026-11-09, Alfonso):** the toolbox names no source. A licence covers code and data, not ideas: a Base64 converter is everyone's idea, and a credit for code we didn't copy would say something untrue. So **a tool credits a project only when it ships that project's code or data**, on that tool, with what the licence asks (MIT: the copyright line and the licence text, on the page, since the built site is a copy). We first built a dashboard credit line for Omatsuri and removed it the same day (in git history).
- **Sources, by licence** (checked 2026-11-09): MIT, code can be ported: Omatsuri, [color-color](https://github.com/saneef/color-color) (Svelte, Okhsl palettes), [huetone](https://github.com/ardov/huetone) (accessible palettes), [svgomg](https://github.com/jakearchibald/svgomg), [transform](https://github.com/ritz078/transform). Apache-2.0 (keep their NOTICE, say what changed): CyberChef, Squoosh, Leonardo. **Ideas only, no code:** it-tools (GPL-3.0 would pull the site's code under the GPL), Clippy (no licence = all rights reserved).
- **Learn:** the File API and drag and drop, the Clipboard API, text encodings (why `btoa()` throws on "ñ"), `KeyboardEvent` (`key` vs `code` vs the deprecated `keyCode`), HTML entities vs CSS escapes vs code points, search over a data table, and reading someone else's code critically before borrowing from it.
- **Step 1 — Dashboard + Base64:** the toolbox's own list (same shape as `projects.ts`), the dashboard grid, `/projects/toolbox/[tool]`, a fourth breadcrumb level (Home / Projects / Toolbox / tool), sitemap, both languages. First tool: Base64, text ↔ Base64 as UTF-8 (`TextEncoder`), a file → data URL (`FileReader`, drop or pick), copy buttons. No worker: reading a file is already async.
- **Step 2 — Keyboard events:** press a key in a focused area (not the whole window, so Tab still leaves) and see `key`, `code`, modifiers, `location`, and a generated `keydown` snippet.
- **Step 3 — HTML symbols, extended** (started 2026-11-09, before step 2: Alfonso's call; W3Schools' charset pages as a reference for the groups, ideas only, their tables are their own): our own data, made once by `scripts/symbols.ts` (`pnpm data:symbols`) from Unicode's `UnicodeData.txt` + `Blocks.txt` (Unicode License v3) and the HTML spec's `entities.json` (CC BY 4.0) into `symbols/symbols.json` (19 blocks + every character HTML names: 3,169 characters, 1,431 named; 141 KB, 33 KB gzip; one character per line, prettier-ignored). Every other form (decimal/hex references, CSS and JS escapes, URL, UTF-8 bytes, UTF-16 units) is computed from the code point. The tool credits both sources on its page (`ToolCredits.svelte`, Unicode's notice in full). Search by words, a pasted character, U+XXXX or an entity; groups in a select; a details panel with copy buttons. Names stay as Unicode names (English); the UI is translated. **Tweaks to come with Alfonso.**
- **Also from step 3: a ```yt block** (Alfonso): a YouTube video as a card (its thumbnail as a local file, title, "opens in a new tab"), a plain link, nothing from Google on the page. And a UTF-8 post (Alfonso), mentioning Dylan Beattie's talk.
- **Step 4 — Lorem ipsum:** classic lorem only (no generators made of someone else's names or quotes); paragraphs/sentences/words, copy as text or HTML.
- **Later batches (each its own PR):** colour (shades, a color-color port next to the contrast checker); SVG (SVGO in a web worker, SVG → Svelte); fake data (check faker's licence and size first). No CSS generators (Alfonso, 2026-11-09). **Built 2026-11-09 (Alfonso's design): a CSS cursors tool** that mixes `cursor` (every keyword, and SVG cursors with `url(…) x y, fallback`), `pointer-events`, `user-select` and `::selection` in one playground, from MDN's reference pages (https://developer.mozilla.org/en-US/docs/Web/).
- **Done when:** the dashboard lists the first four tools in both languages, any tool that ships someone's code or data credits it as its licence asks, every tool works without a server, and Lighthouse a11y is 100 in both themes with no horizontal scroll at 320px.
- **Status:** planned 2026-11-09 (Alfonso picked: `/projects/toolbox`, quick wins first, terminal-window tiles; the footer credit was removed the same day). Step 1 ✅ 2026-11-09 (Devlog `2026-11-09-a-toolbox-and-its-sources` and `2026-11-09-base64-is-bytes`; drafts `2026-11-09-what-the-mit-licence-asks` and `2026-11-09-base64-encodes-bytes-not-text`). Next: step 2, keyboard events. Step 3 (HTML symbols) ✅ 2026-11-09 with Alfonso's refinements (Devlog `2026-11-09-symbols-from-the-source`, `2026-11-09-youtube-without-youtube`). **Cursors and selection** ✅ 2026-11-09 as a tool and a guide (`/projects/toolbox/cursors`, Devlog `2026-11-09-cursors-and-selection`). Still to do: step 2 (keyboard events), step 4 (lorem ipsum); drafts for the symbols tool and the yt block (the cursors page is already a guide: ask Alfonso whether it also needs a post).

## Phase 9 — Quality, SEO & polish (1 week)

- **Learn:** `<svelte:head>` meta and Open Graph, a sitemap route, Lighthouse, unit tests with Vitest for `content.ts`, e2e smoke tests with Playwright, and adding tests to CI.
- **Do:** decide on robots/noindex (issue 3), add a reusable `Seo` component, test the content helpers, and run an e2e check that every nav link loads.
- **Done when:** CI runs check, lint, test and build on PRs, and Lighthouse scores are ≥ 90 across the board.
- **Status:** steps 1–3 merged (PR #15 SEO + Vitest, PR #16 Playwright smoke test + tests in CI, 2026-11-06). Step 4 (Lighthouse ≥ 90, layout-shift fixes) merged in PR #17. ✅ Phase 9 done 2026-11-06. Optional: `BreadcrumbList` structured data.

## Phase 9.5 — Components in markdown (planned 2026-11-06, Alfonso's idea)

- **Goal:** richer posts (callouts, videos, small demos) written in a syntax that **still reads well where it isn't supported**: Obsidian, GitHub, a plain editor. Its own branch, after `feat/post-folders` merges.
- **Learn:** how mdsvex turns markdown into a Svelte component (markdown tree → HTML tree → Svelte code); remark plugins (markdown tree) vs rehype plugins (HTML tree); the hooks we already have: the `highlight` function (gets each code block's `code` and `lang`), `enhanceMedia()`, and the layout's components (`a`, `CodeBlock`).
- **Step 1 — Callouts:** `> [!note]`, the syntax GitHub (as "alerts") and Obsidian (as "callouts") both render natively; elsewhere it's a readable blockquote. GitHub's five types (note, tip, important, warning, caution), Obsidian's custom title (`> [!tip] My title`), maybe its folding (`> [!note]-` → `<details>`). An `<aside>` with an icon and the type as text (not colour alone), one token per type, contrast checked in both themes. mdsvex 0.12 bundles an old markdown parser (`remark-parse` 8), so modern remark plugins may not run: do it on the HTML tree (a rehype plugin, like `rehype-slug`) or in our own step. Unit tests.
- **Step 2 — Fenced-block components:** a code block whose language is a component name, with YAML as its body:
  ````md
  ```video
  src: ./awesome-list-shift.mp4
  caption: The filters appear after the list has loaded.
  ```
  ````
  The `highlight` function sees `lang: video` and returns the component instead of highlighted code (a registry of names → Svelte components, like `CodeBlock`). The YAML is checked at build time: an unknown field or a missing required one fails the build, naming the file. Anywhere else it shows as a readable block of YAML. First component: `video` (replaces the `<video>` HTML; width and height still required, or read from the file), then candidates like `compare` (before/after) or a live demo.
- **Considered, not now — generic directives** (`:::note`, `::video{src=…}`, `:abbr[CSS]{title=…}`): the CommonMark proposal, implemented by `remark-directive` and used by Docusaurus and Astro Starlight. Three reasons: (1) `remark-directive` needs the newer parser (micromark), which mdsvex 0.12 doesn't have; revisit with mdsvex 1.0. (2) Obsidian has no generic support: the only plugin found, [obsidian-docusaurus-style-admonitions](https://github.com/rwbr/obsidian-docusaurus-style-admonitions), handles `:::note`-style boxes (5 types) and nothing else; without it, Obsidian and GitHub show the colons. (3) Text directives can eat ordinary prose: [Docusaurus v3](https://docusaurus.io/docs/3.0.1/migration/v3) rendered "re:Invent" as "re", because `:Invent` parsed as a directive.
- **Side project (vault board):** an Obsidian plugin that draws the same fenced blocks in notes (`registerMarkdownCodeBlockProcessor`, TypeScript), so the vault looks like the site.
- **Status:** step 1 (callouts) and step 2 (`video` block) done 2026-11-07 on `feat/markdown-components`. Left for "Done when": Alfonso checks both drafts in Obsidian and on GitHub; Lighthouse performance on a post with a video once one is published (drafts aren't in a build).
- **Done when:** a post can use callouts and at least one fenced-block component, the same file reads well in Obsidian and on GitHub, a broken block fails the build, and Lighthouse stays ≥ 90 with a11y 100.

## Phase 10 — English and Spanish (Alfonso's idea 2026-11-06; decided 2026-11-08, branch `feat/i18n`)

- **Goal:** the whole site in both languages, English the default.
- **Learn:** i18n (internationalisation) vs l10n (localisation); locale in the URL (`/es/…`) and SvelteKit's `reroute` hook; `<html lang>` per page (`app.html` has `lang="en"` fixed today); `hreflang` alternates and `og:locale` in `Seo.svelte` and the sitemap; formatting dates and plurals with `Intl` (`DateTimeFormat`, `PluralRules`).
- **Homemade, not Paraglide** (Alfonso, 2026-11-08). Paraglide only covers UI strings, the small part here (the bulk is markdown and YAML); its URL handling is the same `reroute` hook we can write in a few lines; v3 was days old (3.0.0 on 2026-11-03, four releases in five days) and its docs assume a running server (cookie strategy, middleware). Ours is shaped like Paraglide's, so moving later is mostly an import change.
- **Decisions (Alfonso's interview, 2026-11-08):**
  - **URLs:** same paths with an `/es` prefix (`/portfolio/es/blog/<slug>`, `/portfolio/es/projects/cv`); no translated sections or slugs. A `reroute` hook in `src/hooks.ts` strips `/es`, so route ids don't change (Breadcrumbs, the nav's `aria-current`, `isInside()`, `resolve('/blog/[slug]', …)` and `RouteWithoutParams` keep working); a link helper adds `/es` back. Not an optional `[[lang]]` folder, which would change every route id.
  - **Spanish from Spain, `lang="es-ES"`** (tú, ordenador; dates like "8 de noviembre de 2026"). `hreflang="es-ES"`, `og:locale` `es_ES` / `en_GB` or `en_US` (pick in the spike).
  - **Messages are functions, Paraglide-shaped:** `m.blogTitle()`, `m.postCount({ count })`, plain strings too. `src/lib/i18n/` with `en.ts` and `es.ts` (`satisfies` the English shape, so a missing key fails `pnpm check`); the locale comes from the URL in the root layout's load, never a module-level global (prerendering renders pages in one process).
  - **No language detection:** English at `/portfolio/`, Spanish at `/portfolio/es/`, only the switch (GitHub Pages is static; hreflang sends Spanish searchers to `/es/`).
  - **The switch:** one link in the header next to the palette picker and the theme toggle, "ES" on English pages (`lang="es"`, `hreflang="es-ES"`, accessible name "Leer en español") and "EN" on Spanish ones; same page in the other language. A plain `<a>`, so the prerender crawler finds every `/es/` page through it.
  - **Everything is translated:** UI, `/about`, the CV builder, section pages, projects, the Awesome list, all published posts, **all Bitácora entries**, and **all 29 drafts**. From now on, new entries and drafts are written in both languages (update the `bitacora-entry` skill). A draft's later edits go into both files.
  - **Claude translates, Alfonso spot-checks.** Each Spanish file has `reviewed: false` in its frontmatter until Alfonso reads it; in dev only, a badge (like `PostStatus`) shows "sin revisar"; nothing in production.
  - **Untranslated pages** (until the batches are done, and any future gap): listed on Spanish pages with an "en inglés" badge; `/es/<…>/<slug>` renders the English text inside the Spanish UI with `lang="en"` on the article and a canonical to the English URL.
  - **Post files:** `<slug>/<slug>.es.md` next to `<slug>.md`, sharing the images; same `date`, `tags`, `cover` file; translated `title`, `description`, `cover` alt. `slugOf()` ignores the `.es` suffix. Publishing stays one `git mv` of the folder.
  - **YAML data:** translatable fields inline as `{ en: …, es: … }` (skills' labels, notes and group descriptions; the Awesome list's descriptions); ids, levels, profiles, icons and urls stay single. `skills.server.ts` / `awesome.ts` fail the build if a field lacks its Spanish.
  - **Tags stay as they are** (English ids and labels, in every language).
  - **The CV follows the site's language:** `/projects/cv` prints English, `/es/projects/cv` Spanish (headings, skills, validation messages).
  - **Obsidian vault:** English only; Spanish lives only in the repo.
- **PRs:** machinery first, then content in batches.
  1. **Spike on `/blog`** (a list, a date, a plural, tag links): `reroute` + the `/portfolio` base path + prerendering together in `pnpm preview`. **Done 2026-11-08, it works.** Found: `resolve()` writes links relative to the real URL while prerendering (`../blog` on `/es/blog`, the English page), so links go through `localize()`, which puts the language after `resolve('/')`; Vite's `import.meta.env.BASE_URL` is `./` under SvelteKit, so `vite.config.ts` defines `import.meta.env.BASE_PATH` for the hook; the crawler builds every `/es/` page through the switch; client-side switching updates text and `<html lang>` without a reload. Left for step 2: at 320px the switch makes the site name wrap to two lines.
  2. **Machinery:** routing and link helper, messages for every UI string, `<html lang>` via `%lang%` + `transformPageChunk` in `hooks.server.ts`, the switch, `hreflang`/`x-default`/`og:locale`/canonical in `Seo.svelte`, sitemap alternates, `Intl` dates and plurals, callout titles and the code block's Copy button per language (the rehype plugin gets the locale from the file name), the "en inglés" fallback, the `reviewed` badge, tests. The site works with only the UI in Spanish.
     **2a done 2026-11-08** (UI): every UI string is a message (`en.ts` / `es.ts`, ~130 each); links through `route()` (`resolve()` + `localize()`; `route.test.ts` fails if any other file imports `$app/paths`, except `Icon.svelte` and the sitemap); `{#key getLocale()}` around the page in the root layout (same route, new language: rebuild the page); project names/descriptions as `Translated` (`{ en, es }`, `text()`); `formatNumber()` (4,53 in Spanish); `Seo.svelte` `translated` prop (hreflang + x-default + `og:locale(:alternate)`; untranslated pages' `/es/` copy is canonical to English); sitemap with `xhtml:link` alternates via `localizePath()` (the sitemap builds its list outside a request, where `resolve()` is absolute); smoke test per language plus a switch test. Content pages pass `translated={false}` until 2b. Left: at 320px the switch wraps the site name and the Spanish nav takes three rows; `/mascot` stays English (noindex draft).
     **2b done 2026-11-08** (content machinery): `.es.md` beside the English file (words only; date/tags/phase from English), `inLocale()`/`isTranslated()`, `lang="en"` + "en inglés" badge + canonical to English on untranslated pages, the `reviewed` dev badge, YAML text plain or `{ en, es }` localized in the loads (skills keyed by English name for the CV's saved edits), callout titles per file language, tests (608 unit, 5 e2e). First translation: `an-accordion-without-javascript`. Lighthouse a11y + SEO 100 on 8 pages, both themes. Alfonso: header wrap OK, ISO dates in both languages, home tagline "Desarrollo web. Diseño sitios rápidos, accesibles y con un toque diferenciador."
  3. **Content batches: all done 2026-11-08** (Claude translated, every file `reviewed: false` for Alfonso's spot checks): `skills.yaml` (names, notes, evidence labels, profiles, groups as `{ en, es }`; proper names plain), the Modern CSS list (link titles stay as their sources wrote them), all 25 published posts, all 31 drafts, all 64 Devlog entries. Drafts whose code changed with Phase 10 got an **Update:** paragraph in both languages (store-the-changes, markdown links, breadcrumbs, SEO, smoke test, images, mdsvex, covers). The English section name is now **Devlog** (Spanish keeps "Bitácora"; the URL stays `/bitacora`). Build: 276 sitemap URLs, 138 per language. Planned batches were: about + skills + CV; projects + Awesome; published posts; drafts; Bitácora (a few PRs).
- **Notes:** Spanish characters (`á é í ó ú ñ ü ¿ ¡`) are all in the Latin font file that's already preloaded. Tests to add: the smoke test per locale, a unit test that every UI string exists in both languages, content tests (every `.es.md` has the same `date`/`tags` as its English file and a `reviewed` field). Alfonso reviews `content/skills.yaml` before its batch, so it isn't translated twice.
- **Done when:** every page exists in both languages, links and the switch keep the language, search engines see the alternates, and Lighthouse stays ≥ 90.

## Phase 11 — A CMS (later, Alfonso's idea 2026-11-06)

- **Goal:** manage the site's content from a UI instead of editing files: posts, entries, lists, skills, and images, including **picking the focal point** a crop keeps (cards crop a square from the middle today, see `covers.ts`).
- **To decide first:** a git-based CMS that writes the same markdown and YAML (Decap, TinaCMS, Keystatic, or Sveltia) versus building a small one in the site as a project. The site is static on GitHub Pages, so whatever it is has to commit to the repo, not to a database.
- **Study (2026-11-09):** [design/cms-study.md](../design/cms-study.md) compares our own CMS, Sveltia and TinaCMS. Tina is out (media must live in `static/`, no i18n, MDX-only components); Sveltia first, decided by a one-hour spike, with our own CMS as the fallback. Alfonso's call.
- **Adopted (2026-11-09, branch `spike/sveltia-cms`):** Sveltia CMS in dev at `/admin/index.html` (`cms/`). Alfonso checked the WSL folder picker. Saves use our own format (`src/lib/content-files.ts` + Prettier) so only edited lines change; `content-files.test.ts` round-trips every content file; `pnpm content:format` after hand edits. Preview = the real dev page in an iframe. Blocks are editor components from `blocks.ts`. Still open: use `focus` (the focal point field) in `covers.ts`; the standalone CMS (hosting + GitHub sign-in).
- **Then (2026-11-11, branch `spike/svelte-markdown`):** mdsvex replaced by svelte-markdown; the CMS preview mounts the site's own `Markdown.svelte`. The CMS moved to `src/lib/cms/`, Sveltia is imported from npm (`init({ config })`), `/admin` is the address, and the "Real page" tab is gone. Details in `src/lib/cms/README.md` and `design/svelte-markdown-spike.md`.
- **Prepared for it:** content metadata lives in frontmatter and YAML (a focal point would sit next to `cover:`), and covers are found by folder, so any content type can get one.

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
