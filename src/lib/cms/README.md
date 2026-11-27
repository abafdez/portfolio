# Sveltia CMS on this site

This folder (`src/lib/cms/`) adds [Sveltia CMS](https://sveltiacms.app/en/docs) (0.262.0, pinned) to a personal SvelteKit site, as an editor for its markdown posts, its dev-log entries and one YAML list. It runs in `pnpm dev` at `/admin` (the local workflow), and on the live site at `/portfolio/admin/`, built by its own Vite config (see "On the live site"). Sveltia itself is used as published, imported from npm: no fork, no patch. Everything here goes through its JavaScript API.

This file explains how the pieces are wired, for anyone reading the code, and for Sveltia's author, who we'd like to show it to.

## On the live site

`pnpm build` runs two builds: the site (SvelteKit), then `vite build -c src/lib/cms/vite.config.ts`, which compiles `index.html` + `main.ts` (and the site code they import: the markdown components, `blocks.ts`, Prettier) with the plain Svelte plugin into `build/admin/`. Not a SvelteKit route, for the same reason as in dev: the site's layout and global CSS would wrap it. Two differences from dev:

- `covers.ts` is swapped for `covers.hosted.ts`: its glob would copy every original cover into the build (23 MB) just for the preview's header. The build writes down each cover's URL on raw.githubusercontent.com instead (repo and branch from `config.yml`); a cover added in the CMS and not merged yet comes from `getAsset()` first.
- The Awesome list's "page as last saved" preview is dev only.

Signing in, three ways:

1. **Sign In with GitHub**: needs `backend.base_url`, the URL of [Sveltia's authenticator](https://github.com/sveltia/sveltia-cms-auth), a Cloudflare Worker we deploy ourselves. It uses a GitHub App, which only gets access to the repos it's installed on; its tokens expire after 8 hours and refresh by themselves. Setup:
   1. Deploy the Worker (the "Deploy to Cloudflare Workers" button in its README) and copy its URL, `https://sveltia-cms-auth.<subdomain>.workers.dev`.
   2. Register a GitHub App from the README's prefilled link: Redirect URI `<worker URL>/callback`; Contents and Pull requests read and write; no webhook. Copy its Client ID, create a client secret under Credentials, then install it on `abafdez/portfolio` only.
   3. In the Worker's settings (Runtime variables and secrets): `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` (as a secret), and `ALLOWED_DOMAINS` = `abafdez.github.io`.
   4. Uncomment `base_url` in `config.yml` with the Worker's URL, commit, deploy.
2. **Sign In Using Access Token**: a fine-grained token, only this repo, Contents and Pull requests read and write, with an expiry. Works without the Worker.
3. **Work with Local Repository**: as in dev (Chrome or Edge), on a clone.

Sveltia keeps the token in the browser's storage for `abafdez.github.io`, which every GitHub Pages site of this account shares: a script on another `abafdez.github.io/<repo>` site could read it. Keep JavaScript you didn't write off those sites.

## The content it edits

- `content/blog/{published,drafts}/<slug>/<slug>.md`, and `content/bitacora/<slug>/<slug>.md` (the dev log): one folder per entry, its images next to it, written `![alt](./diagram.png)`.
- `<slug>.es.md` next to the English file: the Spanish version, with only the words in its frontmatter (`title`, `description`, `cover` (the cover's alt text), `reviewed`).
- Directives for components: `::yt[…](…)`, `::video[…](…)` (fields checked by `src/lib/blocks.ts`), and `:kbd`, `:::details`, `:::compare`, `:::tabs`, `:::steps`, `::toc`, written by hand (`content/blog/posts/README.md`).
- `content/awesome/<slug>.yaml`: the Awesome lists, a folder collection (New makes a list, its file name from the English title), every text `{ en, es }`, an icon picked with the icon picker.
- `content/site.yaml`: the site settings (name, tagline, role, hiring texts, contact email, profile links), a singleton ("Site settings" in the sidebar), read by `src/lib/site.ts`.

The site compiles them with [mdsvex](https://mdsvex.pngwn.at) 1.0: each `.md` file is a Svelte component. `src/lib/markdown/` has our parse plugins (`plugins.ts`: callouts, figures, checks) and the components that replace elements (headings, code blocks, tables, links). HTML or `{ }` written in a post fails the build.

## The files

| File                                                                                        | What it does                                                                                             | Sveltia API                                                                      |
| ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `plugin.ts`                                                                                 | A Vite plugin, dev only (`apply: 'serve'`): serves `index.html` at `/admin`, and two dev-server settings | –                                                                                |
| `main.ts`                                                                                   | Imports Sveltia from npm, registers everything below, then starts it with `config.yml`                   | `CMS_MANUAL_INIT`, `init({ config })`                                            |
| `config.yml`                                                                                | Collections, fields, i18n, media folders                                                                 | config                                                                           |
| `formats.ts` + `../content-files.ts`                                                        | How files are read and written                                                                           | `registerCustomFormat()`                                                         |
| `components.ts`                                                                             | The code-block components as editor components                                                           | `registerEditorComponent()`                                                      |
| `preview.ts`, `mdsvex.svelte.ts`, `svelte-runtime.ts`, `PreviewImage.svelte`, `preview.css` | The preview pane                                                                                         | `registerPreviewTemplate()`, `registerPreviewStyle()`, `registerEventListener()` |
| `focal.svelte.ts`, `Focal.svelte`                                                           | A field for the cover's focal point                                                                      | `registerFieldType()`                                                            |
| `icon.svelte.ts`, `IconPicker.svelte`, `lucide-names.ts`                                    | The icon picker (field type `lucide`), and the Vite plugin that lists Lucide's icon names                | `registerFieldType()`                                                            |
| `covers.ts`                                                                                 | The cover next to each entry, as a URL (a Vite glob): for the focal field and the preview's header       | –                                                                                |

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
- `pattern`: the whole line, `::name[label](arguments)` with the `m` flag;
- `fromBlock` / `toBlock`: the label field in the brackets (`[`, `]` and `\` escaped), the others as `name=value` arguments, in double quotes when a value has a space, a comma, a parenthesis or a quote, `./` added to file paths (`components.test.ts` checks that the build reads back what they write);
- `toPreview`: one line, the block's name and title. The preview pane next to the editor draws the real block with the site's own component, so there's no second copy of its markup to drift.

They're edited in a dialog (`mode: 'dialog'`). A ` ```md ` example containing a `::video` line stays a code block.

## The preview

The site's markdown depends on its own code: callouts, code-block components, highlighting coloured by our tokens, covers. Sveltia's default preview doesn't know them, so posts and dev-log entries get a preview template that runs that code (dev and hosted):

```text
entry data (every change) → preview.ts → compilePost() (mdsvex.svelte.ts)
     markdown → mdsvex compile() → Svelte source → svelte/compiler → a module → mount()
                    ↑ the build's own options (src/lib/markdown/options.ts) and replacements
```

- A post is a Svelte component in the build (mdsvex), so `preview.ts` compiles the body in the browser the same way, about 150 ms after the typing pauses: `mdsvex/compile` with the build's options (`compileOptions`: heading ids, our parse plugins, external links) and highlighting (`create_highlight` over mdsvex's languages), then Svelte's compiler, then `mount()` into the frame from a React component. Each compile is a new component, mounted in place of the last.
- The compiled module imports Svelte's runtime and our replacements by name (`'svelte/internal/client'`, `'preview:components'`, each plugin's module). A browser can't resolve names, so only the imports at the top are rewritten to `blob:` modules that hand out this bundle's own copies: the same Svelte that mounts the post (`blob-modules.ts`; the module name is the string after `from`, since an export name can be a string too). Svelte forbids importing `svelte/internal/*` in `.svelte.ts` (it's private), so that import lives in `svelte-runtime.ts`.
- **Live demos run in a sandbox.** A ` ```svelte run ` block is code the post's author wrote, and this page holds the GitHub token, so it never runs here. `compile()` gets `snippets: (s) => 'preview:snippet/' + s.hash`, and each such module is `SandboxDemo.svelte` bound to the block's code (marked `sandboxed`, so `markdown/Pre.svelte` draws it). It compiles the demo and posts the JavaScript to `<iframe sandbox="allow-scripts">` (no `allow-same-origin`: an opaque origin, no storage, no cookies, no access to this page, no navigating the tab) loading `demo.html`, whose `demo-runner.ts` imports it with its own copy of Svelte and mounts it, then sends back its height and any error, the only two messages accepted, and only from that frame. The runner answers the window that asked, not `parent`: Sveltia's preview is a frame of its own. Its module scripts load with CORS from origin `null`: GitHub Pages sends `Access-Control-Allow-Origin: *`, the dev server allows `null` (`plugin.ts`), `scripts/serve.ts` sends `*`. Script blocks (` ```ts run `) don't run in the preview: a line says so. Checked with a demo that tries `localStorage`, `parent.document`, `document.cookie` and `top.location`: all four throw `SecurityError`.
- The parse plugins throw everything the build would stop on (HTML or a Svelte block or tag in the text, an unknown callout): the preview shows that error instead of the body. A plain `{expression}` (allowed in posts) is shown as inline code, its source, never run (`preview-braces.ts`): the preview runs in the CMS page, next to the GitHub token. Demos run sandboxed (below).
- `./` images are drawn by `PreviewImage.svelte` (replacing `img` here only) from `getAsset()`, through a context backed by `$state.raw`: Sveltia answers with an empty URL while it reads a file. Links get the file's language through `markdown/context.ts`'s context.
- About 490 kB gzip more than svelte-markdown's old preview (Svelte's compiler, mdsvex's compiler and its grammars), loaded only by the CMS; a warm compile takes a few milliseconds.
- It also draws the post's header (date, reading time from the site's `readingTime()`, title, description, tags, and the cover: one just added, from `getAsset()`, or the saved one from `covers.ts`).
- `registerPreviewStyle(css, { raw: true })` gives the frame the site's own CSS (`?inline` imports of the fonts, `tokens.css`, `global.css`, where the body's styles live) plus `preview.css`, a copy of `ArticleHeader.svelte`'s styles, which can't reach the frame.

The Awesome list keeps Sveltia's default preview when hosted, and in dev shows its page as last saved (reloaded on `postSave`).

## The icon picker (field type `lucide`)

A searchable grid of the real Lucide icons, for an Awesome list's `icon`. It stores the name as written on lucide.dev (`sparkles`), which `src/lib/glyph.server.ts` turns into the icon at build time (and fails on a name that doesn't exist). Built like the focal field: `icon.svelte.ts` is a small React control that mounts `IconPicker.svelte`.

- **The names** come from the package's file names, one file per icon: `lucide`'s `icons` object has PascalCase keys plus old aliases of the same icons, and a browser can't list files. So `lucide-names.ts` is a Vite plugin that reads them at build time and serves them as `virtual:lucide-names` (in both the main config, for dev, and the CMS build's).
- **The drawings** come from `lucide` itself, imported only when a picker is shown, and drawn with the site's own `Glyph.svelte`.
- The grid shows the first 96 matches; every word typed must be in the name ("arrow up" finds `arrow-up-right`).
- Sveltia's own interface uses Material Symbols for its buttons (`icon:` on a collection or a custom page); those can't be Lucide.

