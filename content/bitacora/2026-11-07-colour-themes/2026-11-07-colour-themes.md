---
title: Colour themes, starting with Tokyo Night
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

## What I learned

- A theme system is cheap when components only use semantic tokens: a new theme is a list of colours, not a change to every component. The grid, the spotlight and the icon tone follow on their own, because they're made from `--text-1` and `--brand`.
- **Checking contrast means checking the pairs the page really uses.** Tokyo Night Light's code colours fail on `--surface-3`, but code never sits there. The spotlight is a pair too: a blue line under grey text took light `--text-2` to 4.26:1.
- Lighthouse starts each run with empty storage. To audit a saved choice: prepare a browser profile that has it, then run Lighthouse with `--user-data-dir` and `--disable-storage-reset`.
- In zsh, `path` is tied to `PATH`: a loop variable called `path` wiped out every command.

## Problems & fixes

- **A pink header in light Tokyo Night.** `color-mix(in oklch, #e6e7ed 75%, transparent)` came out as `oklch(0.93 0.008 none)`: Chrome drops the hue of a near-grey hex colour, and a missing hue is drawn as 0, which is pink. Our own greys are written in `oklch()` and kept their hue, so it never showed. Every mix with `transparent` is now `in oklab`, which has no hue to lose.
- Vitest gave the theme CSS back as an empty string (it doesn't process CSS, even with `?raw`), so the test reads the files with `node:fs`.

## Links

- [Tokyo Night for VS Code](https://github.com/enkia/tokyo-night-vscode-theme)
- [MDN: Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API)
- [MDN: CSS anchor positioning](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_anchor_positioning)
- [MDN: light-dark()](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark)
- [MDN: MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)

## Next

- More themes (Dracula?), each a CSS file and a line in `palettes.ts`.
- The dull default light theme: three directions are in `design/light-theme-directions.md`.
