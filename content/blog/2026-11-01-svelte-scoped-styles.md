---
title: 'How Svelte scopes styles, read from the compiler output'
date: 2026-11-01
tags: [svelte, css]
draft: true
description: What the Svelte compiler does to a component's style block, why a page's styles couldn't reach my rendered markdown, and when :global() or a global class is the right fix.
---

When I rendered my Bitácora entries with mdsvex, the page's own styles didn't reach the text of the entry. An `h2` rule in the page's `<style>` didn't style the entry's headings, and the compiler warned that it was unused. Scoped styles felt like magic to me, so I compiled a tiny component and read what came out. It's three plain steps.

## The experiment

A page that renders another component inside a div, with four rules:

```svelte
<script>
	import Body from './Body.svelte';
</script>

<div class="prose"><Body /></div>
<p class="intro">Hi</p>

<style>
	.intro {
		color: green;
	}
	h2 {
		color: red;
	}
	.prose :global(h2) {
		margin-top: 2rem;
	}
	.prose p {
		color: blue;
	}
</style>
```

The compiler gives back this markup:

```html
<div class="prose svelte-70xyc3"><!----></div>
<p class="intro svelte-70xyc3">Hi</p>
```

And this CSS:

```css
.intro.svelte-70xyc3 {
	color: green;
}
/* (unused) h2 { color: red; }*/
.prose.svelte-70xyc3 h2 {
	margin-top: 2rem;
}
/* (unused) .prose p { color: blue; }*/
```

Plus two warnings: `Unused CSS selector "h2"` and `Unused CSS selector ".prose p"`.

<!-- TODO: try it yourself in the Svelte playground and say what surprised me -->

## Step 1: a class on the elements

Every element written in the component's markup gets an extra class, `svelte-70xyc3`. That's the whole trick: a class name nobody else uses. The `<div>` and the `<p>` get it. What `<Body />` renders doesn't: those elements are written in `Body.svelte`, so they get `Body`'s class.

The name is a hash of the component's file path. Every compile of the same file gives the same class, and a different file gives a different one, even with the same CSS.

## Step 2: the class on the selectors

Every selector gets the same class: `.intro` becomes `.intro.svelte-70xyc3`. Now it only matches elements from this component. A `.intro` in another component has another class, so it doesn't match.

## Step 3: unused rules are removed

The compiler can see the whole markup, so it knows which selectors can match something in it. The others are commented out of the output, with a warning:

- `h2` is unused because there's no `<h2>` in this component's markup. The headings come from `Body`.
- `.prose p` is unused because the `<p>` in the markup isn't inside `.prose`.

The warning is helpful. It told me the rule couldn't work before I spent time wondering why my headings looked wrong.

## Where the boundary is

The rule is **where the element is written**, not where it ends up on the page. That has a surprising side. Content you pass to a child component as children is written in your markup, so it gets your class:

```svelte
<Card><p class="note">hi</p></Card>

<style>
	.note {
		color: red;
	}
</style>
```

```html
<p class="note svelte-70xyc3">hi</p>
```

The `<p>` is displayed inside `Card`, but this component's `.note` rule still styles it.

## Leaving scope: :global()

`:global(...)` tells the compiler not to add the class to that part of a selector. In `.prose :global(h2)`, the output is `.prose.svelte-70xyc3 h2`:

- `.prose` keeps the class, so the rule only applies inside this component's `.prose` div.
- `h2` doesn't, so it matches the headings `Body` renders.

So it's only half global. On another page, even one with a `.prose` div, the div has that page's class, and the rule doesn't match. A fully global rule is `:global(body) { … }`, which comes out as plain `body { … }`.

Keyframes are scoped too: `@keyframes pop` comes out as `svelte-70xyc3-pop`, so two components can both have a `pop` animation.

## Specificity

The class adds specificity, but only once per selector. `.tags li` becomes:

```css
.tags.svelte-1lj1c2h li:where(.svelte-1lj1c2h) { … }
```

`:where()` adds no specificity, so the selector goes up by one class, not two. That helps a global rule still win when it needs to.

In this site, specificity rarely decides anything anyway. My global styles are in cascade layers, and component styles are outside any layer, so a component's style wins no matter how specific the global one is.

## Which one I used

The markdown for a Bitácora entry comes from another component, and the blog will need the same styles. So I didn't use `:global()` in the page. I made a global `.prose` class in the `components` layer of `global.css`. Any page can put it on the div around its markdown.

<!-- TODO: when I'd pick :global() in a component instead of a global class -->

## Links

- [Svelte: scoped styles](https://svelte.dev/docs/svelte/scoped-styles)
- [Svelte: global styles](https://svelte.dev/docs/svelte/global-styles)
- [MDN: :where()](https://developer.mozilla.org/docs/Web/CSS/:where)
- [Svelte playground](https://svelte.dev/playground) (the CSS output tab shows all of this)
