# Spike: svelte-markdown instead of mdsvex

Branch `spike/svelte-markdown`, stacked on `spike/sveltia-cms` (it needs the CMS). Started 2026-11-11. **A spike: nothing here replaces mdsvex until Alfonso decides.** This file is the handoff for a new conversation: read it, then CLAUDE.md's Phase 11 bullet and `cms/README.md`.

## The question

Can one renderer, with Svelte components as its renderers, replace mdsvex in the build **and** draw the Sveltia CMS preview live? The goals:

- one markdown pipeline instead of two (today: mdsvex in the build, unified in `cms/render.ts`);
- drop the build hacks (`markdown()` Vite plugin, mdsvex's `<script context="module">` rewrite, `enhance-media.ts` import rewrite, the unified v9 cast, `onwarn` for bare tags);
- parse with `marked`, the parser Sveltia uses (a small gain: Sveltia uses marked only for its default preview, which we replace; its editor is Lexical, with its own markdown rules);
- keep posts readable in Obsidian and on GitHub: no Svelte syntax in `.md` files (none use it today).

## How we got here (decisions so far)

- **mdsvex 0.12.8** is stable but runs an old unified and writes Svelte 4 syntax. **1.0.0-next** (next.0–next.3, Sept–Oct 2026) is a rewrite (`@mdsvex/parse`, `@mdsvex/render`) with its own plugin model: our rehype plugins would likely not carry over.
- What mdsvex gives that a runtime renderer doesn't: Svelte inside the prose (`<script>`, `{value}`). It costs portability (Obsidian, GitHub and the CMS show it as code), so "live values inside a sentence" was set aside. Interactive things go in fenced blocks (like ` ```yt `) drawn by components.
- Options weighed: stay on mdsvex; wait for 1.0; unified + `{@html}` + blocks as islands ("outcome C"); a hast → Svelte renderer (svelte-exmarkdown 5.0.2, MIT, unified 11); `.svx` for special posts. Then Alfonso proposed **svelte-markdown**, and this spike tests it.

## svelte-markdown, as checked on 2026-11-11

- `@humanspeak/svelte-markdown` **2.2.0** (2026-10-28), MIT, Svelte 5. Deps: `marked ^18`, `htmlparser2 ^12`, `github-slugger ^2`, `@humanspeak/memory-cache`. Optional peers include `shiki >=4` (we have ^4.5).
- Site: https://markdown.svelte.page. Full docs in one file: https://markdown.svelte.page/llms-full.txt (300 KB; grep it).
- One main maintainer (1,039 of ~1,100 commits), 145 stars, ~43k downloads a week, frequent releases. **Pin the exact version**, like Sveltia.
- Built for streaming AI chat output (`writeChunk`, token caching, XSS filter); we use none of that.
- `<SvelteMarkdown source renderers options extensions />`. `source` is a string or marked tokens. `renderers` maps token types (`heading`, `code`, `image`, `link`, `table`…) and `html: { tag: Component }` to Svelte components. `extensions` takes marked extensions; their token `name` is the renderer key.

What it covers of ours:

| Ours today                                 | With svelte-markdown                                                                                                                                                                                                                                 |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| rehype-slug                                | built in (`headerIds`, github-slugger, same slugs)                                                                                                                                                                                                   |
| rehype-autolink-headings (`wrap`)          | our `heading` renderer                                                                                                                                                                                                                               |
| `callouts.ts` (rehype)                     | **ours, as a marked extension.** Its `markedAlert` only knows the five GitHub types and its regex needs `]` then a newline: `> [!tip] My title` (Obsidian's custom title) falls back to a blockquote. Read in `dist/extensions/alert/markedAlert.js` |
| Shiki + `codeTheme`                        | `HighlightedCode` takes a **synchronous** highlighter; ours loads languages on demand, so load the post's languages first                                                                                                                            |
| `blocks.ts` (` ```yt `, ` ```video `)      | a `code` renderer that hands known languages to real Svelte components                                                                                                                                                                               |
| enhanced-img via `enhance-media.ts`        | our `image` renderer: look the picture up in an `import.meta.glob(…, { query: { enhanced: true } })` by the post's folder, then `<enhanced:img src={picture}>`                                                                                       |
| `<video>`, `<figure>`, `<svg>` in markdown | **not among its 83 HTML tags**; unknown tags print as escaped text. Add `html` renderers                                                                                                                                                             |
| `tables.ts`, `MarkdownLink`                | `table` and `link` renderers                                                                                                                                                                                                                         |
| bare `<tag>` fails the build               | gone; needs a check (`walkTokens` on `html` tokens)                                                                                                                                                                                                  |

## The catch, and the shape to test

It renders at **runtime**. On a prerendered page it runs on the server (complete HTML) and again in the browser to hydrate, so the browser would download marked, htmlparser2, the renderers, the markdown and Shiki. Today it gets none of that.

So the shape under test is:

- **Build:** render on the server only. `render()` from `svelte/server` in the post's `+page.server.ts` turns `<SvelteMarkdown>` into an HTML string; the page shows it with `{@html}`. Interactive blocks (none yet) would be islands mounted by hand.
- **CMS preview:** mount the same `<SvelteMarkdown>` with the same renderers live in Sveltia's preview pane (we already mount Svelte from React in `cms/focal.svelte.ts`). `./` paths go through `getAsset()`.

## Plan

1. **Comparison first, in the scratchpad, branch untouched:** render every post and Devlog entry with svelte-markdown (or plain `marked` + the same extensions) and diff its text and structure against today's build HTML (`BASE_PATH=/portfolio pnpm build`, then `build/**`). Watch for:
   - curly quotes (mdsvex adds them; marked needs e.g. `marked-smartypants`);
   - multi-line raw HTML (`<details>`, `<video>` with `<source>`/`<track>`): marked splits HTML blocks differently from mdsvex;
   - tags that come out as escaped text;
   - heading ids, footnotes, task lists, tables.
     Report the numbers to Alfonso, then decide whether to go on.
2. If the diff is small: the renderers in `src/lib/markdown/` (heading, code + blocks + Shiki, image, link, table, video/figure), the callout extension (port `callouts.ts`'s rules and messages, keep its tests' cases), a bare-tag check.
3. One post page (blog) rendered through `render()`; compare HTML with mdsvex's; Lighthouse; JS size of the page.
4. The CMS preview with the same component, replacing `cms/render.ts`.
5. Only then: Devlog pages, remove mdsvex and the hacks, update the docs (below).

## Results (2026-11-11): steps 1–3 done, blog only

Alfonso's calls before starting: Sveltia comes second (the site's markdown first); server-first, hydrate only in the CMS if needed; **straight quotes** (no smartypants for now); go as far as step 3.

**Step 1, comparison** (scripts in the session's scratchpad, not kept). Every post and Devlog entry (262 files) rendered with svelte-markdown's default renderers, reduced with today's build HTML to one line per block (text, inline tags, heading ids, link targets, image alt/caption, code text) and diffed. **Ignoring typography (curly quotes, dashes, ellipses), 234 of 262 were identical**; the other 28 were all explained, none a parser difference:

- svelte-markdown's `Codespan` renderer is `raw.replace(/`/g, '')`: it drops backticks _inside_ code (`` `` `a` `` ``) and keeps the padding spaces. marked's token is right (`text`); our `Codespan.svelte` uses it.
- mdsvex was wrong in two posts: `` `&rarr;` `` and `` `&lt;enhanced:img&gt;` `` showed `→` and `<enhanced:img>`. marked shows what's written.
- My normaliser (relative links, callout titles with code).
- No content file has raw HTML in its prose (all in backticks or fences) and none uses footnotes, so svelte-markdown's 83-tag list doesn't matter today.

**Steps 2–3, the blog on svelte-markdown** (`src/lib/markdown/`, `/blog/[slug]`; the Devlog still uses mdsvex):

- `parse.ts`: our own marked `Lexer` pass, then the tokens go to `<SvelteMarkdown source={tokens}>`. It turns `> [!type]` into `callout` + `calloutTitle` tokens, a lone captioned image into a `figure` token, fails on HTML in the text (comments dropped), and collects the code languages and the `./files` (images, blocks' `file` fields) so both are loaded _before_ the synchronous render. The Parser renders any token type that has a renderer and passes the token's fields (plus every extra prop given to `SvelteMarkdown`) as props.
- Renderers: `Heading`, `Code` (blocks → `blocks/Video.svelte`, `blocks/Yt.svelte` from `readBlock()`, else `CodeBlock` + Shiki), `Codespan`, `Image` (`<enhanced:img src={picture}>`), `Figure`, `Link` (`sitePath()`: `route()` needs SvelteKit's page), `Table`, `Callout`, `CalloutTitle`. Extra props: `file`, `locale` (page's), `highlighter`, `media`.
- `render.server.ts`: `render()` from `svelte/server` in `+page.server.ts`, hydration markers stripped, page shows `{@html}`. `copy.ts` attachment shows the copy buttons (rendered `hidden`) and handles clicks by delegation; `{#key html}` re-runs it per post. The markdown `CodeBlock` has no `<style>` (a component only the server renders never sends its CSS): its rules are in `global.css` `.prose .code-block`.
- `shiki.ts` shared with `vite.config.ts` (mdsvex). `media.server.ts`: **lazy** globs resolved per post (`mediaFor`). Two traps found: `'!/content/**/cover.*'` excludes nothing (a rooted negative pattern with `**` in the middle; `'!**/cover.*'` works; `'!/content/blog/drafts/**'` in covers.ts does work), and an **eager** glob inside `import.meta.env.DEV ? … : {}` still put the drafts' images in the build (its imports are hoisted out of the branch; imagetools writes the files on load). covers.ts has that shape for drafts' covers: no draft has a cover today, so it's untested.
- Hacks gone for the blog: the `.md` component chunks, the `<script module>` rewrite, enhance-media's regexes (and its double-quote rule: Svelte escapes attributes), the tables `onwarn` exception (`svelte-ignore` in `Table.svelte`). Still there for the Devlog.
- **Old vs new build, all 114 blog pages (en + es): 112 identical block by block** ignoring typography (callout titles, links, code, the video block byte for byte); the 2 others are the mdsvex entity bug above.
- **Weight:** first visit 11.6 → **9.6 kB** gzip on average (old = HTML + the post's lazy chunk); client-side navigation 4.1 → **3.5 kB**; 115 fewer JS files (3.5 → 1.3 MB of JS in `_app`). The body is in the page twice (HTML + the hydration data's `html` string), which is why the HTML grew; still smaller than HTML + chunk.
- Lighthouse (both builds served the same way, Python static server, no compression, so absolute perf is low): callouts post 77 → 80, largest page 75 → 75; a11y/best practices/SEO 100, both themes, CLS 0. 320 px: no new overflow (`es/blog/2026-10-30-theme-toggle-view-transition` overflows in both builds: a long inline `<code>`; fix separately with `overflow-wrap: anywhere` on inline code).
- Tests: `parse.test.ts` (callout cases from callouts.test.ts, figures, HTML, languages, files, every block has a component), `render.test.ts` (whole pipeline with a fake `Media`), `e2e/blog.test.ts` (copy button works, after client navigation too; without JS the post is complete and the button hidden). 1109 unit, 21 e2e pass. Dev: drafts with images and the yt block render; the CMS's `?preview` file is picked up.
- `@humanspeak/svelte-markdown` 2.2.0 and `marked` 18.2.0 pinned. The package has an unreleased `preprocess/` (mdsvex-like, not in its exports): not usable yet.

## Results (2026-11-11, later): steps 4–5 done, mdsvex removed

Alfonso's calls: **strict** (HTML in a post fails the build; svelte-markdown's spirit, full sanitisation or fail), do steps 4 and 5, evaluate the site with mdsvex gone as a dependency, write it up.

- **Step 5:** the Devlog's `[slug]` page renders like the blog's (`+page.ts` gone, `+page.server.ts` calls `renderMarkdown`); `media.server.ts` globs `content/bitacora` too. Removed: `mdsvex`, `unified`, `remark-parse`, `remark-gfm`, `remark-rehype`, `rehype-raw`, `rehype-slug`, `rehype-autolink-headings`, `rehype-stringify`; the `markdown()` plugin, `extensions: ['.md']` and `onwarn` in `vite.config.ts`; `enhance-media.ts`, `tables.ts`, the rehype part of `callouts.ts` (now only the types, icons imported one by one), `MarkdownLayout`, `MarkdownLink`, `components/CodeBlock`, and their tests (cases ported to `parse.test.ts`/`render.test.ts`). Image checks (alt, `./`) moved into `parse()`, so every build error is thrown before rendering.
- **Step 4:** `cms/render.ts` (+ test) gone. `cms/preview.ts` runs `parse()` + `loadLanguages()` 150 ms after typing pauses and hands the tokens to `cms/markdown.svelte.ts`, which mounts `Markdown.svelte` from a React component (props as getters over `$state.raw`: tokens are replaced whole, never deep-proxied). A `Media` from `getAsset()`. `parse()` errors show instead of the body. `preview.css` lost its CodeBlock copy. `dynamicCompileOptions` (no HMR, injected CSS) now covers `src/lib/markdown/` and svelte-markdown too; `optimizeDeps.include` has `@humanspeak/svelte-markdown` (found late it caused a `504 Outdated Optimize Dep` on the CMS page; checked on a cold cache). The live "Real page" reads `.preview.md` with `readFileSync`, so Vite no longer notices: `plugin.ts` sends `full-reload` after each write (checked: one reload, the edit shows).
- Checked in Chromium on a probe page (deleted): the browser render gives the same markup as the server's; re-rendering with new tokens keeps heading ids right (`changed`, `changed-1`). Not checked: the real CMS with a repository open (the folder picker can't be automated).
- **Old (mdsvex) vs new build, all 262 blog and Devlog pages: 258 identical** block by block ignoring typography; the 4 others are mdsvex's entity bug. Devlog pages are lighter too (69 of 148 matched to their old chunk: first visit 8.4 → 6.7 kB, navigation 2.6 → 2.1 kB). Build JS: 323 files, 3.5 MB → **59 files, 0.56 MB**. Lighthouse a11y/best practices/SEO 100 on two Devlog entries, both themes, CLS 0. 1068 unit tests, 21 e2e.
- Also: inline code in `.prose` has `overflow-wrap: anywhere` (two pages scrolled at 320 px, in the mdsvex build too).
- Docs done: publishing guide (HTML rule, no HTML videos, no double-quote rule), `cms/README.md`, the preview draft (a fourth try), dated update notes on eight published posts (en + es), Devlog `2026-11-11-svelte-markdown-instead-of-mdsvex`, draft `2026-11-11-markdown-drawn-by-my-own-components`, `drafts-to-publish.md`, CLAUDE.md.

## Then: a leaner CMS (2026-11-11, evening)

Alfonso's calls: CMS code inside `src/`, Sveltia from npm, drop the "Real page" tab, make editor-component previews a summary, one frontmatter reader, the site's `readingTime()` in the preview; keep the React header (mounting `ArticleHeader` needs a `locale` prop and its scoped CSS can't reach the frame).

- `cms/` → **`src/lib/cms/`** (no more `cms/` in `fs.allow`, `tsconfig`, Vitest). `index.html` gone: `plugin.ts` answers `/admin` with a one-script page. `/admin` stays outside SvelteKit's routes on purpose (root layout and global CSS; it would be built).
- **Sveltia from npm**: `main.ts` sets `CMS_MANUAL_INIT`, then `import('@sveltia/cms').then(setUp)` (a top-level `await` deadlocks with `DOMContentLoaded`: no error, the page never finishes); `config.yml?raw` parsed with `yaml` `{ merge: true }`, `fields:` dropped, `init({ config: { …, load_config_file: false } })`. `optimizeDeps.exclude: ['@sveltia/cms']` (fonts/wasm via `new URL(…, import.meta.url)`).
- Its `npm/index.js` uses `import.meta.hot`, so Vite's client is on the CMS page. Checked: writing content files doesn't reload it. So **`dynamicCompileOptions` is gone** (the reload loop it prevented came from mdsvex-compiled `.md` modules and the live preview's writes).
- **"Real page" gone**: `src/lib/preview.ts`, `preview.server.ts`, their test, the POST endpoint, the reload, `?preview` and `prerender = !import.meta.env.DEV` in both `[slug]` pages, the `.gitignore` entry. The Awesome list keeps its "as last saved" iframe in dev (`savedPage`).
- `/admin/cover/` gone: `cms/covers.ts` is an eager `?url` glob of covers.
- `blocks.ts` lost its HTML `render()` strings (142 → 106 lines); `components.ts`' `toPreview` is one line (name + title); markup tests moved to `render.test.ts`, field checks to `readBlock()` tests.
- `content.ts` `readFrontmatter()` uses `readEntry()`; `readingTime()` lives in `src/lib/reading-time.ts` (importing `content.ts` into the CMS would bundle every post).
- CMS code: 977 → 694 lines (comments and blank lines excluded); `plugin.ts` 92 → 46. Checks: `/admin` renders Sveltia with no warnings or 504s (cold cache), content writes don't reload it, the preview's Svelte side renders and re-renders right; lint, types, 1069 unit, build, 21 e2e; nothing from Sveltia in the build.

## Things to keep

- **Every content file must round-trip** through `src/lib/content-files.ts` + Prettier byte for byte (`content-files.test.ts`). After hand edits: `pnpm content:format`.
- Test the production build: `BASE_PATH=/portfolio pnpm build && BASE_PATH=/portfolio pnpm preview` (restart preview after each build).
- The prerender crawler checks `#links` against heading ids (`prerender_missing_id`): ids must stay the same.
- Callout titles and block texts follow the file's language (`<slug>.es.md` → Spanish), via the file name.
- Image rules the build enforces today: missing file, empty alt (except an explicit `alt=""` on a `yt` thumbnail), a double quote in alt or caption, `<video>` without `width`/`height`.
- Install with pnpm; it may refuse versions younger than its release-age limit: don't add exceptions.
- Alfonso pushes; commit only when he asks. Never port code from GPL or unlicensed repos.

## Docs that changed

See the last bullet above. Nothing here is merged; if the branch is dropped, so are they.

## Open questions (Alfonso, 2026-11-11)

**Images: keep enhanced-img?** It was a pain in deployment (CI re-encodes every image on a fresh runner), and making the variants is the painful part of the workflow. Sveltia can transform uploads, but only to one WebP file (`media_libraries.all.transformations.raster_image`: `format: webp`, `quality`, `width`/`height` as maximums; in 0.262.0), and only for files uploaded through the CMS. Options weighed:

- Keep enhanced-img, and remove the pain: cache `node_modules/.cache/imagetools` in CI (already planned, see CLAUDE.md "Caching"), and fewer cover variants.
- Sveltia's transformation as an input normaliser only (cap uploads at about 2048 px), with enhanced-img still making the AVIF/WebP sizes: keeps git small; a WebP re-encoded by the build is compressed twice, so a high quality.
- One file per image, no variants (Sveltia's WebP, or a `sharp` script for files added by hand): no build step, but no AVIF and no smaller sizes for phones, and the site would need each image's size another way.
- Committed variants (a script): git keeps every version forever.

Also: drafts must not leak into the build, and an eager glob of images does leak (see above); `covers.ts` has that shape for drafts' covers.

**Drafts → published.** Today: two collections (`posts`, `drafts`) on two folders, and publishing is `git mv` by hand; the CMS can't move an entry between collections. Options:

- Keep the folders (drafts can't ship, images included, by structure) and add a small `pnpm` script that moves a post's folder.
- A `draft:` field in one folder: publishing becomes a click in the CMS or a property in Obsidian, but the build has to filter drafts everywhere, including their images (the eager cover glob would ship them).
- Sveltia's editorial workflow (in 0.262.0): remote only (GitHub backend), a branch and pull request per entry, publish = merge to `main`, which deploys. Fits a hosted CMS later; not the local workflow, and drafts would then live on branches, not in `main` or in dev.
