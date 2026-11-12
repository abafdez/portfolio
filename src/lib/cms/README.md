# Sveltia CMS on this site

This folder (`src/lib/cms/`) adds [Sveltia CMS](https://sveltiacms.app/en/docs) (0.262.0, pinned) to a personal SvelteKit site, as an editor for its markdown posts, its dev-log entries and one YAML list. For now it runs only in `pnpm dev`, at `/admin`, through the local workflow; a hosted version against the GitHub repo is planned. Sveltia itself is used as published, imported from npm: no fork, no patch. Everything here goes through its JavaScript API.

This file explains how the pieces are wired, for anyone reading the code, and for Sveltia's author, who we'd like to show it to.

## The content it edits

- `content/blog/{published,drafts}/<slug>/<slug>.md`, and `content/bitacora/<slug>/<slug>.md` (the dev log): one folder per entry, its images next to it, written `![alt](./diagram.png)`.
- `<slug>.es.md` next to the English file: the Spanish version, with only the words in its frontmatter (`title`, `description`, `cover` (the cover's alt text), `reviewed`).
- Code blocks whose language is a component name (` ```yt `, ` ```video `) with YAML inside: the build turns them into components (`src/lib/blocks.ts`).
- `content/awesome/modern-css.yaml`: a list, every text `{ en, es }`.

The site renders them with [svelte-markdown](https://markdown.svelte.page) (marked's tokens drawn by Svelte components), on the server: `src/lib/markdown/` has the parsing (`parse.ts`: callouts, figures, checks), the renderers, Shiki and enhanced-img. HTML written in a post fails the build: every element comes from a renderer.

## The files

| File                                              | What it does                                                                                       | Sveltia API                                                                      |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `plugin.ts`                                       | A Vite plugin, dev only (`apply: 'serve'`): the page at `/admin`, and two dev-server settings      | –                                                                                |
| `main.ts`                                         | Imports Sveltia from npm, registers everything below, then starts it with `config.yml`             | `CMS_MANUAL_INIT`, `init({ config })`                                            |
| `config.yml`                                      | Collections, fields, i18n, media folders                                                           | config                                                                           |
| `formats.ts` + `../content-files.ts`              | How files are read and written                                                                     | `registerCustomFormat()`                                                         |
| `components.ts`                                   | The code-block components as editor components                                                     | `registerEditorComponent()`                                                      |
| `preview.ts`, `markdown.svelte.ts`, `preview.css` | The preview pane                                                                                   | `registerPreviewTemplate()`, `registerPreviewStyle()`, `registerEventListener()` |
| `focal.svelte.ts`, `Focal.svelte`                 | A field for the cover's focal point                                                                | `registerFieldType()`                                                            |
| `covers.ts`                                       | The cover next to each entry, as a URL (a Vite glob): for the focal field and the preview's header | –                                                                                |

## Loading it

`plugin.ts` answers `/admin` with a page that has one script, `main.ts`. Everything else is ordinary source that Vite serves, like the site's: `main.ts` sets `window.CMS_MANUAL_INIT`, then imports `@sveltia/cms` from npm (a dynamic `import()`: a static one would be hoisted above the flag), registers our pieces, and calls `init({ config })`.

- **Not a top-level `await`** for that import: the page's `DOMContentLoaded` waits for `main.ts` to finish, and Sveltia's module waits for `DOMContentLoaded`. It hung with no error.
- **`config.yml` is read by our code** (`?raw` + the `yaml` package with `merge: true`) and passed as an object with `load_config_file: false`. The shared fields are YAML anchors under a top-level `fields:` key, which `main.ts` drops, so Sveltia no longer warns about it.
- **`optimizeDeps.exclude: ['@sveltia/cms']`**: its build loads fonts and wasm files with `new URL('./assets/…', import.meta.url)`; served as it is from `node_modules`, they're found. The CMS's other dependencies are in `optimizeDeps.include`, so Vite doesn't find them late and reload the page.
- **Why `/admin` isn't a SvelteKit route:** every route sits inside the site's root layout (header, nav, the global CSS, the colour themes), and a route would be part of the build. A page of its own keeps the CMS out of both. Sveltia's build uses `import.meta.hot`, so Vite's client is on the page anyway; changing a content file (as a save does) doesn't reload it (checked).

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

`components.ts` turns every block in the site's registry (`src/lib/blocks.ts`: field names and kinds) into an editor component, so a new block needs no CMS code:

- `fields`: one per block field (text → `string`, file → `file`, size → `number`);
- `pattern`: the whole fenced block, `^```name\n…\n```$` with the `m` flag;
- `fromBlock` / `toBlock`: the YAML inside, one `name: value` line each, `./` added to file paths;
- `toPreview`: one line, the block's name and title. The preview pane next to the editor draws the real block with the site's own component, so there's no second copy of its markup to drift.

They're edited in a dialog (`mode: 'dialog'`). A ` ````md ` example containing a ` ```video ` block stays a code block.

## The preview

The site's markdown depends on its own code: callouts, code-block components, Shiki with its own theme, covers. Sveltia's default preview doesn't know them, so posts and dev-log entries get a preview template that runs that code (dev and hosted):

```text
entry data (every change) → preview.ts → parse() + Shiki's languages
                          → <Markdown> mounted live (markdown.svelte.ts) + header, in the preview frame
                                         ↑
                    the site's own src/lib/markdown/: the same code that renders the page
```

- `preview.ts` parses the body with the site's `parse()` about 150 ms after the typing pauses, loads the code's languages, and hands the tokens to `markdown.svelte.ts`. That mounts the site's own `Markdown.svelte` (svelte-markdown and our renderers) into the frame from a React component, with the props behind getters over a `$state.raw` value. The page and the preview are drawn by the same components: in the build they're rendered to HTML on the server, here they run in the browser.
- `parse()` throws everything the build would stop on (HTML in the text, an unknown callout, a block with a wrong field, an image without alt text or from another site): the preview shows that error instead of the body.
- `./` files go through `getAsset()` on every render, as a `Media` the renderers ask (`src/lib/markdown/media.ts`; the build's is `media.server.ts`). A picture is shown as it is: enhanced-img's copies only exist in the build.
- It also draws the post's header (date, reading time from the site's `readingTime()`, title, description, tags, and the cover: one just added, from `getAsset()`, or the saved one from `covers.ts`).
- `registerPreviewStyle(css, { raw: true })` gives the frame the site's own CSS (`?inline` imports of the fonts, `tokens.css`, `global.css`, where the body's styles live) plus `preview.css`, a copy of `ArticleHeader.svelte`'s styles, which can't reach the frame.

The Awesome list keeps Sveltia's default preview when hosted, and in dev shows its page as last saved (reloaded on `postSave`).

## The focal-point field

`focal.svelte.ts` is a field type whose control is a Svelte 5 component: a small React component that gives Svelte an element to mount into, and passes the props through a `$state` object (the same approach as the Svelte example in the preview-templates docs). It stores `focus: x% y%` in the frontmatter; the site doesn't use it yet. The cover's URL comes from `covers.ts`.

## Choices in `config.yml`

- `i18n: { structure: multiple_files, omit_default_locale_from_file_path: true, initial_locales: default }`: `<slug>.md` + `<slug>.es.md`, new entries in English only.
- `media_folder: /content/blog/published/{{slug}}` and `public_folder: .`: uploads land in the entry's own folder and are written `./file.png`. (With `media_folder: ''` and `path: '{{slug}}/{{slug}}'` they went to a `<slug>/` subfolder, as the docs describe for a path ending in a template tag.)
- `reviewed` (translations only) is a `select` with no default, so the English file never gets one. A `boolean` field always writes `true` or `false`.
- Tags are a plain `list`. The build checks that they're kebab-case.
- Shared fields are YAML anchors under a top-level `fields:` key, dropped by `main.ts` before Sveltia sees it.

## What changed outside this folder

- `vite.config.ts`: imports the plugin.
- `src/lib/content-files.ts`, `scripts/content-format.ts`, and their tests.
- The content itself: 74 titles lost quotes they didn't need; the Awesome list's comments moved to `content/awesome/README.md`, and one category name became `{ en, es }` (a field has one shape).

Removed on 2026-11-11 (on `spike/svelte-markdown`): a "Real page" tab that wrote the unsaved entry to a hidden `.preview.md` for the site's page to render with `?preview`. Once the preview drew with the page's own components, it wasn't worth the endpoint, the hidden files and the `?preview` branches in the pages.

## Notes from setting it up (0.262.0)

Things we ran into, in case they're useful:

- **Types:** `main.d.ts` re-exports from `./services/api` and `./types/public`, which aren't in the published package. The npm import still type-checks; `main.ts` casts the definitions it passes.
- **`pattern` on a `list` field** without a `field`: valid tags were all reported as failing it. Moving the pattern to an item `field` worked, but turned each tag into a collapsible box, so the rule was dropped.
- **Raw preview styles** are injected into a `blob:` document, where a root-relative `url(/…)` (the fonts) has nothing to resolve against; `preview.ts` makes them absolute.
- **YAML anchors** in `config.yml` need a top-level key to live under, which produces a warning when Sveltia loads the file itself. An ignored prefix (like `x-`) would make that quiet. With `init({ config })` we parse it ourselves and drop the key.
- **The npm build and a top-level `await`:** awaiting `import('@sveltia/cms')` at the top of a module script deadlocks with `DOMContentLoaded` (see "Loading it").
- **A React effect must return a function or nothing.** `markdown.svelte.ts` handed new props to Svelte with `useEffect(() => update(props))`, and `update` returned the props, so React called that object as the effect's cleanup on the next keystroke: `l is not a function` in react-dom, and the preview stopped updating. `markdown.test.ts` renders it three times under a stand-in React that keeps that rule.
- **The npm build and Vite's dependency optimizer:** pre-bundling moves its code away from its `assets/` folder; exclude it.

And what worked well from the start: the local workflow with no server (also from WSL, choosing "Linux" in Chrome's folder picker), `multiple_files` translations with per-field `i18n`, entry-relative media, Save staying disabled until something changes, and custom formats and editor components being enough to fit an existing content layout without changing it.
