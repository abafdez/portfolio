# Spike: mdsvex 1.0 and twinkleplop

Branch `spike/mdsvex`, from `main` (2026-11-26). Phase 12 on the vault board. **A spike: nothing here is decided until Alfonso says so.** Background: mdsvex 1.0 (2026-11-19) is a rewrite with its own parser and twinkleplop as its highlighter; we left mdsvex 0.12 for svelte-markdown on 2026-11-11 ([svelte-markdown-spike.md](svelte-markdown-spike.md)).

## The questions

1. Is twinkleplop a better highlighter for us than Shiki, on its own, inside today's svelte-markdown pipeline?
2. Should the site's markdown move to mdsvex 1.0 (real components in posts, `run` and `src=` fences, enhanced-img built in, `?data`), and at what cost (its dialect, callouts, strict HTML, JS per post, the CMS preview)?

## Step 1 (done 2026-11-26): twinkleplop instead of Shiki

**Installed:** eleven `@twinkleplop/*` language packages, MIT, **0.1.9** (`markdown` 0.2.3), pinned. 0.1.10 / core 0.4.1 came out 2026-11-25 and pnpm's one-day release age held them back. No theme package: our own CSS colours the classes. `shiki` removed.

**What changed:**

- `src/lib/markdown/highlight.ts` replaces `shiki.ts`: the languages are imported once, each package's `language()` makes a synchronous function from code to HTML; `languageOf()` maps the written names (`ts`, `sh`, `md`, `yml`…); unknown languages are plain text in the same `<pre><code><span class="l">` shape, with one warning per language.
- **No more loading step.** Shiki loaded languages asynchronously, so `parse()` collected each post's languages and `render.server.ts` and the CMS preview awaited `loadLanguages()` before rendering. All gone: `Parsed.languages`, the `highlighter` prop through `Markdown.svelte`, `Code.svelte`, `cms/markdown.svelte.ts`, and the `await` in the preview.
- **The theme is CSS now.** `src/lib/code-theme.ts` (a TextMate theme of scopes) is deleted; `global.css` (`.prose .code-block .tok`) maps twinkleplop's token classes to the same `--code-*` tokens, in the same groups. Shiki wrote `style="color:var(--code-…)"` on every token; the HTML now has classes. `--code-*` and their contrast tests are unchanged.
- Some classes mean different things per language, so `CodeBlock.svelte` puts `data-lang` on the figure: in ts/js/svelte `property` (`obj.name`) and `constant` (any `const` name) stay plain; in CSS a value word (`none`) is a constant; in YAML a value is a string.
- Line numbers: `.line` → `.l` (twinkleplop's line class). The `pre` gets its background and colour from CSS (Shiki inlined them).

**Compared with the Shiki build, every code block, character by character** (scripts in the session scratchpad, not kept): 67 pages with code, **no block's text changed**, **86.9 % of the 48,912 non-space characters keep their colour** (80.1 % before the per-language rules). By language: ts 93 %, js 99.6 %, yaml 99.4 %, html 99.7 %, json 97 %, svelte 88 %, css 75 %, md 62 %, http 60 %, sh 17.5 %, diff 0 %.

What the differences are:

- **diff:** Shiki with our theme left diffs grey; twinkleplop colours added lines `--code-string`, removed ones `--code-tag`. Better.
- **CSS (75 %):** in fragments (declarations without a selector around them, common in posts) twinkleplop tags functions inside custom property values (`oklch`, `light-dark`, `color-mix`) as `selector`, so they show in the tag colour. A grammar bug worth reporting upstream with a playground link. Media features (`prefers-reduced-motion`) are keywords (Shiki: plain).
- **Svelte:** its grammar reads `<script lang="ts">` as JavaScript, so types (`Props`, `string`) lose their colour.
- **Bash (17.5 %):** no command or argument tokens (Shiki coloured commands as functions, arguments as strings); only comments, operators, strings.
- **ts:** `=>` is an operator (muted; Shiki: keyword); `${ }` is punctuation (Shiki: keyword); regexes are one string (Shiki split them); `new TextEncoder` is a class name (type colour; Shiki: function).

**Checks:** `pnpm check`, Prettier, 1,247 unit tests, `BASE_PATH=/portfolio pnpm build`, 27 e2e tests (the copy button, after client navigation too). Looked at in Chromium, both themes: colours, background, line numbers, wrapped lines continue under their own text. The CMS preview: Alfonso checked it in the browser, works.

**Weight:** nothing changes for visitors (highlighting happens at build time). The CMS build is 22 MB (`main`: about 23 MB).

**Alfonso's call (2026-11-26):** twinkleplop stays only if mdsvex 1.0 does; on its own it isn't worth the switch yet.

## Step 2 (in progress, 2026-11-26): mdsvex 1.0 for every English post

**Installed:** `mdsvex` **1.0.1** (MIT, pinned; 1.1.0 is younger than pnpm's release age). It brings its own twinkleplop (core 0.3.x, next to our 0.4.0).

**How it's wired** (all marked "spike"):

- `vite.config.ts`: `mdsvex({ extensions: ['.md'], heading_ids: true, links: { base }, components: '/src/lib/mdsvex/components.ts', parse_plugins })` before SvelteKit. `.md` files become Svelte components; the site's `?raw` imports (content.ts) are untouched, so the rest of the site builds as before.
- **The Phase 6 clash is back, smaller:** mdsvex registers `.md` as a Svelte extension, and enhanced-img's markup step (a transform with `order: 'pre'`, which beats plugin order) parses the raw markdown of any post whose text contains `<enhanced:img` (4 posts, in code examples) and fails. mdsvex draws markdown images itself, so `enhancedImagesExceptMarkdown()` wraps that step's handler to skip `.md` files. Changing its `filter` had no effect. **Report upstream.**
- `links: { base: true }` uses Vite's base, which SvelteKit sets to `./`; passing our `base` string works.
- `src/routes/spike/[slug]/`: a lazy glob of the published English posts (with the drafts marker), `entries()`, the component from `+page.ts` (the shape the site had before svelte-markdown), the copy button via `copy.ts`.
- `src/lib/mdsvex/components.ts`: replacements `h2`–`h4` (self-linking heading), `pre` (our `CodeBlock` frame; `children` is mdsvex's whole `<pre>`), `table` (our scroll box), `blockquote` (a callout when the plugin marked it, else a quote). They reuse `markdown/`'s components.
- `src/lib/mdsvex/plugins.ts`, parse plugins (handlers keyed by node type, run when the node closes): **callouts** (the `[!type]` line is removed from the first paragraph up to the first line break; `kind`, `title`, `file` go on the blockquote's `attrs`, which reach its replacement as props), **figures** (a lone captioned image becomes `<figure>` + `<figcaption>`), **file on tables and fences** (for labels and the button's language), **no HTML** (throws).
- Lessons: `node.attrs` can't be replaced, only changed key by key; attrs set by a plugin become props only for elements mdsvex counts as markdown (a plugin-made `<callout>` with `component_mode: 'all'` got none), so the callout is a marked blockquote, not a custom tag.

**Dialect scan, all 322 content files through `compile()`** (a counting parse plugin): no compile errors, no `{…}` read as Svelte (every brace is inside code), no raw HTML, no accidental directives. But:

- **`**bold**` renders `<strong><strong>bold</strong></strong>`** (PFM reads `*x*` as strong, so `**x**` is strong twice): 992 places in 176 files. Looks the same, odd HTML. A sequential plugin could unwrap it, or upstream could.
- The two real `*italic*` uses turn bold; 4 bare URLs stay text (GFM links them).
- **Bug:** an image whose alt has a lone `~` (`![… ~/toolbox/base64 …](./x.png)`) isn't an image at all, it's printed as text (`~` starts subscript). `~x~` in alt text is subscript. **Report upstream.**

**Compared with the /blog pages, block by block** (tag, text without whitespace, heading ids, link targets, alt texts, inline tags): **69 of 72 posts identical.** The other 3: the `video` block, the `yt` block (not ported yet) and the `~` image bug.

**Weight, average per post, kB gzip** (first visit = HTML + every JS file the page loads, the post's lazy chunk included):

|                              | blog (svelte-markdown) | spike (mdsvex)                                                  |
| ---------------------------- | ---------------------- | --------------------------------------------------------------- |
| HTML                         | 11.5                   | 8.5 (today's pages carry the body twice: HTML + hydration data) |
| JS                           | 74.0                   | 78.2                                                            |
| first visit                  | 85.5                   | 86.8                                                            |
| next post, client navigation | 3.6 (`__data.json`)    | 3.6 (the post's chunk; largest 6.9)                             |

A wash: the gap the svelte-markdown spike measured was mdsvex 0.12's.

**Looked at in Chromium:** callouts, code frame (a nested `<pre>` fixed), copy buttons work, no page errors. `pnpm check`, Prettier, 1,247 unit tests pass.

### The CMS preview with mdsvex (done 2026-11-26)

**Answer: it works, and exactly.** The preview compiles the body in the browser the way the build does: `mdsvex/compile` (no Node imports) with the build's options → Svelte source → `svelte/compiler` (`generate: 'client'`) → a blob: module → `mount()`.

- `src/lib/mdsvex/options.ts`: `compileOptions(base)` (heading ids, links base, parse plugins), used by `vite.config.ts` and the CMS, so they can't drift. Highlighting: `create_highlight({ languages: await load_default_languages() })`, what the Vite plugin does.
- `src/lib/cms/mdsvex.svelte.ts`: `compilePost(body, file)` and `mdsvexBody(React)` (mounts each new component, unmounts the old). A compiled post imports `'svelte/internal/client'` and its replacements by name; the browser can't resolve names, so only the import statements at the top are rewritten to blob: modules that hand out this bundle's own copies (`globalThis.__previewModules`). Exports go through locals: Svelte's runtime exports `await`, a reserved word. `preview.ts` uses it instead of `parse()` + `<Markdown>` (svelte-markdown's preview files stay, unused).
- `src/lib/cms/svelte-runtime.ts`: **Svelte forbids importing `svelte/internal/*` from `.svelte.ts`** (`import_svelte_internal_forbidden`: private, changes without notice); a plain `.ts` file can. The compiler and runtime come from the same package, so they always match; the risk is Svelte closing that export one day (its own playground needs it).
- `PreviewImage.svelte`: `img` replaced in the preview only (`compile()` without `import_images` gives plain `<img>`); the URL is Sveltia's `getAsset()`, through a context backed by `$state.raw` (empty while Sveltia reads the file).
- `plugin.ts`: `mdsvex/compile`, `mdsvex/highlight`, `svelte/compiler` pre-bundled.

**Checked with Sveltia's `test-repo` backend** (config.yml switched only during the test, restored): every published English post pasted into a new post's body, the preview's `.prose` compared with `build/spike/<slug>.html` (blocks, ids, links, alts, inline tags, and every highlighted token's class): **72 of 72 identical**, no page errors. Time per compile, warm: mdsvex median 1 ms (max 10), Svelte median 5 ms (max 36), loading the module ~2 ms.

**Errors show before saving**, as "The build would stop here": an unknown callout, HTML, and now **Svelte syntax**: `mustache` and `svelte_block` nodes fail like HTML (`noSvelte` in `plugins.ts`). Without that, `{a: 1}` in prose failed with Svelte's bare "Expected token }", and an expression that compiles would **run in the CMS page**, where the GitHub token is stored: a post opened in the editorial workflow could read it. The site build passes with the rule (no post has a brace outside code).

**Weight, only for whoever opens the CMS** (kB gzip, measured with Vite): Svelte's compiler 228, mdsvex compile 126, its 27 grammars 115, its highlighter 17: about **490**, against ~30 for marked + svelte-markdown + our 11 grammars. The CMS is 23 MB already (Sveltia's main chunk alone is 663 kB gzip). The compiler and grammars load lazily; `mdsvex/compile` could too.

**Still to do in step 2:**

- The `video` and `yt` blocks: their `./` files must become imports. Options: a parse plugin that turns the fence into nodes mdsvex imports (an `image` child for the thumbnail), mdsvex's `fences` claim, or `src=`-style machinery. The video file is the hard part (`import_images` only does images). The preview needs the same blocks (via `getAsset()`).
- Spanish posts and the Devlog (the route is English blog posts only); `?data` in place of content.ts's `?raw` frontmatter reading.
- The `**` double strong, the bare URLs, the `~` image: plugin, content edit or upstream.
- Then a decision with Alfonso: mdsvex, or stay on svelte-markdown (and Shiki).

## If twinkleplop stays (whatever step 2 decides)

- Update `docs/customizing/` (01 stack, 02 how it fits, 08 sources), the published posts that describe Shiki (`shiki-with-design-tokens`, `a-code-block-frame`; dated update notes, en + es), CLAUDE.md's Phase 7 lines, `cms/README.md` (done).
- Move to 0.1.10+ once pnpm allows it; report the CSS selector bug.
- A Devlog entry and a draft post (highlighting with CSS classes instead of inline colours), copied to the vault.

## The switch (from 2026-11-26, branch `feat/mdsvex`)

Alfonso's call (2026-11-26): **switch to mdsvex 1.0**, for components and live demos in posts; twinkleplop comes with it. Posts written in Obsidian keep `_italic_` and `**bold**` (Prettier already rewrites `*x*` to `_x_`, and CI's `prettier --check` fails otherwise); bold inside bold is PFM by design.

**Step 1 done: the real pages.** `/blog/[slug]` and `/devlog/[slug]` show the compiled body: `+page.server.ts` returns the entry's data as before (no HTML), a universal `+page.ts` adds `body` from `src/lib/bodies.ts` (lazy globs of posts, with the drafts marker, and Devlog entries, both languages; keyed by `Entry.path`). The `/spike` route is gone.

- **Links in a body are localized at run time** (`mdsvex/Link.svelte`, replacing `a`; `links.base` dropped from the options): one compiled body serves both languages (an untranslated post shows its English file on the Spanish page), so the language can't be baked in. The page's language comes from a context (`mdsvex/locale.ts`: the `[slug]` pages set `getLocale`, the CMS preview the file's language), because `getLocale()` reads SvelteKit's page state, which the CMS build doesn't have. `https://` links get `rel="external"` again, from `@mdsvex/plugin-external-links` (0.1.1, MIT; `rel: ['external']`, `internal_hosts: ['abafdez.github.io']`, in `compileOptions`), so `Link.svelte` only localizes.
- The `~` image: `\~` in both languages (a CommonMark escape, `~` on GitHub and in Obsidian too).
- **Compared with `main`'s build** (built in a worktree), block by block, `rel` included: **156 of 158** pages identical in English and in Spanish; the two left are the `video` and `yt` blocks (step 2).
- `pnpm check`, lint, 1,247 unit tests, 27 e2e tests.

Other first-party plugins, looked at 2026-11-26 (all MIT, 0.1.x): later, `page-data` (prose-only reading time, excerpt, `edit_url`, `last_modified: 'git'`; with the `?data` step), `toc`, `diagram` (mermaid, which Obsidian and GitHub draw too), `tabs`/`steps`/`elements` (directives, with the components decision); skipped: callouts, figures, code-blocks, anchors (ours, in portable syntax), embeds (YouTube's player calls Google), link-check (the prerender crawler already fails the build), references (write `<https://…>` instead), emoji. Search: Pagefind stays (mdsvex's `?text` recipe is for JS search libraries); `?text` + `?metadata` would make an RSS feed and `llms.txt` easy.

**Step 2 done: the blocks.** `src/lib/mdsvex/blocks.ts` is a plugin bundle: it claims the `video` and `yt` fences (the highlighter never sees them), checks the YAML with `readBlock()` and turns each fence into a directive leaf (`wrap_from('directive_leaf', { name, args })`, then the fence is removed), drawn by `mdsvex/blocks/` (adapters over `markdown/blocks/`; directive props are strings, sizes become numbers again). A plugin can't add imports, so a block's `./` files go into the post's `plugin_data.blocks.files` (`ctx.add`); `bodies.ts` reads them from the module and loads them with `mdsvex/media.ts` (was `markdown/media.server.ts`, now universal; images as `?enhanced`, the specifier mdsvex writes, so a picture a post also shows is one module); the page hands them down as a context (`mdsvex/context.ts`, was `locale.ts`, now language + files). The CMS preview gives Sveltia's files through the same context and needs `'svelte'` in its module list (a post with plugin data imports `setContext`). Also ported: an image must be a `./` file with alt text (`checkImage` in `plugins.ts`). **158 of 158 pages match `main`'s build in each language** (same hashed files), client navigation loads the files, all 72 previews match the build, 27 e2e tests.

**Step 3 done: svelte-markdown is gone.** Removed: marked, `@humanspeak/svelte-markdown`, `parse.ts`, `render.server.ts`, the renderers, `highlight.ts` and the 11 `@twinkleplop/*` packages (mdsvex brings its own), the old preview body (`cms/markdown.svelte.ts`) and `sourceOf()`. **One folder, `src/lib/markdown/`**: `options.ts`, `plugins.ts`, `blocks-plugin.ts`, `components.ts`, `context.ts`, `media.ts` (the `Media` interface + the loader) and the components (`Heading`, `Pre` (was `CodeBlock`), `Table`, `Blockquote`, `Callout`, `CalloutTitle`, `Link`, `blocks/Video`, `blocks/Yt`), the adapters folded in. The copy button follows the page's language again. Tests: `render.test.ts` writes markdown to a temporary file, imports it through Vite's mdsvex plugin and renders it with `svelte/server` and the page's contexts (14); `plugins.test.ts` uses `compile()` (14); `cms/mdsvex.test.ts` keeps React's effect rule (1). Known: a callout's custom title keeps only its text (`> [!tip] *x*` loses the emphasis; no post has one).

**Decided (Alfonso, 2026-11-26): components in posts are directives**, all three forms: `:name[text](args)` inline, `::name[label](args)` a leaf on its own line, `:::name … :::` a container. No `<Component>` tags or `{ }` in posts (those rules stay). Obsidian and GitHub show directives as plain text; the site draws them. First candidates: the first-party plugins (tabs, steps, elements: details, kbd, badge, abbr) and our own (live demos).

**Lighthouse (2026-11-26, mobile, median of 3, five pages, against `main`'s build):** accessibility, best practices and SEO 100 on both, CLS 0, TBT 0. First measured, mdsvex was 1–5 performance points lower and 13–26 kB gzip heavier on a first visit; two causes, both fixed: one glob of every body in both sections and languages (11 kB on every post page; now one glob per section with short keys, `base`, and the files' list only when a post's blocks have files) and the YAML parser in posts with a block (12 kB; the components' helpers moved to `markdown/blocks/values.ts`). After the fixes:

| page                                          | perf `main` → mdsvex | FCP s       | LCP s       | first visit kB gzip |
| --------------------------------------------- | -------------------- | ----------- | ----------- | ------------------- |
| longest post (`theme-toggle-view-transition`) | 79 → 80              | 3.53 → 3.61 | 4.06 → 3.90 | 94.3 → 102.8        |
| video post                                    | 82 → 81              | 3.16 → 3.46 | 3.83 → 3.83 | 86.1 → 97.6         |
| YouTube post                                  | 85 → 82              | 3.16 → 3.46 | 3.46 → 3.75 | 87.4 → 99.8         |
| Devlog entry (`colour-themes`)                | 86 → 82              | 3.08 → 3.45 | 3.31 → 3.75 | 86.0 → 95.9         |

What's left of the gap: the body is a JS chunk now (its HTML is smaller, the two about even out), the replacement components, and one section's list of bodies (a few kB). Hydrating a long body costs nothing measurable (TBT 0).

Next: step 4, clean-up: docs (`docs/customizing/` 01, 02, 08, the publishing guide, CLAUDE.md), dated update notes on the posts that describe svelte-markdown and Shiki (en + es), a Devlog entry, a draft and the vault copy, the board card; upstream reports; mdsvex 1.1.0 once pnpm allows it.
