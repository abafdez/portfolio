# 7. Adding things

Checklists for the things you'll most often add. Each one lists the files to touch and the checks that will fail if you forget a step: that's on purpose, the build and the tests are the safety net.

## A new page

1. Create `src/routes/<name>/+page.svelte`. Start it with `<Seo title={…} description={…} />` (`src/lib/components/Seo.svelte`): it writes the `<title>`, the description, canonical and Open Graph tags.
2. Put text in a `.sheet` (body text never sits on the grid).
3. Write every UI string as a message in `src/lib/i18n/en.ts` **and** `es.ts`, and use it as `m.yourKey()`. `pnpm check` fails if `es.ts` is missing a key.
4. Link to it with `route('/name')` from `#lib/i18n/index.ts`. The prerenderer only builds pages it can reach: a route nobody links to fails the build.
5. **In the nav?** Add it to `sections` in `src/lib/links.ts`: the nav, the breadcrumbs, the 404's links and the sitemap all read that list.
6. **Data at build time?** Add `+page.server.ts` with a `load` function. Use `localeOf(url)` for the language. A nested page returns `crumb` (its breadcrumb text).
7. **A reading page** (long text): return `composition: 'reading'` from a `+layout.ts` or the load.
8. Check it at 320 px, both themes, both languages, reduced motion, and run `pnpm test:e2e`. The navigation test reads the nav, so a new section is tested automatically.

## A blog post

1. Make `content/blog/posts/YYYY-MM-DD-slug/YYYY-MM-DD-slug.md` (folder and file named the same, or the build fails).
2. Frontmatter: `title`, `date`, `tags` (lowercase kebab-case, checked), `description` (quote it if it contains `: `), and `draft: true` until it's ready. Drafts only exist in `pnpm dev`.
3. Images next to it, written `![alt text](./diagram.png)`. Alt text is required. An image with a title alone in its paragraph becomes a figure with a caption: `![alt](./x.png 'Caption')`.
4. Optional cover: `cover.avif` (16:9, at least 1600 × 900, what matters in the middle) and its alt text as `cover:` in the frontmatter.
5. Spanish: `YYYY-MM-DD-slug.es.md` with only `title`, `description`, `cover` (if any) and `reviewed: false`.
6. Run `pnpm content:format`.
7. Publish: delete `draft: true`. A published post can't link to a draft (the build fails).

Everything else (callouts, videos, YouTube cards, headings, links) is in `content/blog/posts/README.md`. Devlog entries go in `content/bitacora/` and follow the `bitacora-entry` skill in `.claude/skills/`.

## A project or a tool

**A project** (a card on `/projects` and a page at `/projects/<slug>`):

1. Make a folder `src/lib/projects/<slug>/` with its component and logic.
2. Add an entry to `projects` in `src/lib/projects/projects.ts`: `slug`, `title` and `description` (`{ en, es }`), `date`, `tags`, `source` (the folder, for the "Source code on GitHub" link) and `tool: () => import('./<slug>/Thing.svelte')`. The dynamic `import()` means its code only downloads on its own page.
3. A cover: a 16:9 screenshot (1600 × 900, dark theme, nothing personal in it) as `content/projects/<slug>/cover.avif`, and its alt text as `cover: { en, es }` in the entry. `src/lib/projects/projects.test.ts` fails if one comes without the other.
4. `/projects/[tool]` builds its page; the sitemap, the projects list and the home page's teasers pick it up from the list.
5. `src/lib/projects/sources.test.ts` fails if `source` points at nothing.

A project that needs a route of its own (like `/projects/cv`) leaves out `tool` and has its own `src/routes/projects/<slug>/`.

**A toolbox tool:** the same, in `src/lib/projects/toolbox/tools.ts` (it also takes a Lucide `icon`). `e2e/toolbox.test.ts` opens every tool on the dashboard automatically.

## A colour theme

1. Copy a file in `src/lib/styles/themes/` (e.g. `gruvbox.css`) to `<id>.css` and replace `gruvbox` in the three selectors with your id.
2. Set every token the test lists (surfaces, texts, brand, error, `--code-*`, `--callout-*`) as `light-dark(#light, #dark)` with hex colours.
3. Add `{ id, name, credit }` to `palettes` in `src/lib/palettes.ts`. If it's someone else's palette, put its licence notice in the file's header comment and its copyright line in `themes/_licences.css`.
4. Run `pnpm test`: `palettes.test.ts` checks every text colour is at least 4.5:1 on its surfaces and on the spotlight, in both halves. A colour that fails: keep its hue and chroma and only change lightness until it passes, and note `original -> used` in the header.
5. Look at a post with callouts and code in both modes.

