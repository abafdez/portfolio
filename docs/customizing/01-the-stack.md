# 1. The stack

Every package in `package.json`, what it does here, where it's used, and why. Versions are pinned exactly where an update once broke something or where pnpm's release-age rule matters; the rest use `^`.

## The framework

| Package                        | What it does here                                                                                                                                                                                                                     | Where                                            |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `svelte` (5)                   | The component language. Runes mode is forced for the whole project (`compilerOptions.runes` in `vite.config.ts`), so every component uses `$state`, `$derived`, `$effect` and `$props`.                                               | every `.svelte` file                             |
| `@sveltejs/kit` (3)            | Routing (one folder per page in `src/routes/`), load functions, prerendering, hooks, `$app/state`, `$app/navigation`. SvelteKit 3's options live inside `sveltekit({...})` in `vite.config.ts`, not in a separate `svelte.config.js`. | `src/routes/`, `src/hooks*.ts`, `vite.config.ts` |
| `@sveltejs/adapter-static`     | Writes the prerendered site to `build/`. `fallback: '404.html'` makes the page GitHub Pages serves for missing addresses; `strict: true` fails the build if any route can't be prerendered.                                           | `vite.config.ts`                                 |
| `@sveltejs/vite-plugin-svelte` | The plain Svelte plugin, without SvelteKit. Only the CMS build uses it directly, since `/admin` isn't a SvelteKit page.                                                                                                               | `src/lib/cms/vite.config.ts`                     |
| `vite`                         | The dev server and bundler under SvelteKit. Plugins run in the order listed: `cms()`, `drafts()`, `enhancedImages()`, `sveltekit()`.                                                                                                  | `vite.config.ts`                                 |
| `typescript`, `svelte-check`   | Types everywhere (`lang="ts"` in components). `pnpm check` runs `svelte-check`.                                                                                                                                                       | `tsconfig.json`                                  |

Why SvelteKit with a static adapter: GitHub Pages only serves files, so every page is rendered at build time. Anything that depends on the visitor (their theme, a search, a game) runs in their browser after the page loads.

## Styling

| Package                          | What it does here                                                                                                                                                                                                                                | Where                                   |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------- |
| `open-props`                     | A library of CSS custom properties: sizes (`--size-1` … `--size-15`), font sizes, radii, easings (`--ease-out-3`, `--ease-spring-2`), shadows. The site uses its scales and easings, not its colours (the colours are our own, in `tokens.css`). | everywhere in CSS                       |
| `postcss-jit-props`              | Only the Open Props properties a file actually uses end up in the CSS ("just in time"). Without it, all of Open Props (hundreds of properties) would ship on every page.                                                                         | `vite.config.ts` → `css.postcss`        |
| `@fontsource-variable/fira-code` | Fira Code, self-hosted (no request to Google Fonts). It's the code, heading and label font. The body is the system font stack (`--font-sans` from Open Props).                                                                                   | imported in `src/routes/+layout.svelte` |

The CSS itself is plain modern CSS: cascade layers, nesting, `light-dark()`, `color-mix()`, relative colours, container queries, `:has()`, anchor positioning, scroll-driven animations, view transitions. No Tailwind, no preprocessor. Chapter 3 explains how it's organised.

## Icons

