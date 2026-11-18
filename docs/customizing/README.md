# Customizing this site

A guide to how this portfolio is built and how to change it: where every library is and what it does, how the pieces connect, how to turn each effect on or off, and how to reuse the animations somewhere else. It's written for me (Alfonso) months from now, and for anyone I work on it with. (The code is not open source: see `LICENSE.txt`.)

Every chapter points at real files. When a chapter and the code disagree, the code wins: the comments in the code are the most detailed documentation this project has, and this guide tells you which file to open.

## Chapters

1. [The stack](01-the-stack.md): every library and tool, what it's for, where it's used, and why it was picked.
2. [How it fits together](02-how-it-fits-together.md): the folders, what happens on `pnpm build`, how a markdown file becomes a page, how the two languages work.
3. [Colours, type and layout](03-colours-type-and-layout.md): design tokens, light and dark, the colour themes, fonts, widths, the text size setting, and the CSS layers.
4. [The effects catalogue](04-effects-catalogue.md): every animation and effect on the site, where its code is, the technique it uses, and how to turn it off.
5. [Transitions between pages and themes](05-transitions.md): the View Transition API as this site uses it: route changes, cards that become pages, the theme circle, the colour-theme effects.
6. [Recipes](06-recipes.md): the techniques behind the effects, extracted so you can reuse them, with the code to copy.
7. [Adding things](07-adding-things.md): checklists for a new page, post, project, colour theme, theme transition, 404 variant, hire-panel look, markdown block or Awesome list.
8. [Sources](08-sources.md): the documentation, specs and articles this knowledge comes from, by topic.

## The map in one picture

```text
content/            markdown, YAML: what the site says (posts, Devlog, lists, skills)
  │  read at build time by src/lib/content.ts, awesome.ts, skills.server.ts
  ▼
src/routes/         one folder per page; +page.server.ts loads, +page.svelte draws
  │  wrapped by src/routes/+layout.svelte (header, footer, grid, page transitions)
  ▼
src/lib/            everything the pages share
  ├─ components/    header, footer, cards, search, theme controls, hire-panel looks
  ├─ styles/        tokens.css (colours, sizes), global.css (layers), themes/*.css
  ├─ markdown/      marked + svelte-markdown + Shiki: markdown to HTML on the server
  ├─ i18n/          English and Spanish messages, localized links
  ├─ projects/      the tools (contrast checker, CV builder, toolbox, 404 games)
  └─ cms/           Sveltia CMS at /admin (dev, and its own build for the live site)
  ▼
build/              static files: GitHub Pages serves them as they are
                    (+ build/admin from the CMS build, + build/pagefind from Pagefind)
```

## Five rules that explain most of the code

These come up in every chapter, so here they are once:

1. **Tokens, not values.** Components never write a colour or a size: they use semantic custom properties (`--text-1`, `--surface-2`, `--brand`, `--size-3`). Colours live only in `src/lib/styles/tokens.css` and `src/lib/styles/themes/*.css`. Change a token and the whole site follows.
2. **Every effect is an enhancement.** The page works and reads fine without JavaScript, without the newest CSS, and with reduced motion. Effects are added on top, behind `@supports`, `@media (scripting: enabled)`, `@media (prefers-reduced-motion: no-preference)` or a check in script.
3. **Text never sits on the grid.** The blueprint grid is decoration for headings and empty space. Body-size text sits on a `.sheet`, so no line runs through its letters.
4. **Two languages, one set of routes.** `/es/blog` is the `/blog` route in Spanish. UI text is a message in `src/lib/i18n/en.ts` and `es.ts`; links go through `route()`.
5. **Static all the way.** There's no server at run time. Everything that needs data is worked out at build time (prerendering), and everything that needs the visitor (their theme, a search) runs in their browser.

## Before you change anything

- `pnpm install`, then `pnpm dev` for the dev server (no base path, drafts visible, the CMS at `/admin`).
- Check a real build: `BASE_PATH=/portfolio pnpm build && BASE_PATH=/portfolio pnpm preview`. Dev and build differ (base path, drafts, the search index, the CMS build).
- `pnpm check`, `pnpm lint`, `pnpm test` and `pnpm test:e2e` are what CI runs. Run them before you push.
- Look at it at 320 px wide, in light and dark, and with reduced motion on (DevTools → Rendering → Emulate CSS media feature `prefers-reduced-motion`).
