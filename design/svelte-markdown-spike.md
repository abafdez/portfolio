# Spike: svelte-markdown instead of mdsvex

Branch `spike/svelte-markdown`, stacked on `spike/sveltia-cms` (it needs `cms/`). Started 2026-11-11. **A spike: nothing here replaces mdsvex until Alfonso decides.** This file is the handoff for a new conversation: read it, then CLAUDE.md's Phase 11 bullet and `cms/README.md`.

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

## Things to keep

- **Every content file must round-trip** through `src/lib/content-files.ts` + Prettier byte for byte (`content-files.test.ts`). After hand edits: `pnpm content:format`.
- Test the production build: `BASE_PATH=/portfolio pnpm build && BASE_PATH=/portfolio pnpm preview` (restart preview after each build).
- The prerender crawler checks `#links` against heading ids (`prerender_missing_id`): ids must stay the same.
- Callout titles and block texts follow the file's language (`<slug>.es.md` → Spanish), via the file name.
- Image rules the build enforces today: missing file, empty alt (except an explicit `alt=""` on a `yt` thumbnail), a double quote in alt or caption, `<video>` without `width`/`height`.
- Install with pnpm; it may refuse versions younger than its release-age limit: don't add exceptions.
- Alfonso pushes; commit only when he asks. Never port code from GPL or unlicensed repos.

## Docs that would change if this goes ahead

- `cms/README.md` (the build section, "What it can't do like the build").
- The drafts `2026-11-10-a-preview-built-from-my-own-build` (en + es: "What it can't do") and possibly `2026-11-09-a-cms-that-only-changes-what-you-edit`.
- CLAUDE.md (Phase 6's mdsvex notes, `content/` rules about bare tags and images), the publishing guide, a Devlog entry and a draft about the switch.
