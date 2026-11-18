---
title: A guide to customizing this site
date: 2026-11-18
tags: [docs, css, svelte, animation]
---

## What we did

- Wrote a customizing guide in eight chapters, in `docs/customizing/` ([on GitHub](https://github.com/abafdez/portfolio/tree/main/docs/customizing)), plus an index with a map of the project and the five rules that explain most of the code.
- **1. The stack:** every package, what it does here, where it's used and why (SvelteKit 3 with adapter-static, Open Props through postcss-jit-props, Lucide in two packages, Simple Icons, marked + svelte-markdown + Shiki, enhanced-img and the committed image cache, Pagefind, Sveltia CMS, Vitest, Playwright), and every script.
- **2. How it fits together:** the folders, what `pnpm build` does step by step (plugins, prerendering, the adapter, the CMS build, Pagefind), the base path, a markdown file's way to a page, the two languages, the root layout, where the visitor's settings live.
- **3. Colours, type and layout:** primitive vs semantic tokens, `light-dark()` and why tokens are declared on `[data-theme]` too, colour themes and their contrast test, mixing in `oklab`, fonts, widths and the reading zoom, the text size, the three CSS layers and the sheet rule.
- **4. The effects catalogue:** every effect (the grid and spotlight, the header lifting off, smooth scroll, the theme circle, the four colour-theme effects, search, the footer handle, panel and five looks, the home entrance and scroll reveals, the `/about` bars, rings, windows and marquee, cards, tags, code blocks, the 404 games, the cursors tool), with its files, technique, how to turn it off, and its reduced-motion and no-JS behaviour.
- **5. Transitions:** the View Transition API as the site uses it (pictures, names, types, classes, skipping), then route changes, cards that become pages step by step, the theme circle, the colour-theme effects, and how to debug them.
- **6. Recipes:** fourteen reusable techniques with code: the pointer light on borders, 3D tilt and magnet, animated popovers, scroll-driven animations, `@property`, height to auto, once-on-screen observers, pointer values once a frame, canvases that follow the theme, accessible counters, animation hooks on components, self-animating SVG masks, pointer effects, enhancement patterns.
- **7. Adding things:** checklists for a page, post, project or tool, colour theme, theme transition, 404 variant, hire-panel look, markdown block, Awesome list, UI string, and a checklist every new effect should pass.
- **8. Sources:** the docs and articles by topic, where ideas came from, and a table mapping each part of the site to the Devlog entries that tell its story.
- A real root `README.md` that points to it, and a copy of every chapter in my Obsidian vault.

## What I learned

- Writing the catalogue showed how consistent the effects already are: almost all of them follow the same three switches (reduced motion, no JavaScript, missing CSS features), so turning one off is usually deleting one block.
- The reduced-motion safety net in `global.css` can't reach view transitions (`*` doesn't match `::view-transition-*`), which is why `canTransition()` exists.
- The Devlog's "Links" sections were the best source list: 280 links, already sorted by what they were used for.

## Next

- Keep the guide in step with the code: when an effect, token or library changes, update its chapter.