## Site settings (a singleton)

`content/site.yaml` holds what used to be hardcoded or in the message files: the site name (header, page titles, footer), the tagline (home page, hire panel), the role (business-card looks), the hiring texts, the contact email (the hire panel's Email me button; empty, no button) and the GitHub and LinkedIn links. It's a [singleton](https://sveltiacms.app/en/docs/collections/singletons): "Site settings" in the sidebar, with `format: list`.

The site reads it through `src/lib/site.ts`, which imports `/content/site.yaml?data`: a small Vite plugin (`src/lib/yaml-data.ts`) parses the YAML at build time, so pages get plain JSON and no YAML parser ships to visitors. `checkSite()` fails the build on a missing translation, a link that isn't `https://` or an email that isn't one.

`writeList()` (`content-files.ts`) leaves out empty top-level fields, so an unset email or icon isn't written as `''`.

## The focal-point field

`focal.svelte.ts` is a field type whose control is a Svelte 5 component: a small React component that gives Svelte an element to mount into, and passes the props through a `$state` object (the same approach as the Svelte example in the preview-templates docs). It stores `focus: x% y%` in the frontmatter; the site doesn't use it yet. The cover's URL comes from `covers.ts`.

## Choices in `config.yml`

- `i18n: { structure: multiple_files, omit_default_locale_from_file_path: true, initial_locales: default }`: `<slug>.md` + `<slug>.es.md`, new entries in English only.
- `media_folder: /content/blog/posts/{{slug}}` and `public_folder: .`: uploads land in the entry's own folder and are written `./file.png`. (With `media_folder: ''` and `path: '{{slug}}/{{slug}}'` they went to a `<slug>/` subfolder, as the docs describe for a path ending in a template tag.)
- Drafts and published posts are one collection: `draft: true` in the frontmatter (a `select` labelled "Hidden on the site (draft)", plus a Drafts filter) instead of two folders. Sveltia can't move an entry between collections, so with two folders publishing needed a terminal. A build leaves drafts out with a small Vite plugin (`src/lib/drafts.ts`): globs can't read frontmatter, and every file a glob matches reaches the build.
- `publish_mode: editorial_workflow` with `stages: [draft, pending_publish]` and `direct_publish: true`, plus `squash_merges: true` on the backend: signed in with GitHub, every save goes to a `cms/<collection>/<slug>` branch and pull request (CI builds it), Publish merges it as one commit, Save and Publish commits to `main`. No "In review" stage: GitHub doesn't let you approve your own pull request. The local-repository workflow ignores it. Our CI commits the image cache only on `main`, never on `cms/` branches: Sveltia refuses to publish a pull request that holds files other than the entry's.
- `thumbnail` on the posts collection is a list of file paths (`/content/blog/posts/{{slug}}/cover.avif`, then `.png`, `.jpg`, `.jpeg`, `.webp`): the cover isn't a field (`cover:` is its alt text) but a file found by name, and Sveltia takes a value starting with `/` as a path with template tags, using the first one that exists.
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
- **A React effect must return a function or nothing.** The old preview body (`markdown.svelte.ts`, svelte-markdown's) handed new props to Svelte with `useEffect(() => update(props))`, and `update` returned the props, so React called that object as the effect's cleanup on the next keystroke: `l is not a function` in react-dom, and the preview stopped updating. `mdsvex.test.ts` renders today's (`mdsvexBody`) three times under a stand-in React that keeps that rule.
- **The npm build and Vite's dependency optimizer:** pre-bundling moves its code away from its `assets/` folder; exclude it.

And what worked well from the start: the local workflow with no server (also from WSL, choosing "Linux" in Chrome's folder picker), `multiple_files` translations with per-field `i18n`, entry-relative media, Save staying disabled until something changes, and custom formats and editor components being enough to fit an existing content layout without changing it.
