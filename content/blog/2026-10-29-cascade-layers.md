---
title: 'Cascade layers: stop fighting specificity'
date: 2026-10-29
tags: [css, cascade-layers]
draft: true
description: How @layer lets me decide once which global styles win, and why my Svelte component styles beat all of them without extra effort.
---

Every CSS codebase I've seen eventually ends up with selectors like `html body main a:not(.x)` or `!important`, just to beat some earlier rule. Cascade layers fix this by letting you decide priority in one place.

## The problem

When two rules set the same property on the same element, the browser picks one by:

1. **Specificity**: IDs beat classes, and classes beat element selectors.
2. **Source order**: if specificity is equal, the later rule wins.

So a reset that uses `a:not([class])` beats a component's plain `a`, even though the component should win. You raise specificity to get around it, and the next rule raises it again.

## Layers come before specificity

```css
@layer reset, base, components;
```

This line defines an order, and **a later layer always wins over an earlier one, whatever the specificity.** A plain `a {}` in `base` beats `html body a` in `reset`.

The full order the browser uses for normal declarations is:

1. Rules in layers, in the order declared
2. Then **unlayered** rules, which beat every layer

That second point works out nicely with Svelte. Component `<style>` blocks aren't in any layer, so they automatically override my global defaults. Local styles beat global styles without me doing anything.

## My global.css

```css
@layer reset, base, components;

@layer reset {
	*,
	*::before,
	*::after {
		box-sizing: border-box;
	}
	* {
		margin: 0;
	}
	img,
	picture,
	svg,
	video {
		display: block;
		max-inline-size: 100%;
	}
	input,
	button,
	textarea,
	select {
		font: inherit;
	}
}

@layer base {
	body {
		font-family: var(--font-sans);
		color: var(--text-1);
		background-color: var(--surface-1);
	}
	a {
		color: var(--brand);
	}
}
```

- **`reset`** removes browser quirks. I based it on [Josh Comeau's modern CSS reset](https://www.joshwcomeau.com/css/custom-css-reset/), and the post explains why each rule is there.
- **`base`** sets element defaults using my [design tokens](./2026-10-27-design-tokens).
- **`components`** is declared but empty for now.

`reset` comes first for a reason. If it were last, `* { margin: 0 }` would override every margin I set in `base`, and the reset would erase my own defaults.

## Things that surprised me

**The minifier rewrote my order statement.** The built CSS has `@layer reset{…}`, then `@layer base{…}`, then `@layer components;`. The order is unchanged, because a layer's position is set by where its name **first appears**. That's also why the order statement belongs at the very top of the file.

**Import order didn't matter.** `global.css` uses `var(--text-1)` from `tokens.css`, so I expected them to have to load in that order. They don't. `var()` is looked up when the browser computes an element's styles, after every stylesheet has loaded.

Source order only matters when two rules set **the same property on the same element**, with equal specificity, in the same layer. Defining a variable in one file and using it in another isn't a conflict.

Next: [dark mode](./2026-10-29-dark-mode), which turned out to be a change to one file.
