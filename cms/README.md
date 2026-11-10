# Sveltia CMS on this site

This folder adds [Sveltia CMS](https://sveltiacms.app/en/docs) (0.262.0, pinned) to a personal SvelteKit site, as an editor for its markdown posts, its dev-log entries and one YAML list. For now it runs only in `pnpm dev`, through the local workflow; a hosted version against the GitHub repo is planned. Sveltia itself is used as published: no fork, no patch. Everything here goes through its JavaScript API.

This file explains how the pieces are wired, for anyone reading the code, and for Sveltia's author, who we'd like to show it to.

## The content it edits

- `content/blog/{published,drafts}/<slug>/<slug>.md`, and `content/bitacora/<slug>/<slug>.md` (the dev log): one folder per entry, its images next to it, written `![alt](./diagram.png)`.
- `<slug>.es.md` next to the English file: the Spanish version, with only the words in its frontmatter (`title`, `description`, `cover` (the cover's alt text), `reviewed`).
- Code blocks whose language is a component name (` ```yt `, ` ```video `) with YAML inside: the build turns them into components (`src/lib/blocks.ts`).
- `content/awesome/modern-css.yaml`: a list, every text `{ en, es }`.

The site builds them with mdsvex, a few rehype plugins (callouts, tables, heading ids and links), Shiki and enhanced-img (`vite.config.ts`).

## The files

| File                                         | What it does                                                                                                                                                                                    | Sveltia API                                                                      |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `plugin.ts`                                  | A Vite plugin, dev only (`apply: 'serve'`): serves `/admin/index.html`, `config.yml` and Sveltia's own build from `node_modules`; a cover route; the endpoint the "Real page" preview writes to | –                                                                                |
| `index.html`                                 | Sets `CMS_MANUAL_INIT`, loads `sveltia-cms.js`, then `main.ts`                                                                                                                                  | `CMS_MANUAL_INIT`                                                                |
| `config.yml`                                 | Collections, fields, i18n, media folders                                                                                                                                                        | config                                                                           |
| `main.ts`                                    | Registers everything below, then starts the CMS                                                                                                                                                 | `init()`                                                                         |
| `formats.ts` + `../src/lib/content-files.ts` | How files are read and written                                                                                                                                                                  | `registerCustomFormat()`                                                         |
| `components.ts`                              | The code-block components as editor components                                                                                                                                                  | `registerEditorComponent()`                                                      |
| `render.ts`, `preview.ts`, `preview.css`     | The preview pane                                                                                                                                                                                | `registerPreviewTemplate()`, `registerPreviewStyle()`, `registerEventListener()` |
| `focal.svelte.ts`, `Focal.svelte`            | A field for the cover's focal point                                                                                                                                                             | `registerFieldType()`                                                            |

## Saving: our own file format

Sveltia reads a file into data and writes data back into a file. With its own writer, the first save of a post turned `tags: [a, b]` into a block list and changed quotes, in that file and in the untouched translation next to it. That's correct YAML, but every save brought unrelated lines into the diff, and hand edits in Obsidian put them back.

So `config.yml` uses two custom formats, `entry` (markdown with frontmatter) and `list` (YAML):

```text
file → readEntry() → data → (Sveltia forms) → data → writeEntry() → Prettier → file
```

- `src/lib/content-files.ts` holds `readEntry`/`writeEntry` and `readList`/`writeList`: frontmatter keys in a fixed order, short lists of plain values in flow style, quotes only where YAML needs them, the body as `body`. It has no Node imports, so the same code runs in the CMS and in Node.
- `formats.ts` runs Prettier's standalone build on the result, with the repo's own config, so whatever the CMS writes passes `pnpm lint`.
- `src/lib/content-files.test.ts` runs every file in `content/` through read → write → Prettier and expects the same bytes. That's the guarantee that a save changes only what was edited. `pnpm content:format` brings files edited by hand into that shape.

## Editing: our blocks as editor components

`components.ts` turns every block in the site's registry (`src/lib/blocks.ts`: field names, kinds and a `render()`) into an editor component, so a new block needs no CMS code:

- `fields`: one per block field (text → `string`, file → `file`, size → `number`);
- `pattern`: the whole fenced block, `^```name\n…\n```$` with the `m` flag;
- `fromBlock` / `toBlock`: the YAML inside, one `name: value` line each, `./` added to file paths;
- `toPreview`: the block's own `render()`, which is what the site outputs.

They're edited in a dialog (`mode: 'dialog'`). A ` ````md ` example containing a ` ```video ` block stays a code block.

## The preview

The site's markdown depends on things only its build does: callouts, code-block components, Shiki with its own theme, covers. Sveltia's default preview doesn't know them, so posts and dev-log entries get a preview template with two tabs.

**Preview** (dev and hosted):

```text
entry data (every change) → preview.ts → render.ts → HTML + header, in the preview frame
                                         ↑
                    the build's own plugins, imported from src/lib
```

- `render.ts` turns the body into HTML in the browser: unified with remark-parse, remark-gfm, remark-rehype and rehype-raw, then, as in the build, the blocks (`renderBlock()`) or Shiki for each code block, and the same rehype plugins (`rehypeCallouts`, `rehypeTables`, rehype-slug, rehype-autolink-headings). It's tested in `render.test.ts`.
- `preview.ts` draws the post's header (date, reading time, title, description, tags, cover) and that HTML, about 150 ms after the typing pauses. A block or callout the build would refuse shows the build's error instead. `./` paths go through `getAsset()` on every render.
- `registerPreviewStyle(css, { raw: true })` gives the frame the site's own CSS (`?inline` imports of the fonts, `tokens.css`, `global.css`) plus `preview.css`, a copy of two component styles that can't reach the frame.
- What it can't do like the build: enhanced-img (pictures are shown as they are) and mdsvex's parsing (an older markdown parser, curly quotes).

**Real page** (dev only), for checking what the Preview can't:

```text
entry data → POST /admin/preview → <slug>/.preview.md (hidden, git-ignored)
           → the post's page with ?preview renders that file → iframe
```

- `plugin.ts` writes the file only for requests from the CMS page's own origin, and only for entry files.
- `src/lib/preview.ts` names the file; the blog and dev-log `[slug]` pages render it when the URL has `?preview` (in dev only: those pages are prerendered only in the build, since SvelteKit refuses `url.searchParams` on a prerendered page).
- Vite reloads the page when the file changes, and SvelteKit keeps the scroll position.

The Awesome list keeps Sveltia's default preview when hosted, and in dev shows its page as last saved (reloaded on `postSave`).

## The focal-point field

`focal.svelte.ts` is a field type whose control is a Svelte 5 component: a small React component that gives Svelte an element to mount into, and passes the props through a `$state` object (the same approach as the Svelte example in the preview-templates docs). It stores `focus: x% y%` in the frontmatter; the site doesn't use it yet. The cover is served in dev by `plugin.ts` (`/admin/cover/<folder>`).

## Choices in `config.yml`

- `i18n: { structure: multiple_files, omit_default_locale_from_file_path: true, initial_locales: default }`: `<slug>.md` + `<slug>.es.md`, new entries in English only.
- `media_folder: /content/blog/published/{{slug}}` and `public_folder: .`: uploads land in the entry's own folder and are written `./file.png`. (With `media_folder: ''` and `path: '{{slug}}/{{slug}}'` they went to a `<slug>/` subfolder, as the docs describe for a path ending in a template tag.)
- `reviewed` (translations only) is a `select` with no default, so the English file never gets one. A `boolean` field always writes `true` or `false`.
- Tags are a plain `list`. The build checks that they're kebab-case.
- Shared fields are YAML anchors under a top-level `fields:` key, which Sveltia warns about and ignores.

## What changed outside `cms/`

- `vite.config.ts`: the plugin; `dynamicCompileOptions` compiling `cms/` components without HMR and with injected CSS (otherwise they load Vite's client into the CMS page, and Vite's full reload on every markdown write reloads the CMS, losing unsaved edits); Vitest also runs `cms/**/*.test.ts`.
- `src/routes/{blog,devlog}/[slug]/`: the `?preview` branch and `prerender = !import.meta.env.DEV`.
- `src/lib/content-files.ts`, `src/lib/preview.ts`, `src/lib/preview.server.ts`, `scripts/content-format.ts`, and their tests.
- The content itself: 74 titles lost quotes they didn't need; the Awesome list's comments moved to `content/awesome/README.md`, and one category name became `{ en, es }` (a field has one shape).

## Notes from setting it up (0.262.0)

Things we ran into, in case they're useful:

- **Types:** `main.d.ts` re-exports from `./services/api` and `./types/public`, which aren't in the published package, so TypeScript sees no types. `main.ts` types the parts of the global it uses by hand.
- **`pattern` on a `list` field** without a `field`: valid tags were all reported as failing it. Moving the pattern to an item `field` worked, but turned each tag into a collapsible box, so the rule was dropped.
- **Raw preview styles** are injected into a `blob:` document, where a root-relative `url(/…)` (the fonts) has nothing to resolve against; `preview.ts` makes them absolute.
- **YAML anchors** in `config.yml` need a top-level key to live under, which produces a warning. An ignored prefix (like `x-`) would make that quiet.

And what worked well from the start: the local workflow with no server (also from WSL, choosing "Linux" in Chrome's folder picker), `multiple_files` translations with per-field `i18n`, entry-relative media, Save staying disabled until something changes, and custom formats and editor components being enough to fit an existing content layout without changing it.
