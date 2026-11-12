# CMS study: our own, Sveltia CMS or TinaCMS (2026-11-09)

Phase 11 (learning-path.md) asks one question first: build a CMS or adopt a git-based one. This compares three options on what this site needs, leaving the learning value aside. Facts were checked on 2026-11-09 against each project's docs and issue tracker (sources at the end). Points marked **(to test)** couldn't be confirmed from the docs and need a spike.

## What we need

From how the content works today (CLAUDE.md, `content.ts`, `blocks.ts`, `enhance-media.ts`):

1. **The content keeps its shape.** One folder per entry, images next to it (`<slug>/<slug>.md`, `./diagram.png`); translations as `<slug>.es.md` beside the English file, with only `title`, `description`, `cover` and `reviewed` in it; drafts in `drafts/`, which is what keeps them out of the build; Awesome lists as YAML with `{ en, es }` texts.
2. **The markdown isn't rewritten.** Callouts (`> [!tip]`), fenced-block components, HTML in backticks, mdsvex. Saving a file without editing it should leave it as it was.
3. **Our blocks can be edited** (` ```yt `, ` ```video `, callouts), ideally from the `blocks` registry rather than a copy.
4. **Our rules stay in charge.** The build refuses bad tags, missing alt texts, mismatched slugs and so on; the CMS shouldn't save what the build then rejects.
5. **Dev only for now**, never deployed to GitHub Pages.
6. **Standalone later:** a hosted editor that commits to the GitHub repo, with sign-in.
7. **Works from WSL**, where the repo lives.
8. **Translations side by side**, with the `reviewed` flag.
9. **A preview of the real page** (mdsvex, Shiki, enhanced-img only run in our build).
10. **The cover focal point** (the reason the learning path gave for this phase).
11. **No running costs and no extra servers** if possible; little to maintain.

## The three options

**Our own CMS.** A separate SvelteKit app in `cms/`, run with `pnpm cms`. A shared content model in `src/lib/` (parse, check, serialize as plain functions) used by both the build and the CMS; storage behind an interface (local files now, the GitHub API later); CodeMirror 6 for the markdown; the dev site in an iframe as the preview. Plan and challenges as discussed on 2026-11-09: round-trip tests first, then a read-only dashboard, then one content type at a time.

**Sveltia CMS** (MIT, Svelte, pre-1.0 and releasing often). A single-page app loaded from one HTML file plus `config.yml`. Successor to Netlify/Decap CMS. In dev it edits the local repo through the browser's File System Access API (no server); hosted, it talks to the GitHub API from the browser.

**TinaCMS** (Apache-2.0, React). A schema in `tina/config.ts`, a GraphQL data layer and a React admin. In dev, `tinacms dev -c "vite dev"` runs a local server next to Vite; hosted, it needs TinaCloud (SaaS) or a self-hosted backend.

## Side by side

✅ fits · ⚠️ works with changes or limits · ❌ doesn't fit

