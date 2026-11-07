---
title: Colour themes, from Tokyo Night to Solarized
date: 2026-11-07
tags: [css, design-tokens, accessibility, themes]
---

## What we did

- **Colour themes**, picked from a palette button in the header next to the light/dark toggle. In code they're **palettes** (`data-palette` on `<html>`), because "theme" already means light or dark (`data-theme`). The list is `src/lib/palettes.ts`; the first, Phosphor, is the site's own colours and needs no CSS.
- **A theme is one CSS file** in `src/lib/styles/themes/` that overrides only semantic tokens, each with `light-dark(light, dark)`, so the toggle still picks the half. Components didn't change at all. The layout loads every file in that folder with `import.meta.glob`.
- **Tokyo Night** (by Enkia, MIT, credited in the CSS and in the picker), from its VS Code theme files. Changes for contrast: comments use `--text-2` (the original's are 2.5:1), light cards are a lighter tint (`#f1f2f6`) with the sidebar colour for borders, and light `--text-2` is a bit darker (`#4f5367`).
- **The picker** is a `popovertarget` button (the Popover API: Escape, click outside and focus return for free) with radios inside, placed under the button with **anchor positioning**. The choice is saved in `localStorage`, and `app.html` puts it back before the first paint, so it never flashes.
- The **contrast checker** re-reads the tokens when the palette changes (a `MutationObserver` on `data-palette`).
- `palettes.test.ts`: every palette has its CSS file and the other way round, the selectors are right, and every token is set for light and dark.
- Checked: Lighthouse accessibility 100 on four pages, Tokyo Night, both modes; no horizontal scroll at 320px.
- **Five more:** Dracula (with Alucard, its light variant), Catppuccin (Latte and Mocha), Rosé Pine (Dawn and Main), Gruvbox and Solarized, all MIT, each from its official palette and credited. Every theme file lists the colours it changed for contrast.
- **Contrast fixes keep the theme's look:** a colour that fails keeps its hue and chroma and only gets lighter (dark) or darker (light) until it passes. Solarized needed the most (29 colours): its accents are mid-tones meant to work on both backgrounds.
- **`palettes.test.ts` now checks contrast** for every theme, both halves, on the pairs the site really draws: text, `--text-2` and brand on all three surfaces and on the spotlight, error on the page and cards, code and callouts on `--surface-2`. It caught a real failure in my own Tokyo Night: light brand links were 4.23:1 on the spotlight (now `#2252a2`, 4.65:1).
- Checked: Lighthouse accessibility 100 on a post with callouts and code for each new theme, both modes; the seven-item menu fits at 320px.

## What I learned

- A theme system is cheap when components only use semantic tokens: a new theme is a list of colours, not a change to every component. The grid, the spotlight and the icon tone follow on their own, because they're made from `--text-1` and `--brand`.
- **Checking contrast means checking the pairs the page really uses.** Tokyo Night Light's code colours fail on `--surface-3`, but code never sits there. The spotlight is a pair too: a blue line under grey text took light `--text-2` to 4.26:1.
- Lighthouse starts each run with empty storage. To audit a saved choice: prepare a browser profile that has it, then run Lighthouse with `--user-data-dir` and `--disable-storage-reset`.
- **The spotlight is made from the brand, so the brand has to pass on its own light.** Change the brand and its background changes too; a fix has to recompute the spotlight for every candidate colour.
- `--surface-3` is mostly borders, but text does sit on it: the cover tile's tag, hover states, inline code in callouts. So it stays in the checks.
- **Palette lists:** [tinted-theming/schemes](https://github.com/tinted-theming/schemes) has 362 Base16 schemes in one YAML format (MIT), a good start for user themes later. Each file is one variant (dark or light), and many fail contrast as web text.
- In zsh, `path` is tied to `PATH`: a loop variable called `path` wiped out every command.

## Problems & fixes

- **A pink header in light Tokyo Night.** `color-mix(in oklch, #e6e7ed 75%, transparent)` came out as `oklch(0.93 0.008 none)`: Chrome drops the hue of a near-grey hex colour, and a missing hue is drawn as 0, which is pink. Our own greys are written in `oklch()` and kept their hue, so it never showed. Every mix with `transparent` is now `in oklab`, which has no hue to lose.
- My first Lighthouse runs for the five themes audited the default colours: the script that saved the palette used `process.env` inside the page, where `process` doesn't exist. Checking the profile afterwards showed it; with the id passed into `page.evaluate()`, all ten runs were really the themes.
- Vitest gave the theme CSS back as an empty string (it doesn't process CSS, even with `?raw`), so the test reads the files with `node:fs`.

## Links

- [Tokyo Night for VS Code](https://github.com/enkia/tokyo-night-vscode-theme), [Dracula spec](https://draculatheme.com/spec), [Catppuccin palette](https://github.com/catppuccin/palette), [Rosé Pine palette](https://github.com/rose-pine/palette), [Gruvbox](https://github.com/morhetz/gruvbox), [Solarized](https://ethanschoonover.com/solarized/)
- [MDN: Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API)
- [MDN: CSS anchor positioning](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_anchor_positioning)
- [MDN: light-dark()](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark)
- [MDN: MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)

## Next

- More themes are a CSS file and a line in `palettes.ts`; the test checks their contrast.
- The dull default light theme: three directions are in `design/light-theme-directions.md`.
