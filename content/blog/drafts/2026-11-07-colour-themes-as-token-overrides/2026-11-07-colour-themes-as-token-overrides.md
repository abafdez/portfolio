---
title: 'Colour themes as token overrides'
date: 2026-11-07
tags: [css, design-tokens, accessibility]
description: My site now has Tokyo Night as a colour theme. It took one CSS file and no change to any component, because every component already used semantic tokens.
---

My site has a light and a dark mode. Now it also has colour themes: a palette button in the header switches the whole site to [Tokyo Night](https://github.com/enkia/tokyo-night-vscode-theme), in light and in dark. Adding it didn't touch a single component.

## Why it was cheap

From the start, components only use **semantic tokens**: `--text-1`, `--surface-2`, `--brand`, never a colour like `--green-bright`. The colours behind the tokens live in one file, and each token picks its light or dark value with `light-dark()`:

```css
:root {
	--brand: light-dark(var(--green-dark), var(--green-bright));
}
```

So a theme is just another set of values for the same tokens:

```css
:root[data-palette='tokyo-night'] {
	--brand: light-dark(#2959aa, #7aa2f7);
	--surface-1: light-dark(#e6e7ed, #1a1b26);
	/* …and the rest */
}
```

The light/dark toggle still chooses which half of `light-dark()` you get. The theme chooses what's in both halves. Things I'd made from other tokens, like the blueprint grid (from `--text-1`) and the spotlight that follows the mouse (from `--brand`), changed colour on their own.

<!-- TODO: Alfonso, a screenshot of the same page in Phosphor and Tokyo Night, dark. -->

## Theme or palette?

In my code "theme" already meant light or dark (`data-theme`, the `ThemeToggle` component). Calling the new thing a theme too would have made every line ambiguous, so in code it's a **palette** (`data-palette`). Visitors see "Color theme", because that's the word they know.

## A menu with almost no JavaScript

The palette button opens a menu with the [Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API):

```svelte
<button popovertarget="palettes">…</button><div id="palettes" popover>…radio buttons…</div>
```

That attribute alone opens and closes it, closes it on Escape or a click outside, and sends focus back to the button. [Anchor positioning](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_anchor_positioning) puts it right under the button (`anchor-name` on the button, `position-anchor` and `position-area` on the menu). The only JavaScript is saving the choice, and a tiny script in `app.html` that puts it back before the page is drawn, so a reload never flashes the default colours.

## Contrast doesn't come with the theme

Tokyo Night is made for code editors, where dim comments are a feature. On a web page they'd fail contrast (2.5:1), so my comments use the theme's secondary text colour instead. Its light variant needed more: lighter cards, lighter borders, and a slightly darker grey for secondary text.

That last one I'd never have found by checking the palette on its own. My background has a spotlight: grid lines that light up in the brand colour around the mouse. Under that blue light, the theme's grey text dropped to 4.26:1. A slightly darker grey keeps it at 4.75:1. Checking contrast means checking the pairs the page really draws.

## A pink header

In the light Tokyo Night theme, my header turned faintly pink. The header's background is the page colour at 75%:

```css
background-color: color-mix(in oklch, var(--surface-1) 75%, transparent);
```

Chrome mixed `#e6e7ed` (an almost-grey) in OKLCH and gave back `oklch(0.93 0.008 none)`: the hue was gone. A missing hue counts as 0, and hue 0 is pink. My own greys are written in `oklch()` with a hue, so it never happened before. Mixing in OKLab, which has no hue at all, fixed it. Mixing with `transparent` only changes the opacity, so the colour space doesn't matter for the result, and OKLab is the safe one.

<!-- TODO: Alfonso, which theme should come next. -->

## Links

- [Tokyo Night for VS Code](https://github.com/enkia/tokyo-night-vscode-theme) (MIT, by Enkia)
- [MDN: light-dark()](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark)
- [MDN: Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API)
- [MDN: CSS anchor positioning](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_anchor_positioning)
- [MDN: color-mix()](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix)