| Need                                          | Our own                                                                     | Sveltia                                                                                                                                                  | Tina                                                                                                                                   |
| --------------------------------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Folder per entry, images beside            | ✅ by design                                                                | ✅ `path: '{{slug}}/{{slug}}'`, `media_folder: ''`                                                                                                       | ❌ media must live in the public folder (`static/`); co-location "not officially supported"                                            |
| 1. `slug.md` + `slug.es.md`, subset of fields | ✅                                                                          | ✅ `multiple_files` + `omit_default_locale_from_file_path`; per-field `i18n`                                                                             | ❌ no built-in i18n; folders per locale (`en/`, `es/`) or a field per language                                                         |
| 1. Drafts as a folder                         | ✅ a "Publish" that moves it                                                | ⚠️ two collections; publishing stays a `git mv`                                                                                                          | ⚠️ same                                                                                                                                |
| 1. YAML lists with `{ en, es }`               | ✅                                                                          | ⚠️ object fields (en, es); YAML comments lost                                                                                                            | ⚠️ object fields; comments probably lost                                                                                               |
| 2. Markdown left as written                   | ✅ byte-identical round-trip tests                                          | ⚠️ raw mode keeps the body; rich text rewrites it (`***`, ` ```plain `, tight lists, 4-space indents); frontmatter normalised (field order, block lists) | ❌ rich text is an MDX AST: rewrites, and "ignores elements it cannot handle"; a raw `string` body avoids it but loses everything else |
| 3. Our blocks editable                        | ✅ forms from the `blocks` registry                                         | ✅ editor components generated from the registry; ⚠️ in raw mode **(to test)**                                                                           | ❌ components ("templates") only in `.mdx` files; `.md` has shortcodes                                                                 |
| 4. Our rules in charge                        | ✅ one shared model                                                         | ⚠️ field `pattern`s copy the main rules; the build stays the check                                                                                       | ⚠️ `ui.validate` in TypeScript could import our checks                                                                                 |
| 5. Dev only                                   | ✅ separate app                                                             | ✅ served by a Vite middleware in dev, not from `static/`                                                                                                | ✅ `tinacms dev` only; never run `tinacms build` in CI                                                                                 |
| 6. Standalone                                 | ⚠️ a GitHub storage to build; sign-in needs a token or a small OAuth server | ✅ deploy the page; sign in with a fine-grained token (no server) or the OAuth Worker                                                                    | ⚠️ TinaCloud (free for 2 users) or a Node backend + database + Auth.js on Vercel/Netlify                                               |
| 7. WSL                                        | ✅ Node in WSL                                                              | ⚠️ pick "Linux" in Chrome's folder picker; Chromium only                                                                                                 | ✅ Node in WSL                                                                                                                         |
| 8. Translations side by side                  | ⚠️ to build                                                                 | ✅ built in                                                                                                                                              | ❌                                                                                                                                     |
| 9. Real preview                               | ✅ dev site in an iframe                                                    | ⚠️ preview off; the dev site in another tab                                                                                                              | ⚠️ visual editing is for React (Next.js) and Astro, not SvelteKit                                                                      |
| 10. Focal point                               | ✅ to build                                                                 | ⚠️ a custom field type **(to test: Svelte or React?)**                                                                                                   | ⚠️ a custom React field                                                                                                                |
| 11. Cost and upkeep                           | ⚠️ ours to maintain                                                         | ✅ free; pin the version                                                                                                                                 | ⚠️ free locally; hosted means SaaS or a backend; large dependency tree                                                                 |

## Our own CMS

- **Fit:** perfect by definition: it can promise that an unedited save changes nothing, reuse the build's checks, keep YAML comments, publish by moving folders, rename slugs and fix links, and draw the focal point.
- **Cost:** the biggest phase so far. Before the first edit: the shared content model, round-trip tests over every file, a storage interface, path and origin checks on the dev endpoints, refusing stale saves. Then CodeMirror, forms per content type, images, translations, the Awesome list editor. Standalone adds a GitHub storage and the same sign-in problem Sveltia has (GitHub has no browser-only OAuth: a token, or a small server).
- **Risk:** it's ours to keep working: every new content type or rule means CMS work too. Nothing else depends on a third party.

## Sveltia CMS

- **Fit:** the only adopted option that matches the content's shape (co-located media, `slug.es.md`, fields only in English) and needs no server in dev or for standalone.
- **Changes to the site:** a `cms/` folder (`index.html`, `config.yml`, a script registering editor components from `blocks.ts`) served in dev by a Vite middleware; YAML comments moved out of `modern-css.yaml` and `skills.yaml`; one normalising commit (field order, block lists); maybe `content.ts` accepting `reviewed` in English and the markdown plugin accepting images without `./` **(to test)**.
- **What we give up:** byte-identical saves (frontmatter follows Sveltia's style); YAML comments; publishing from the CMS; the real preview inside the editor; maybe rich text (if components don't work in raw mode, we choose between rewrites and plain raw editing).
- **Risks:** pre-1.0 with frequent releases (options get deprecated: `omit_default_locale_from_filename` → `…_file_path`); mostly one maintainer; the local workflow is Chromium-only. Sign-in for standalone: a fine-grained token limited to this repo (stored in `localStorage`, which every Pages site under `abafdez.github.io` shares, so host it on its own origin) or the OAuth Worker (an OAuth App gets the `repo` scope, all repos).
- **Extension points:** editor components, custom field types, custom file formats, preview templates and styles, event hooks, custom pages.

## TinaCMS

- **Fit:** poor for this site. Its two strengths don't reach us: visual editing needs React (or Astro), and its markdown model is MDX with components for `.mdx` files.
- **The blockers:**
  - Media in `static/`: images would be copied as they are (no AVIF/WebP, no dimensions from enhanced-img), served from `/uploads/…` without the `/portfolio` base, and away from their post. The workaround in Tina's docs puts the content itself in the public folder, which would publish every draft's source.
  - No i18n: `slug.es.md` beside the English file would be a second collection filtered by file name, with no link between the two and no side-by-side editing.
  - The rich-text editor drops what it can't parse; callouts and fenced blocks would need a raw string body, which leaves the forms as the only gain.
  - Hosted means TinaCloud (Free: 2 users; Team $24/month per project, billed yearly, for the editorial workflow) or a self-hosted Next.js-style backend with a database (Vercel KV or MongoDB) and Auth.js, none of which runs on GitHub Pages.
- **Smaller costs:** a `tina/` folder with generated files and a lock file in the repo; React, GraphQL and their dependencies; the project is mid-rewrite (a "v4" with plugins in its repo).
- **One real plus:** its config is TypeScript, so validation could import our own check functions.

## Also around, not studied in depth

- **Decap CMS:** Sveltia is its rewrite and fixes hundreds of its issues.
- **Keystatic:** local and GitHub modes like our planned design, but React.
- **Pages CMS:** hosted, GitHub-based.

## Recommendation

**Tina is out**: it would mean reshaping the content (media into `static/`, translations into locale folders) and giving up the markdown pipeline, the opposite of what a CMS should do to an existing site.

**Between Sveltia and our own, Sveltia first, decided by a spike.** It covers most of the list with a config file and a small script, and it gets standalone almost free. What it costs is control over the files' exact text. Our own CMS is the better fit on every row, at the price of the biggest phase so far and keeping it running afterwards.

The spike (about an hour, on a scratch branch, no site code changed):

1. Write `config.yml` for posts (drafts and published), the Devlog and the Awesome list; serve it at `/admin/index.html` in dev.
2. Open it from WSL in Chrome ("Linux" in the folder picker).
3. Save one post, one translation, one Devlog entry and the Awesome list **without editing them**, and read `git diff`.
4. Insert an image and a ` ```yt ` block (with editor components generated from `blocks.ts`) in raw mode and in rich text.
5. Try a custom field type with a Svelte `mount()` inside.

**What would flip it to our own CMS:**

- an unedited save changes content, not only style;
- components don't work in raw mode and rich text's rewrites aren't acceptable;
- the WSL folder picker doesn't work;
- the focal point can't be a custom field.

## Spike results (2026-11-09, branch `spike/sveltia-cms`)

Sveltia 0.262.0, served at `/admin/index.html` in dev by `cms/plugin.ts` (`apply: 'serve'`; the production build has no CMS files). Tested in Playwright's Chromium against a byte-exact copy of `content/` in the browser's private file system (OPFS), because Playwright can't drive the native folder picker; every save was compared with the original file.

**Works:**

- All four collections load (57 posts, 4 drafts, the Devlog, the Awesome list); `README.md` in `published/` is ignored.
- Save is disabled until something changes, so an untouched file is never written.
- Raw mode returns the body byte for byte. Rich text, after a one-word edit, changed only one thing: table separator rows become `| --- |`. Callouts, HTML in backticks, the ` ````md ` example with a ` ```video ` inside it and the real blocks all came back as written.
- ` ```yt ` and ` ```video ` are editor components generated from `blocks.ts` (`cms/main.ts`), edited in a dialog and previewed with the block's own `render()`; inserting one writes the block in our format (`./` paths, quoted only when needed).
- New entries: `drafts/2026-11-09-a-test-draft-nandu-co/2026-11-09-a-test-draft-nandu-co.md`, English only (`initial_locales: default`), only the filled-in fields.
- Images: with `media_folder: /content/blog/drafts/{{slug}}` and `public_folder: .` an upload lands next to the entry and is written `![alt](./file.png)`. (With `media_folder: ''` it went to a `<slug>/` subfolder, without `./`.) Identical uploads are de-duplicated.
- A Svelte component as a custom field type (`cms/Focal.svelte`, mounted from a React wrapper in `cms/focal.svelte.ts`): click or arrow keys, saved as `focus: 30% 70%`.
- The CMS page wasn't reloaded by content changes on disk (it only reloads when its own code changes).

**What changes in the content (one normalising commit):**

- Quotes that YAML doesn't need are dropped (`title: 'Callouts…'` → `title: Callouts…`), in translations too.
- `tags: [a, b]` becomes a block list, everywhere it's saved (also in the Awesome list).
- The Awesome list loses its comment block (move it to a README or to `awesome.ts`), and every text that can be `{ en, es }` must always be one (`Color` was plain).
- `reviewed` must be a select, not a switch: a switch writes `reviewed: false` into English files.

**Then (same day, adopted):** Alfonso checked the folder picker from WSL in Windows Chrome: it works. What the spike left open is done:

- **Our own file format** instead of Sveltia's writer (`src/lib/content-files.ts`, then Prettier in `cms/formats.ts`): `tags: [a, b]` stays on one line, quotes only where YAML needs them, so a save changes only the edited lines and the untouched translation isn't rewritten. `content-files.test.ts` saves every file in `content/` without edits and expects the same bytes. Bringing the repo into that shape took one pass of `pnpm content:format` (74 titles lost quotes they didn't need; nothing else changed).
- **Preview**: drawn in the browser by the build's own plugins (`cms/render.ts`: unified with remark-gfm, rehype-raw, our callouts, tables, heading links, blocks and Shiki) with the site's CSS (`registerPreviewStyle`), redrawn as you type; it needs no dev server, so it carries over to a hosted CMS. Differences from the build: no enhanced-img, mdsvex's older parser and smartypants. In dev a **Real page** tab shows the dev page live: the CMS posts the unsaved entry (`POST /admin/preview`, same origin only, entry files only), the plugin writes a hidden, git-ignored `<slug>/.preview.md`, and the page renders it with `?preview` (`src/lib/preview.ts`). The Awesome list's preview is the page as last saved, dev only.
- **The focal-point field** shows the cover, served by a dev-only route (`/admin/cover/<folder>` in `cms/plugin.ts`).
- **Tags** are a plain list (a `pattern` on a list field checks the whole list; the build checks tags anyway).
- **The Awesome list**: comments moved to `content/awesome/README.md`, every bilingual text always `{ en, es }`.

**Still open:** use `focus` in the build (`covers.ts` crops from the middle); renaming an entry from the CMS; the standalone version (hosting and GitHub sign-in).

## Sources

- Sveltia: [GitHub backend and sign-in](https://sveltiacms.app/en/docs/backends/github), [local workflow](https://sveltiacms.app/en/docs/workflows/local), [i18n options](https://sveltiacms.app/en/docs/i18n/options), [entry-relative media](https://sveltiacms.app/en/docs/media/internal), [data output and markdown conventions](https://sveltiacms.app/en/docs/data-output), [editor components](https://sveltiacms.app/en/docs/api/editor-components), [JavaScript API](https://sveltiacms.app/en/docs/api), [OAuth Worker](https://github.com/sveltia/sveltia-cms-auth), [WSL folder picker](https://github.com/sveltia/sveltia-cms/discussions/101), [formatting issue #1102](https://github.com/sveltia/sveltia-cms/issues/1102).
- Tina: [SvelteKit setup](https://tina.io/docs/frameworks/sveltekit), [markdown syntax guide](https://tina.io/docs/reference/markdown-spec), [repo-based media](https://tina.io/docs/reference/media/repo-based), [storing media with content](https://tina.io/docs/guides/storing-media-with-content), [i18n](https://tina.io/docs/guides/internationalization), [self-hosting](https://tina.io/docs/self-hosted/manual-setup), [pricing](https://tina.io/pricing).
