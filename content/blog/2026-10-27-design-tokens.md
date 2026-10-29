---
title: 'Design tokens: give your colors a job'
date: 2026-10-27
tags: [css, design-tokens, open-props]
draft: true
description: Why my components use --text-1 instead of --gray-8, and how a small tokens.css made dark mode a one-file change.
---

Open Props gives me a palette: `--gray-0` to `--gray-12`, `--blue-0` to `--blue-12`, and so on. It's tempting to use those directly in components. This post explains why I add a layer in between.

## Values vs decisions

A **design token** is a named design decision. Compare:

```css
color: var(--gray-8); /* what it looks like */
color: var(--text-1); /* what it's for */
```

Both render the same color today. Only the second one tells you its role: primary text.

So I use two kinds of tokens:

| Kind      | Example                              | Answers                     |
| --------- | ------------------------------------ | --------------------------- |
| Primitive | `--gray-8`, `--blue-9`               | Which values are available? |
| Semantic  | `--text-1`, `--brand`, `--surface-2` | What is each value for?     |

Open Props supplies the primitives, and my `tokens.css` defines the semantic ones:

```css
:root {
	--brand: var(--blue-9);
	--text-1: var(--gray-8);
	--text-2: var(--gray-6);
	--surface-1: var(--gray-0);
	--surface-2: var(--gray-1);
	--surface-3: var(--gray-3);
}
```

**The rule:** components use semantic tokens, and only `tokens.css` uses primitives.

## Why add the extra layer

- **Dark mode.** In dark mode `--text-1` becomes light gray. That's one line in one file, and every component follows. If components used `--gray-8` directly, I'd have to edit every one of them.
- **Rebranding.** Changing the brand from blue to orange means editing `--brand` once.
- **Readability.** `var(--text-2)` in a component tells you it's muted text. `var(--gray-6)` doesn't.

## Naming

- **By role, not by appearance.** `--light-gray` stops being true in dark mode. `--surface-2` stays true in both themes.
- **Numbered by emphasis.** `--text-1` is the strongest text and `--text-2` is muted. `--surface-1` is the page, and higher numbers are raised elements like cards and inputs.
- **Few tokens.** I only add one when I need it. I don't wrap Open Props sizes like `--size-3` in tokens, because spacing doesn't change between themes. A semantic name only helps when it captures a real decision.

## Picking colors that pass contrast

Open Props color scales go from 0 (lightest) to 12 (darkest). As a rough guide, 0–2 work for backgrounds, 6–8 for accents, and 9–12 for text.

My first brand color was `--brown-0`, picked at random. It was almost white on a white background and would have failed contrast immediately. WCAG AA requires:

- **4.5:1** for normal text, including links
- **3:1** for large text and UI parts such as borders and icons

To check, click a color swatch in DevTools. The picker shows the contrast ratio against the background, and draws a line marking which shades pass.

## Two mistakes I made

```ts
import tokens from '#lib/styles/tokens.css'; // ❌ "default" is not exported
import '#lib/styles/tokens.css'; // ✅ side-effect import
```

A CSS file has no exports. A plain `import '…'` tells Vite to add the stylesheet to the page.

I also wrapped my CSS in `export tokens { … }`. CSS has no `export` at all. A custom property declared on `:root` (the `<html>` element) is available everywhere because elements inherit it.

Next: [cascade layers](./2026-10-29-cascade-layers), for where these tokens get applied.