## A colour-theme transition effect

1. In `src/lib/palette-transitions.ts`, write a function `(origin) => Settings` that returns the custom properties your CSS needs (a duration, a mask…), and add it to the `effects` object.
2. In `src/lib/palette-transitions.css`, add a `--- Effect: name ---` block under `:root:active-view-transition-type(name)` that animates `::view-transition-new(root)` and/or `::view-transition-old(root)`.
3. The effects take turns in the order of `effects`. Test it by picking colour themes; reduced motion skips all of them.

## A 404 variant

1. A component in `src/lib/projects/not-found/` (use `Arcade.svelte` as the frame for a game, the helpers in `canvas.ts`, and `digits.ts` for the 404's shape).
2. Add it to `variants` in `variants.ts`: `id`, `name` and `about` (`{ en, es }`), `files` (its own files, for the project page's links), `load: () => import('./Thing.svelte')`. `sources.test.ts` checks the files exist.
3. It appears on the 404 at random and on `/projects/404`. `e2e/not-found.test.ts` cycles through every variant and fails on a page error; update its expected list of names.

## A look for the hire panel

1. A component in `src/lib/components/hire/` that takes `LookProps` (`photo`, `linkedin`, `github`).
2. Add a line to `looks` in `looks.ts`. The panel shows the next look each time it opens.
3. Keep it calm under reduced motion and inside the panel's width (the panel never scrolls sideways).

## A fenced-block component in markdown

Like ` ```video ` and ` ```yt `:

1. Declare its fields in `blocks` in `src/lib/blocks.ts` (`required('text' | 'file' | 'size' | 'youtube')` or `optional(…)`). The build fails on unknown, missing or wrong fields.
2. Write its renderer in `src/lib/markdown/blocks/` and add it to `components` in `blocks/index.ts` (a test checks every block has one).
3. The CMS gets an editor component for it automatically (`src/lib/cms/components.ts` reads the same fields).
4. Document it in `content/blog/posts/README.md`.

## An Awesome list

1. `content/awesome/<slug>.yaml`: `title` and `description` as `{ en, es }`, an `icon:` (a Lucide name, lucide.dev/icons) or a `logo:` (a Simple Icons slug, simpleicons.org) for its card, `updated`, and `categories` with `name` (`{ en, es }`) and `links` (`title`, `url` that must be `https://`, `description` as `{ en, es }`, `tags`).
2. Run `pnpm content:format`. `content/awesome/README.md` has the rules.
3. Or make it in the CMS: Awesome lists → New. Every `.yaml` file in the folder shows up there; the icon has its own picker.

## The site's name, tagline, hiring texts, email or links

They're in `content/site.yaml` (or the CMS's "Site settings"), not in the code: `src/lib/site.ts` reads and checks them. To add a setting: a field in the YAML, its type and check in `site.ts`, a field in the `site` singleton in `src/lib/cms/config.yml`, then use `site.yourField` (with `text()` for a `{ en, es }` one).

## A UI string

Add the key to `src/lib/i18n/en.ts` and `es.ts`. A string with a number uses `plural(locale, count, { one, other })`; numbers shown to people use `formatNumber()`. Spanish is Spain's Spanish (tú, ordenador), and phrases around gendered words.

## A new effect: the checklist

Before an effect is done:

- [ ] It's inside `@media (prefers-reduced-motion: no-preference)`, or checks reduced motion in script, and the still version makes sense.
- [ ] The page works without JavaScript; anything that needs script is hidden only under `@media (scripting: enabled)` or disabled until mounted.
- [ ] Missing CSS features fall back to the end state (`@supports`).
- [ ] If text sits on it, it keeps 4.5:1 contrast in every theme (measure it).
- [ ] It doesn't make anything scroll sideways at 320 px.
- [ ] It uses tokens for colours and sizes, so every theme gets it.
- [ ] It doesn't shift the layout when it starts (reserve the space).
- [ ] Decoration is `aria-hidden`; real controls have names and are reachable by keyboard.
- [ ] `pnpm check`, `lint`, `test` and `test:e2e` pass.
