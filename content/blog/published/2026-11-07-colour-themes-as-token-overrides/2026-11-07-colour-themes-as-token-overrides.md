---
title: 'Six colour themes as token overrides'
date: 2026-11-07
tags: [css, design-tokens, accessibility]
description: My site now has six colour themes, from Tokyo Night to Solarized. Each is one CSS file, no component changed, and a unit test checks every theme's contrast.
cover: Three colour theme palettes on a screen, with a key unlocking them.
---

My site has a light and a dark mode. Now it also has colour themes: a palette button in the header switches the whole site to Tokyo Night, Dracula, Catppuccin, Rosé Pine, Gruvbox or Solarized, each in light and in dark. Adding them didn't touch a single component.

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

## Five more, and a test

The others came from each theme's official palette. I picked ones with an official light _and_ dark variant, since every token needs both: Dracula has Alucard, Catppuccin has Latte and Mocha, Rosé Pine has Dawn and Main, and Gruvbox and Solarized were designed as pairs.

Most of their light variants failed contrast somewhere: editor themes use mid-tone accents that read fine as code on a big screen, but not as body text at WCAG's 4.5:1. I didn't want to swap colours for others, so a colour that fails keeps its hue and chroma, and only its lightness moves (darker in light, lighter in dark) until it passes. Every theme file lists what changed, original and new. Solarized changed the most: its accents were made to sit on both backgrounds, so they're right in the middle.

Then I turned the checks into a unit test. For every theme and both halves, it reads the colours out of the CSS and checks the pairs the site really draws, spotlight included. The first run failed, on Tokyo Night, the theme I'd already shipped: its light brand colour was 4.23:1 when a link sat on the spotlight. Lighthouse had given that page 100, because the spotlight wasn't under a link when it ran. A test doesn't depend on where the mouse is.

<!-- TODO: Alfonso, your favourite of the six, and why. -->

## A transition for every switch

Switching themes shouldn't just snap. The light/dark toggle already had a circle that grows from the button (a view transition). The colour themes got effects of their own, four of them, taking turns:

- **Grid ripple:** the squares of my blueprint background flip to the new theme one by one, in a wave from where you clicked. The new page is shown through a mask: an SVG with one square per grid cell, each fading in a little later the farther it is. An SVG used as a CSS image runs its own `<animate>` elements, so the mask animates itself.
- **Glitch:** for less than half a second, the new theme shows up in random horizontal bands that jump sideways, with the red channel pulled one way and green and blue the other, then it settles. `steps()` timing makes every frame a jump instead of a fade.
- **Scanline redraw:** a glowing line sweeps down the screen and draws the new theme above it. Nothing draws the line: the new picture fades out just above it and the old one just below, so right at the line you see what's behind both, which is the brand colour.
- **Column rain:** every grid column drops the new theme in from the top at its own moment.

All of them are off for anyone who prefers reduced motion: the colours just change.

<!-- TODO: Alfonso, which ones you kept, which one you like best, and a recording of it (see the publishing guide's Videos section). -->

## Links

- [Tokyo Night for VS Code](https://github.com/enkia/tokyo-night-vscode-theme) (MIT, by Enkia)
- [MDN: light-dark()](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark)
- [MDN: Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API)
- [MDN: CSS anchor positioning](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_anchor_positioning)
- [MDN: color-mix()](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix)
