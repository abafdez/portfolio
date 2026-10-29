---
title: Open Props in SvelteKit with only the variables you use
date: 2026-10-22
tags: [css, open-props, postcss, vite, sveltekit]
draft: true
description: How I set up Open Props with postcss-jit-props in a SvelteKit 3 project. The config goes in vite.config.ts, and I explain why CSS needs a plugin to do tree-shaking.
---

[Open Props](https://open-props.style/) is a set of ready-made CSS custom properties: colors, sizes, fonts, shadows and easings. You write `padding: var(--size-3)` and get a consistent scale without designing one yourself.

The catch is that there are hundreds of them. This post covers how I ship only the ones my site actually uses.

## Why importing isn't enough

My first instinct was that the bundler would sort it out. Vite tree-shakes JavaScript, so surely it does the same for CSS?

It doesn't. Tree-shaking works in JS because imports and exports are explicit. If you write `import { foo } from 'lib'`, the bundler can see you never touched `bar`. CSS has nothing like that:

```css
@import 'open-props/colors.min.css';
```

This copies the **whole file** into your bundle, around 200 color variables, even if you use two. The minifier makes the text shorter but can't remove any variable. Any of them could be read later by `var()` in another file, by an inline `style`, or by JavaScript.

Importing only some modules (`colors`, `sizes`) helps, but you still get every variable in each module you import.

## postcss-jit-props

[postcss-jit-props](https://github.com/GoogleChromeLabs/postcss-jit-props) does the tree-shaking CSS lacks. It reads your CSS, finds each `var(--something)`, and injects only those definitions into `:root`.

It needs a lookup table to know what `--size-3` means. Open Props provides one: the package exports a JS object with every variable.

## Setting it up in Vite

The README shows a `postcss.config.js` file. In a Vite project I preferred to put the PostCSS config inline in `vite.config.ts`. It's already TypeScript, `defineConfig` gives autocomplete, and all the build config stays in one place.

```sh
pnpm add -D open-props postcss-jit-props
```

```ts
import { defineConfig } from 'vite';
import OpenProps from 'open-props';
import postcssJitProps from 'postcss-jit-props';

export default defineConfig({
	plugins: [/* sveltekit(), … */],
	css: {
		postcss: {
			plugins: [postcssJitProps(OpenProps)]
		}
	}
});
```

Two things that confused me:

- **There are two plugin lists.** Top-level `plugins` holds Vite plugins. `css.postcss.plugins` holds PostCSS plugins. Same name, different tools.
- **It covers Svelte components too.** Svelte doesn't run PostCSS itself. Each component's `<style>` block becomes a virtual CSS module and goes through Vite's CSS pipeline, the same as a `.css` file.

Once `css.postcss` is set inline, Vite stops looking for `postcss.config.*` files, so don't keep one around.

## Dev dependency or regular dependency?

Both packages are **dev** dependencies. My site is static, and GitHub Pages only serves the `build/` folder. No `node_modules` and no Node. Open Props is only read during the build. The browser gets plain CSS like `:root{--size-3:1rem}` and never sees the package.

`dependencies` matters for libraries and server apps that install packages in production. A static site has neither.

## Checking that it works

```sh
pnpm build
grep -ro "\-\-size-3:[^;]*" build/
```

Only the variables I use show up. Searching `build/` for `open-props` finds nothing.

## Things to watch out for

- **JIT only reads CSS.** A variable used only in a `style="…"` attribute or in TypeScript won't be injected, and the browser silently falls back.
- **Typos fail silently too.** `var(--size-33)` doesn't exist, so nothing is injected, and neither TypeScript nor the build warns you.
- **No editor autocomplete out of the box.** The variables aren't defined in any CSS file in your project. I fixed that with the CSS Variable Autocomplete extension, pointed at the package's full stylesheet. That file is used only for editor suggestions, never imported:

```json
"cssVariables.lookupFiles": ["**/*.css", "node_modules/open-props/open-props.min.css"],
"cssVariables.languages": ["css", "svelte"]
```

Next: [semantic design tokens](./2026-10-27-design-tokens) on top of these primitives.
