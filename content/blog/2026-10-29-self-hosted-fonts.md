---
title: A different font for each part of my site, all self-hosted
date: 2026-10-29
tags: [css, fonts, fontsource, design-tokens, sveltekit]
draft: true
description: Fira Code for code, a handwritten font for my dev log and the system font everywhere else. No Google Fonts, no extra cost on pages that don't use them.
---

I wanted each part of my portfolio to have its own feel. Code should look like code, my dev log (the Bitácora) should feel like a notebook, and the rest should stay out of the way. I also didn't want any requests to a third party.

## The picks

- **Code: [Fira Code](https://github.com/tonsky/FiraCode).** It's Fira Mono with optional ligatures, so `=>` is drawn as an arrow. They can be turned off with `font-variant-ligatures: none`.
- **Bitácora: [Shantell Sans](https://shantellsans.com/).** It looks handwritten but was designed to stay readable in long text. True script fonts look great in a title and get tiring after a paragraph.
- **Everything else: the system font.** Open Props' `--font-sans` stack uses the OS's own font. It's free and instant, at the cost of looking a bit different on Windows, macOS and Android.

## Why self-host

- **Privacy.** Loading fonts from Google's servers sends every visitor's IP address to Google. A German court ruled that this breaks GDPR in 2022.
- **The CDN cache argument is gone.** It used to be "everyone already has Google's copy of Roboto cached". Browsers now keep a separate cache per site, so that copy is never reused on your site.
- **One fewer server to connect to**, so the font often arrives sooner.

The costs: you handle updates (rare for fonts), you have to keep the files small, and you need to check the license. All three fonts are under the SIL Open Font License, which allows self-hosting.

## Fontsource

[Fontsource](https://fontsource.org/) packages open-source fonts as npm packages:

```sh
pnpm add -D @fontsource-variable/fira-code @fontsource-variable/shantell-sans
```

```ts
// src/routes/+layout.svelte
import '@fontsource-variable/fira-code';
import '@fontsource-variable/shantell-sans';
```

Each import is a CSS file full of `@font-face` rules. Vite copies the `.woff2` files into `build/` with hashed names and rewrites the URLs. npm is only involved at install time. Visitors only ever talk to my site.

Why not just download the `.woff2` files into `static/fonts/`? That works too. My site lives under `/portfolio` on GitHub Pages, and I expected `url('/fonts/x.woff2')` to 404 there. I tested it: Vite rewrites every `url()` in the CSS it processes into a relative path (`url("/robots.txt")` became `url(../../../robots.txt)`). Only URLs that Vite never sees, like a hard-coded path in `app.html` or an inline `style` attribute, would break.

What Fontsource adds is convenience: the `unicode-range` subsets are already made, the files get hashed names so browsers can cache them forever, and `pnpm update` handles updates.

## Fonts only cost something where they're used

I was worried that three fonts would mean three downloads on every page. They don't. **A browser only downloads a font when some text on the page actually uses it.** I checked in the built site:

| Page                   | Font files downloaded             |
| ---------------------- | --------------------------------- |
| Home                   | none                              |
| Bitácora               | Shantell Sans (Latin only)        |
| Any page with `<code>` | Fira Code (Latin only), on demand |

The "Latin only" part comes from `unicode-range`. Fontsource splits each font into subsets (Latin, Latin Extended, Cyrillic, Greek…), and the browser only downloads the subsets it needs for the characters on the page.

## Font tokens per section

Fonts follow the same pattern as my [color tokens](./2026-10-27-design-tokens): primitives, then semantic tokens, then overrides.

```css
/* tokens.css */
:root {
	--font-body: var(--font-sans);
	--font-code: 'Fira Code Variable', var(--font-mono);
	--font-hand: 'Shantell Sans Variable', var(--font-sans);
}
```

```css
/* global.css, @layer base */
body {
	font-family: var(--font-body);
}
h1,
h2,
h3 {
	font-family: var(--font-heading, var(--font-body));
}
code,
kbd,
pre,
samp {
	font-family: var(--font-code);
}
```

The Bitácora gets its own layout, which only overrides a token:

```svelte
<!-- src/routes/bitacora/+layout.svelte -->
<div class="bitacora">{@render children()}</div>

<style>
	.bitacora {
		--font-body: var(--font-hand);
		font-family: var(--font-body);
	}
</style>
```

Everything inside the section picks up the handwritten font, and no component knows anything about it. This is also how I plan to do more themes and user styles later: each one is just a set of token overrides.

## The gotcha: var() is resolved where it's defined

My first version had this in `tokens.css`:

```css
:root {
	--font-body: var(--font-sans);
	--font-heading: var(--font-body); /* ❌ */
}
```

It looks like `--font-heading` follows `--font-body`. It doesn't. A `var()` inside a custom property is **resolved on the element where the property is defined**, here `:root`. Children inherit the result, a plain font stack, not a live reference. So when the Bitácora overrode `--font-body`, `--font-heading` was still the system font, and my headings stayed in the wrong font.

The fix is to resolve the value where it's used, with a fallback:

```css
h1 {
	font-family: var(--font-heading, var(--font-body));
}
```

Now `--font-body` is looked up on the `h1` itself, inside the section, and it picks up the override. The same rule explains why the Bitácora wrapper sets `font-family` again: `body` already computed its font, and children inherit that computed value, not the token.

**Update:** later, for the site's [dark-first identity](./2026-10-31-dark-first-palette), headings switched to Fira Code everywhere. So `--font-heading` is now defined on `:root` as `var(--font-code)`, and a new `--font-label` does the same for the nav, buttons and small UI text. Neither follows `--font-body` any more, on purpose, so this gotcha can't bite them. The rule still holds for any token built from another one.
