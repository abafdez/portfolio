---
title: Code colours as classes, not inline styles
date: 2026-11-26
tags: [css, markdown, design-tokens, performance]
description: My code blocks used to carry a style attribute on every word, written by Shiki from a theme file. Now twinkleplop gives each token a class and the site's CSS colours it. I compared the two builds character by character before keeping it.
---

My posts have a lot of code, and every block was coloured by [Shiki](https://shiki.style) at build time. It worked well, but it had two habits I never liked. It wrote the colour on every single token, as `style="color:var(--code-keyword)"`, so the colours lived in the HTML instead of in the CSS. And it loaded its languages asynchronously, so before a post could be drawn, something had to collect the languages it used and wait for them.

[twinkleplop](https://twinkleplop.pngwn.at/docs) is a highlighter by pngwn, the author of mdsvex, and it does both differently.

## Classes instead of colours

twinkleplop writes a class for what each token is, the same names in every language:

```html
<span class="tok keyword">const</span> <span class="tok constant">a</span>
<span class="tok operator">=</span> <span class="tok number">1</span>
```

There's no theme file to load. My CSS decides what a keyword looks like, with the same `--code-*` tokens Shiki's theme used, so every colour theme on the site still works without touching the highlighter:

```css
.prose .code-block .tok {
	&.comment {
		color: var(--code-comment);
	}
	&:is(.keyword, .expression, .directive) {
		color: var(--code-keyword);
	}
	&:is(.string, .template, .regex, .inserted) {
		color: var(--code-string);
	}
}
```

About thirty classes map onto eight tokens. The TextMate theme I had written for Shiki, a file of scopes and colours, is gone, and so are a few hundred inline `style` attributes per post.

## Synchronous, so nothing to wait for

Each twinkleplop language is a function from code to HTML, ready as soon as its module is imported. Shiki's languages loaded with a promise, which is why my markdown pipeline had a step that listed every language a post used and awaited them before rendering, in the build and again in the CMS preview. That step, its types and the `await` in the preview all went away.

## The same class doesn't mean the same thing everywhere

My first try coloured 80 % of the characters the way Shiki had. The biggest gap was a class meaning different things in different languages: `property` is every `obj.name` in TypeScript, where I want it plain; `identifier` in CSS is a value word like `none`, which I want as a constant; in YAML it's a value, which reads best as a string.

So the code block's frame says which language it holds, `data-lang="ts"`, and a few rules depend on it:

```css
.prose .code-block {
	&:is([data-lang='ts'], [data-lang='js'], [data-lang='svelte']) .tok:is(.property, .constant) {
		color: var(--code-foreground);
	}
	&[data-lang='css'] .tok.identifier {
		color: var(--code-constant);
	}
}
```

## Compared before keeping it

I didn't want to judge it by looking at three posts. A small script read every code block of the old build and of the new one, character by character: the text and the colour each character ended up with.

- **No block's text changed** in 67 pages with code.
- **86.9 % of the 48,912 non-space characters keep their colour.** TypeScript 93 %, JavaScript 99.6 %, YAML 99.4 %, HTML 99.7 %, JSON 97 %.
- **Diffs got better**: Shiki with my theme left them grey; now added lines are green and removed ones red.
- **Some got worse**: bash has no command tokens (17.5 %), Svelte's grammar reads `<script lang="ts">` as JavaScript, and in a CSS fragment without a selector, functions like `oklch()` inside a custom property get the selector colour. That last one looks like a grammar bug worth reporting.

Colours are a matter of taste, the text isn't: knowing that nothing in the code changed was what let me accept the rest.

## Why it stayed

On its own, I wouldn't have switched for this. It came with a bigger change: I moved my posts back to [mdsvex](https://mdsvex.pngwn.at), which highlights with twinkleplop itself, so my own highlighting code and its eleven language packages went too. What I kept is the part I wanted: colours in CSS, where every other colour of the site already is.

## Links

- [twinkleplop's docs](https://twinkleplop.pngwn.at/docs)
- [Shiki](https://shiki.style), which did the job until now
