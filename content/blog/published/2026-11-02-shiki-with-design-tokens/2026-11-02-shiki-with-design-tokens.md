---
title: Syntax highlighting with Shiki, colored by my own design tokens
date: 2026-11-02
tags: [shiki, mdsvex, css, design-tokens]
description: Highlighting code blocks at build time with Shiki, and a small TextMate theme whose colors are CSS variables, so code follows my site's themes.
cover: A window with multicolor code.
---

My blog's code blocks were highlighted by Prism, mdsvex's default, which warned about languages it couldn't load. I switched to Shiki, which uses the same grammars as VS Code. The harder part was the colors: my site has a light and a dark theme, and I want named themes and themes made by visitors later. Code had to follow all of them.

## Highlighting while the site builds

Shiki runs in `vite.config.ts`, while the site builds. mdsvex calls my function for every code block, and I give back HTML:

```ts
const shiki = createHighlighter({ themes: [codeTheme], langs: [] });

async function highlight(code: string, lang: string | null | undefined) {
	const highlighter = await shiki;
	let language = 'text';
	if (lang && lang in bundledLanguages) {
		await highlighter.loadLanguage(lang as BundledLanguage);
		language = lang;
	}
	const html = highlighter.codeToHtml(code, { lang: language, theme: 'tokens' });
	const escaped = html.replace(/[{}`\\]/g, (c) => `&#${c.charCodeAt(0)};`);
	return `<Components.CodeBlock lang="${language}">{@html \`${escaped}\`}</Components.CodeBlock>`;
}
```

The highlighter is created once and starts with no languages. Each one loads the first time a block uses it. What reaches the browser is a `<pre>` full of `<span>`s that already have their colors, and no highlighting JavaScript.

The `<pre>` is wrapped in a small `CodeBlock` component, which adds the language, line numbers and a copy button. That's a story of its own: [A code block frame](./2026-11-02-a-code-block-frame).

## Where the colors come from

Shiki has three ways to theme code:

- **Dual themes.** Pass a light and a dark theme, and Shiki writes both colors on every span. A bit of CSS (or `defaultColor: 'light-dark()'`) switches between them. The colors come from those themes, though, not from my tokens.
- **The CSS-variables theme.** Every color is a `var(--…)` I define. But Shiki's docs say it's "a lot less granular" than other themes, and they're right: only about ten kinds of token got a color. My light theme looked dull.
- **A theme of my own** with CSS variables as its colors. This is what the docs recommend for better results, and what I picked.

## A small TextMate theme

A grammar gives every token a list of scope names, from general to specific. A theme maps scopes to colors. Mine has eight rules, and every color is a token from `tokens.css`:

```ts
export const codeTheme: ThemeRegistration = {
	name: 'tokens',
	fg: 'var(--code-foreground)',
	bg: 'var(--code-background)',
	settings: [
		{
			scope: ['string', 'punctuation.definition.string'],
			settings: { foreground: 'var(--code-string)' }
		},
		{
			scope: ['entity.name.tag'],
			settings: { foreground: 'var(--code-tag)' }
		}
		// …six more rules
	]
};
```

```css
--code-string: var(--brand);
--code-tag: light-dark(var(--red-dark), var(--red-bright));
```

`light-dark()` picks the color for the current theme, so the dark and light themes need nothing else. A future named theme only overrides the `--code-*` tokens.

## Which rule wins

A selector matches a scope and everything under it: `entity.name.tag` matches `entity.name.tag.html`, `entity.name.tag.css` and also `entity.name.tag.yaml`, because the YAML grammar calls its keys tags. My YAML keys came out red like HTML tags.

When several rules match, the one that matches more segments wins. So a rule for `entity.name.tag.yaml` makes YAML keys teal, whatever order the rules are in. It works like specificity in CSS. Listing more selectors in one rule doesn't make it stronger: the list only means "any of these".

To find the scope of a token, VS Code's **Developer: Inspect Editor Tokens and Scopes** command shows the same names Shiki sees.

## Escaping, three times

Code is full of characters that mean something somewhere else:

- Shiki escapes `<` and `&`, so a `<script>` in a code block is shown as text, not run.
- The HTML goes into a Svelte template, where `{count}` would be read as an expression.
- It sits inside a JavaScript template string, where a backtick would end the string and a backslash would change the next character.

mdsvex's usual helper, `escapeSvelte`, handles the braces and backticks but not most backslashes. In my CSS-in-a-grep example, `\-\-` came out as `--`. So I escape all four characters as HTML entities, which look the same on screen.

That's escaping: encoding data so it stays data in a given place. It isn't sanitizing, which removes dangerous parts from HTML you do want to render. Svelte's `{@html}` never sanitizes. That's fine for markdown I write myself, and something to remember if I ever render markdown I didn't write.

## Contrast

Every code color has to be readable on the code block's background, in both themes. I checked each pair before using it: the lowest is 5.3:1, above the 4.5:1 WCAG AA asks for normal text. I also kept every color inside the sRGB range, so screens show what I checked.
