---
title: Components in code blocks
date: 2026-11-07
phase: 9.5
tags: [markdown, video, mdsvex]
---

## What we did

- **Fenced-block components:** a code block whose language is a component name, with YAML fields as its body, becomes that component. Anywhere else (Obsidian, GitHub) it's a readable block of YAML.
- `src/lib/blocks.ts`: a registry, `blocks`, of name → fields + `render()`. `highlight()` in `vite.config.ts` asks `renderBlock(lang, code, file)` first; anything that isn't one of ours is highlighted by Shiki as before. The `markdown()` plugin passes the file's `id` to `highlight()`.
- **First component, `video`:** `src`, `width`, `height` required; `webm`, `poster`, `caption` optional. It renders the same `<video controls muted playsinline preload="metadata">` I used to write by hand (WebM `<source>` first, a `<figure>` when there's a caption). The `./` files go through `enhanceMedia()` like before, so they become imports and the size check still runs.
- **The build checks the YAML:** a missing required field, an unknown field (`autoplay` too, on purpose), a size that isn't a whole number, a file without `./`, text YAML reads as a number, or broken YAML fails, naming the file and the block. Checked in dev too: the page gives a 500 and the terminal prints the file and the field.
- 12 tests in `blocks.test.ts`, one of them through `enhanceMedia()`.
- Draft `components-in-code-blocks` with a real clip (`awesome-filter.webm`, 960×540, 580 KB, recorded with Playwright's `recordVideo`: there's no ffmpeg in WSL). The publishing guide's Videos section starts with the block now; the videos draft points to the new one.
- ` ```text ` blocks no longer print a Shiki warning: `text` is plain on purpose.
- Checked: Lighthouse accessibility 100 on the draft in both themes (dev), no horizontal scroll at 320px (the video scales to 288×163), `pnpm test:e2e` passes.

## What I learned

- mdsvex calls the highlighter with `(code, lang, meta, filename)` for every code block, and puts whatever it returns into the page as raw HTML. That makes it a hook for anything, not just colours.
- A code block's language is just a word. Tools that don't know it show the code as plain text, which is why YAML inside is a good fit: it's readable as it is.
- **TypeScript mapped types:** `Values<Fields>` works the values' types out from the field list (`size` → `number`, optional → `| undefined`), so `render()` can't use a field the block doesn't declare.
- `Object.hasOwn(blocks, lang)` and not `lang in blocks`: `in` also finds built-in keys like `toString`, so a ` ```toString ` block would have looked like a component.

## Problems & fixes

- mdsvex's `Highlighter` type says the filename may be `undefined`, so `highlight()` couldn't require it. The `markdown()` plugin always knows the file (`id`), so it passes it in a small arrow function instead.
- `pnpm preview` failed with `preview_build_missing`: the build output was gone, probably cleared by a later `pnpm check` or test run (both run SvelteKit's setup). Rebuilt first.

## Links

- [mdsvex: highlight](https://mdsvex.pngwn.io/docs#highlight)
- [TypeScript: mapped types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)
- [MDN: Object.hasOwn()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwn)
- [Playwright: recording videos](https://playwright.dev/docs/videos)

## Next

- Open both drafts in Obsidian and on GitHub to check they read well there (the last "Done when" item of Phase 9.5).
- Next components: `compare` (before/after) or a live demo.