| Package          | What it does here                                                                                                                                                                                                                                                       | Where                                                    |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `@lucide/svelte` | UI icons as Svelte components. Import one file per icon (`import Search from '@lucide/svelte/icons/search'`) so only the icons you use are bundled.                                                                                                                     | header buttons, footer, search, toolbox, status badges   |
| `lucide`         | The same icons as plain data (an `IconNode`: tag names and attributes). Used where a Svelte component can't be: icons drawn on the server into markdown (callouts) and into the skills list.                                                                            | `src/lib/callouts.ts`, `src/lib/skills/skills.server.ts` |
| `simple-icons`   | Brand logos as data (a path on a 24 × 24 grid). `BrandIcon.svelte` draws one; `/logos.svg` (a prerendered sprite, `src/routes/logos.svg/+server.ts`) holds every skill logo once, drawn with `<use>`. LinkedIn's logo isn't in the set (removed at LinkedIn's request). | `/about`, the footer panel                               |

## Content

| Package                       | What it does here                                                                                                                                                                                                                          | Where                                                                      |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| `marked`                      | Parses markdown into tokens. We lex first and change the tokens (callouts, figures, blocks) before anything is drawn.                                                                                                                      | `src/lib/markdown/parse.ts`                                                |
| `@humanspeak/svelte-markdown` | Draws marked's tokens with Svelte components, ours: `Heading`, `Code`, `Image`, `Link`, `Callout`...                                                                                                                                       | `src/lib/markdown/Markdown.svelte`                                         |
| `shiki`                       | Syntax highlighting at build time, with our own theme that maps every colour to a `--code-*` token, so code follows the light/dark and colour themes.                                                                                      | `src/lib/markdown/shiki.ts`, `src/lib/code-theme.ts`                       |
| `yaml`                        | Reads frontmatter, `content/skills.yaml`, the Awesome lists and the fenced-block components, and writes content files back for the CMS.                                                                                                    | `content-files.ts`, `awesome.ts`, `skills.server.ts`, `blocks.ts`, the CMS |
| `@sveltejs/enhanced-img`      | Turns `import photo from './x.jpg?enhanced'` and `<enhanced:img>` into AVIF and WebP copies at several widths, with width and height set (no layout shift). Encoding is slow, so the results are committed in `.image-cache/` (chapter 2). | covers, post images, the avatar                                            |
| `sharp`                       | The image library under enhanced-img. Also used directly by `scripts/cursor-gif.ts`.                                                                                                                                                       |                                                                            |
| `pagefind`                    | Builds a static search index from the finished HTML after the build, one per language.                                                                                                                                                     | `package.json` `build`, `src/lib/search.ts`                                |
| `@sveltia/cms`                | A Git-based CMS for the posts, Devlog and Awesome lists, at `/admin`.                                                                                                                                                                      | `src/lib/cms/` (its README explains it in detail)                          |

Markdown used to go through mdsvex (markdown compiled to Svelte components). It was replaced by marked + svelte-markdown on 2026-11-11: the pages got lighter and the CMS preview could mount the same components. The Devlog entry `2026-11-11-svelte-markdown-instead-of-mdsvex` and `design/svelte-markdown-spike.md` have the story.

## Testing and formatting

| Package                              | What it does here                                                                                                                                                                      | Where                          |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| `vitest`                             | Unit tests, `pnpm test`. No separate config: `vite.config.ts` imports `defineConfig` from `vitest/config` and sets `test.include: ['src/**/*.test.ts']`. A test sits next to its file. | `src/**/*.test.ts`             |
| `@playwright/test`                   | End-to-end tests in a real browser, `pnpm test:e2e`. They run against `build/`, served by `scripts/serve.ts` the way GitHub Pages serves it.                                           | `e2e/`, `playwright.config.ts` |
| `prettier`, `prettier-plugin-svelte` | Formatting. `pnpm lint` checks, `pnpm format` fixes. Content files have their own formatter (`pnpm content:format`) so the CMS and hand edits produce the same bytes.                  | `prettier.config.js`           |
| `@types/node`                        | Types for the Node scripts and config files.                                                                                                                                           |                                |

## Scripts (`package.json`)

| Script                                       | What it does                                                                                                                                               |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm dev`                                   | Dev server. No base path, drafts visible, the CMS at `/admin`.                                                                                             |
| `pnpm build`                                 | Three steps: the site (`vite build`), the CMS (`vite build -c src/lib/cms/vite.config.ts` into `build/admin`), the search index (`pagefind --site build`). |
| `pnpm preview`                               | `node scripts/serve.ts`: serves `build/` with GitHub Pages' rules. Use the same `BASE_PATH` as the build.                                                  |
| `pnpm check` / `lint` / `test` / `test:e2e`  | Types, formatting, unit tests, a build plus browser tests.                                                                                                 |
| `pnpm content:format`                        | Rewrites content files the way the CMS saves them. Run it after hand edits.                                                                                |
| `pnpm image-cache:link` / `image-cache:tidy` | Points imagetools at the committed `.image-cache/`; drops encoded images the last build didn't use.                                                        |
| `pnpm data:symbols` / `data:cursor-gif`      | One-off generators for toolbox data (the HTML symbols list, the animated cursor GIF).                                                                      |

## Package manager rules

- **pnpm** (`packageManager` in `package.json`). `pnpm-workspace.yaml` lists which packages may run install scripts (`allowBuilds`: sharp, esbuild).
- pnpm refuses very new releases (`minimumReleaseAge`), a defence against hijacked packages. When it refuses a version, don't add an exception: wait, or pick the previous version.
- `imports` in `package.json` defines `#lib/*` as `./src/lib/*`, a Node subpath import. Use `#lib/...` in imports, not long relative paths.
