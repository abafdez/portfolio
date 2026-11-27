# 2. How it fits together

The folders, what happens when the site is built, how a markdown file becomes a page, and how the two languages share one set of routes.

## The folders

| Folder                                | What's in it                                                                                                                                                                                                                                                                                                             |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `content/`                            | What the site says. `blog/posts/<slug>/<slug>.md` (and `.es.md`, and its images), `bitacora/<date-slug>/` (the Devlog), `awesome/*.yaml` (link lists), `skills.yaml` (the `/about` page), `projects/<slug>/cover.avif` (project covers), `site.yaml` (site settings: name, tagline, hiring texts, email, profile links). |
| `src/routes/`                         | One folder per URL. `+page.svelte` draws a page, `+page.server.ts` loads its data at build time, `+page.ts` loads data that also runs in the browser, `+layout.*` wraps everything below it.                                                                                                                             |
| `src/lib/`                            | Shared code, imported as `#lib/...`.                                                                                                                                                                                                                                                                                     |
| `src/lib/components/`                 | Site-wide components: `Header`, `Footer`, `Nav`, `Search`, `ThemeToggle`, `PalettePicker`, `LanguageSwitch`, `Blueprint` (the grid), `TeaserCard`, `ArticleHeader`, `TagCloud`, `Seo`... and `hire/` (the footer panel's looks).                                                                                         |
| `src/lib/styles/`                     | `tokens.css` (every colour and shared size), `global.css` (layers, page transitions, shared classes), `themes/*.css` (colour themes).                                                                                                                                                                                    |
| `src/lib/markdown/`                   | Markdown compiled by mdsvex: `options.ts` (what the build and the CMS preview share), `plugins.ts` and `blocks-plugin.ts` (our rules and the `video`/`yt` blocks), `components.ts` and the components that replace elements, `context.ts` (the page's language and files), `media.ts` (the blocks' files).               |
| `src/lib/i18n/`                       | `en.ts` and `es.ts` (every UI string), `index.ts` (`m`, `route()`, `text()`, `getLocale()`), `locales.ts` (URL helpers).                                                                                                                                                                                                 |
| `src/lib/projects/`                   | The tools: `contrast/`, `cv/`, `toolbox/` (Base64, symbols, cursors), `not-found/` (the 404 games). `projects.ts` lists them.                                                                                                                                                                                            |
| `src/lib/skills/`, `src/lib/awesome/` | The `/about` skills and the Awesome lists: loaders, types and components.                                                                                                                                                                                                                                                |
| `src/lib/cms/`                        | Sveltia CMS: the dev plugin, the config, custom formats, the preview, the live-site build. Its `README.md` is the detailed guide.                                                                                                                                                                                        |
| `scripts/`                            | Node scripts: `serve.ts` (preview), `content-format.ts`, the image cache, data generators.                                                                                                                                                                                                                               |
| `e2e/`                                | Playwright tests.                                                                                                                                                                                                                                                                                                        |
| `design/`                             | Design notes, not published (light-theme directions, the mascot, the CMS study, the svelte-markdown and mdsvex spikes).                                                                                                                                                                                                  |
| `static/`                             | Files copied as they are (the favicon...).                                                                                                                                                                                                                                                                               |
| `.image-cache/`                       | Encoded images, committed so builds don't re-encode them.                                                                                                                                                                                                                                                                |

## What `pnpm build` does

1. **Vite + SvelteKit build the site.** Vite runs the plugins in order:
   - `cms()` (`src/lib/cms/plugin.ts`) only acts in dev (`apply: 'serve'`): it answers `/admin`.
   - `drafts()` (`src/lib/drafts.ts`) replaces the marker `'!/:drafts:'` in every content glob with one exclusion per draft folder, so drafts and their images never reach the build.
   - `enhancedImages()` encodes images (AVIF, WebP, several widths). It looks in `node_modules/.cache/imagetools` first, which `scripts/image-cache-link.ts` links to the committed `.image-cache/`.
   - `sveltekit()` compiles the routes.
2. **SvelteKit prerenders.** It starts at `/` (`prerender.entries: ['*', '/logos.svg', '/sitemap.xml']`), renders each page, follows every link it finds, and writes HTML. Routes with a parameter (`/blog/[slug]`) also list their pages in an `entries()` function. A route nobody links to fails the build (`handleUnseenRoutes`), and so does a link to a page that doesn't exist or to a missing `#heading`.
3. **adapter-static writes `build/`**, plus `404.html`, an empty page that starts the app. GitHub Pages serves it for any missing address, and the app shows `src/routes/+error.svelte` (the 404 games).
4. **The CMS build** (`src/lib/cms/vite.config.ts`) writes `build/admin/`.
5. **Pagefind** reads `build/**/*.html` and writes `build/pagefind/`, the search index.

CI (`.github/workflows/SK3toGHPages.yaml`) runs `check`, `lint`, `test`, `build`, tidies the image cache, runs the Playwright tests, commits new cache files from a separate job, and deploys `build/` to GitHub Pages.

### The base path

The site lives at `https://abafdez.github.io/portfolio/`, so every URL needs `/portfolio` in front. `BASE_PATH` (an environment variable) sets it at build time: `vite.config.ts` passes it to SvelteKit (`paths.base`) and defines `import.meta.env.BASE_PATH` for our own code. Dev has no base path. That's why path bugs only show in a build, and why you should test with `BASE_PATH=/portfolio pnpm build && BASE_PATH=/portfolio pnpm preview`.

## From a markdown file to a page

Take `content/blog/posts/2026-11-07-callouts-that-read-well-everywhere/2026-11-07-callouts-that-read-well-everywhere.md`:

1. **`src/lib/content.ts`** finds every post with `import.meta.glob` (a Vite feature that lists files at build time) and reads only the frontmatter: title, date, tags, description, `draft`. It works out the slug from the folder (and fails the build if folder and file names differ), the reading time and the language. This is the list the blog page, tag pages, the home page and the sitemap use.
2. **`src/routes/blog/[slug]/+page.server.ts`** runs at build time, once per post (`entries()` lists them). It finds the post in the page's language (or falls back to English) and its cover, and returns that data.
3. **`src/routes/blog/[slug]/+page.ts`** adds the body: a component can't come from a server load, so this universal load does it, on the server while prerendering and in the browser when you navigate. It finds the post's compiled module in this section's glob (`bodyOf()` in `src/lib/bodies.ts`) and loads the files its blocks name (`src/lib/markdown/media.ts`).
4. **mdsvex** compiled that module when Vite first imported the `.md` file (`vite.config.ts`, with the options in `src/lib/markdown/options.ts`). The parse plugins (`plugins.ts`) mark `> [!tip]` blockquotes as callouts, make a lone captioned image a figure, and fail the build on HTML, Svelte blocks, an image without alt text or an unknown callout type. The blocks plugin (`blocks-plugin.ts`) checks `video` and `yt` fences against `src/lib/blocks.ts` and turns them into components. Code is highlighted by twinkleplop, images become enhanced-img imports, and our components replace elements (`components.ts`): `Heading` (an id and a self-link), `Pre` (the language bar and copy button), `Table` (a scroll box), `Blockquote` (callouts), `Link` (the base path and the page's language, added when the page shows: one compiled post serves both languages).
5. **`src/routes/blog/[slug]/+page.svelte`** gives the body the page's language and files (contexts, `context.ts`) and shows it inside `.prose` (global styles for markdown), under `ArticleHeader`. It's prerendered to HTML; in the browser it hydrates, and `copy.ts` wires the copy buttons.

Covers work the same way: `src/lib/covers.server.ts` globs `content/**/cover.*` and finds a post's cover by folder; load functions add it to their data (`coverOf()`, `withCover()`).

Other content follows the same pattern: `src/lib/skills/skills.server.ts` reads `content/skills.yaml` for `/about`, `src/lib/awesome/awesome.ts` reads `content/awesome/*.yaml`, `src/lib/projects/projects.ts` is a typed list in code.

## Two languages

- **One set of routes.** `src/hooks.ts` has a `reroute` hook: `/portfolio/es/blog` is routed as `/blog`, but the URL keeps its `/es`. `src/routes/+layout.ts` reads the language from the URL (`localeOf(url)`) and puts it in `page.data.locale` for every page.
- **UI text** lives in `src/lib/i18n/en.ts` and `es.ts`. Components write `m.searchLabel()`; `es.ts` must have every key (`satisfies Messages`), so a missing translation fails `pnpm check`. Plurals use `plural()`, numbers `formatNumber()`.
- **Links** use `route('/blog/[slug]', { slug })` from `#lib/i18n/index.ts`, which adds the base path and the `/es` when needed. A test (`route.test.ts`) fails if a component imports SvelteKit's `resolve()` directly.
- **Content** translations are `<slug>.es.md` next to the English file, with only the words in their frontmatter (title, description, cover alt). Date, tags and phase come from the English file. An untranslated post shows its English text on the Spanish page, marked with `lang="en"`.
- **`<html lang>`** is written by `src/hooks.server.ts` at build time and updated by the root layout when you switch language without a reload.
- **The language switch** (`LanguageSwitch.svelte`) is a plain link to the same page in the other language. The prerender crawler follows it, which is how every Spanish page gets built.

## The root layout

`src/routes/+layout.svelte` wraps every page. It:

- imports the fonts, `tokens.css`, every colour theme (`import.meta.glob('/src/lib/styles/themes/*.css', { eager: true })`) and `global.css`;
- draws `<Blueprint />` (the grid behind the page), `<Header />`, `<main>` with the breadcrumbs and the page, and `<Footer />`;
- sets `data-composition` on `<main>` from the page's data (`'reading'` for posts and Devlog entries, set in `src/routes/blog/+layout.ts` and `devlog/+layout.ts`);
- runs every page transition from `onNavigate` (chapter 5);
- turns smooth scrolling back on after each navigation (`data-smooth-scroll`).

## Where the visitor's settings live

Settings are saved in `localStorage` and put back by a small script in `src/app.html` before the first paint, so they never flash:

| Setting                                          | Saved as     | On `<html>`               | Changed by                                     |
| ------------------------------------------------ | ------------ | ------------------------- | ---------------------------------------------- |
| Light or dark (only when it differs from the OS) | `theme`      | `data-theme`              | `ThemeToggle.svelte`                           |
| Colour theme (not for the default)               | `palette`    | `data-palette`            | `PalettePicker.svelte`                         |
| Text size (not for 100%)                         | `text-scale` | `style="--text-scale: …"` | `PalettePicker.svelte`, `src/lib/text-size.ts` |

The CV builder keeps its form in `localStorage` too (`cv-builder`, `cv-builder-skills`): personal data stays in the visitor's browser.
