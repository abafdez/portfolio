# 3. Colours, type and layout

Everything visual that isn't motion: design tokens, light and dark, the colour themes, fonts, widths, the text size setting, and how the CSS is layered.

## Design tokens

A design token is a named value, here a CSS custom property, that components use instead of a raw value. All of them are in `src/lib/styles/tokens.css`, in two levels:

1. **Primitives**: the actual colours, named after what they are. `--ink-0` … `--ink-8` (blue-greys, the dark theme), `--paper-0/1/3` and `--pencil-1/2` (the light theme's warm white and graphite), `--green-dark` / `--green-bright` (the brand: a deep ink green for light, the bright phosphor green for dark), a dark and a bright step per syntax hue (`--violet-*`, `--blue-*`, `--amber-*`, `--teal-*`, `--red-*`), and the window lights.
2. **Semantic tokens**: what a colour is _for_. Components only use these.

| Token                                                            | Used for                                                                        |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `--brand`                                                        | Links, headings, accents, the active nav item, the scrollbar thumb, focus rings |
| `--text-1`, `--text-2`                                           | Body text, muted text                                                           |
| `--surface-1`, `--surface-2`, `--surface-3`                      | The page (and sheets), inner panels and code, borders and hover fills           |
| `--error`                                                        | Form errors                                                                     |
| `--grid-line`, `--grid-line-major`, `--grid-mark`, `--grid-size` | The blueprint grid behind the page                                              |
| `--grid-spot-line`, `--grid-spot-line-major`, `--grid-spot-glow` | The grid lit up around the pointer                                              |
| `--code-*`                                                       | Every colour in a highlighted code block (Shiki maps to these)                  |
| `--callout-note` … `--callout-caution`                           | The five callout types                                                          |
| `--icon-tone`                                                    | The lightness skill logos are drawn at (each keeps its own hue)                 |
| `--window-minimize`, `--window-zoom`                             | The yellow and green title-bar lights                                           |
| `--mascot-*`                                                     | The mascot's colours                                                            |
| `--shadow-float`                                                 | The floating header, popovers, the footer panel                                 |
| `--content-width`, `--reading-width`, `--header-space`           | Layout widths and the sticky header's height                                    |
| `--font-body`, `--font-code`, `--font-heading`, `--font-label`   | The four font roles                                                             |

To restyle the site, change semantic tokens. To change one colour everywhere, change its primitive.

## Light and dark

```css
:root,
[data-theme] {
	color-scheme: light dark;
	--brand: light-dark(var(--green-dark), var(--green-bright));
	--text-1: light-dark(var(--pencil-1), var(--ink-2));
	/* … */
}
```

- `light-dark(a, b)` picks `a` or `b` from the element's `color-scheme`. `light dark` means "follow the OS"; the toggle sets `data-theme="light"` or `"dark"` on `<html>`, which forces one (`[data-theme='light'] { color-scheme: light }`).
- The tokens are declared on `:root` **and** on every `[data-theme]` element. A custom property holding `light-dark()` is resolved where it's declared, so without the second selector a part of the page with a different `data-theme` (the contrast checker draws both themes side by side) would still inherit the root's colours.
- `--dark` is `0` or `1`, for things `light-dark()` can't do because they aren't colours (a transform, an opacity): `calc(var(--dark) * …)`.
- Printing always uses the light theme (`@media print` at the end of `tokens.css`).
- The site was designed dark first. Light is "ink green" (picked 2026-11-18 from three directions): a soft warm white, graphite text, a deep ink-green brand, and a quiet grid with no minor lines (only faint major lines and the crosses, in the text colour). `design/light-theme-directions.md` has the history: the first engineering-pad version (cream and a brand-coloured grid) looked busy and loud.

## Colour themes ("palettes")

In code a colour theme is a **palette** (`data-palette`), because "theme" already means light or dark. The picker in the header is `src/lib/components/PalettePicker.svelte`; the list is `src/lib/palettes.ts`; each theme is one CSS file in `src/lib/styles/themes/`.

A theme file overrides the semantic tokens for both halves:

```css
:root[data-palette='gruvbox'],
[data-palette='gruvbox'] [data-theme],
[data-theme][data-palette='gruvbox'] {
	--surface-1: light-dark(#fbf1c7, #282828);
	--text-1: light-dark(#3c3836, #ebdbb2);
	--brand: light-dark(#9f3301, #fe9148);
	/* … every token palettes.test.ts lists */
}
```

- The three selectors cover `<html>`, `[data-theme]` elements inside it, and an element that has both.
- Colours are written as hex in `light-dark(#hex, #hex)` so `src/lib/palettes.test.ts` can read them without a browser. The test checks the list and the files match, every required token is set for both halves, and **every text colour is at least 4.5:1 on what it sits on**, including the grid under the spotlight.
- The grid, the spotlight and the icon tone are derived from `--text-1` and `--brand` in `tokens.css`, so a theme doesn't set them.
- `themes/_licences.css` holds the copyright lines in a `/*! */` comment. The underscore sorts it first, which matters: the minifier only keeps a legal comment at the very start of the CSS.
- The first palette, Phosphor, is the default and has no file: no `data-palette` means the colours in `tokens.css`.

How to add one: chapter 7.

## Mixing colours: always `in oklab`

Many tokens are `color-mix(in oklab, var(--brand) 15%, transparent)`. Always `oklab`, never `oklch`: Chrome drops the hue of a near-grey colour in `oklch` and draws the missing hue as 0, a pink tint. `oklab` has no hue to lose.

Relative colours do the rest: `oklch(from var(--icon-tone) l c h)` keeps a colour's lightness and swaps in another hue. The skill logos and the tag chips use it to sit at the theme's lightness in their own hue.

## Fonts

| Token            | Font                                              | Used for                    |
| ---------------- | ------------------------------------------------- | --------------------------- |
| `--font-body`    | the system font stack (`--font-sans`, Open Props) | body text                   |
| `--font-code`    | Fira Code Variable (self-hosted)                  | code                        |
| `--font-heading` | `var(--font-code)`                                | headings                    |
| `--font-label`   | `var(--font-code)`                                | nav, buttons, small UI text |

- Fira Code is imported once in `src/routes/+layout.svelte`. Fontsource splits it by alphabet (`unicode-range`), and browsers only download what a page uses.
- `src/hooks.server.ts` preloads only the Latin files (`<link rel="preload">`), so text doesn't jump when the font arrives.
- A section can change its body font by overriding `--font-body` on a wrapper and setting `font-family` again (children inherit the computed font, not the token). The Devlog did that with a handwritten font until 2026-11-18.
- To change the code/heading font: install another `@fontsource-variable/...`, import it in the root layout, change `--font-code` in `tokens.css`, and update the preload pattern in `hooks.server.ts` if its file names differ.

## Widths

- `--content-width: clamp(70rem, 82vw, 96rem)` is the width of the header, `main` and the footer: 82% of the window, between 1120 and 1536 px.
- `--reading-width: 80ch` is the reading column (posts, Devlog entries), about 80 characters a line. Pages opt into it with `composition: 'reading'` in their load data, which the root layout puts on `<main data-composition>`.
- On wide screens the reading column **zooms** (`global.css`): 1.12 from 100rem, 1.25 from 120rem, 1.4 from 150rem. It keeps its 80 characters and gets bigger, instead of wider.
- `--header-space` is the sticky header's height, used by `scroll-padding` so in-page jumps don't land under it.
- Below 36rem a `.sheet` goes edge to edge.

## Text size

The theme menu has smaller / size / larger / reset buttons (`PalettePicker.svelte`). They set `--text-scale` on `<html>` (`src/lib/text-size.ts`: `scales` from 0.875 to 1.375), and `global.css` does:

```css
html {
	font-size: calc(var(--text-scale, 1) * 100%);
}
```

Everything is in `rem`, so text, spacing and widths scale together, on top of the browser's own size. Media queries don't move: `rem` in a media query is the browser's default size. To change the steps, edit `scales` and the list in `src/app.html` that restores the value.

## The CSS layers

`src/lib/styles/global.css` starts with `@layer reset, base, components;`. Later layers win regardless of specificity, and **component `<style>` blocks are unlayered, so they beat every layer**.

| Layer        | What's in it                                                                                                                                                                                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `reset`      | Box sizing, margins, media defaults, and the **reduced-motion safety net**: under `prefers-reduced-motion: reduce`, every animation and transition ends almost instantly (`0.01ms !important`). `!important` reverses layer order, so this early layer beats everything. |
| `base`       | The text size, scrollbar, smooth scroll, body font and colours, headings, links, `::selection`, `:focus-visible`, the page grid (header / main / footer), `main`'s width and compositions, and the **page transition CSS** (chapter 5).                                  |
| `components` | Shared classes: `.visually-hidden`, `.sheet`, `.prose` (everything inside rendered markdown, including callouts, tables and code blocks).                                                                                                                                |

What that means in practice:

- A component that sets `padding` on an element with `.sheet` overrides the sheet's padding (unlayered beats layered). Restore what you need.
- Markdown HTML is made on the server, outside any component, so a page's scoped styles can't reach it; that's why it's styled by the global `.prose`.
- A page-specific global rule should be scoped with `:has()` (`:global(html:has(.landing))`) so it only applies while that page is open.

## The sheet rule

The blueprint grid is for display headings (20 px and up) and empty space. **Text at body size or smaller sits on a surface**: `.sheet` (opaque `--surface-1`, the page's own colour, with a `--surface-3` border). Inner panels inside it use `--surface-2`. A new page should put its text in a sheet; the Devlog entry `2026-11-09-paper-on-the-drawing-board` has an audit script that finds text sitting on the grid.
