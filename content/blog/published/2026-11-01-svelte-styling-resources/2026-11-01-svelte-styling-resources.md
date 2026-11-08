---
title: 'Learning Svelte styling: the resources I am using'
date: 2026-11-01
tags: [svelte, css, resources]
description: Where to learn how Svelte styles components, from the official tutorial to videos, plus the playground experiments that finally made scoped styles click for me.
cover: The Svelte logo surrounded by CSS snippets, design tokens and a paintbrush.
---

Svelte's scoped styles confused me for a while. Why did a rule in my page not reach a component inside it? Why did a rule for something I passed into a card still apply? I wrote down [how scoping works](./2026-11-01-svelte-scoped-styles), and this is the list of what I'm using to learn it properly.

Scoping works the same way since Svelte 3, so older material still applies. The one change in Svelte 5 is specificity: the extra parts of a scoped selector are wrapped in `:where()`, so they add nothing.

<!-- TODO: my verdict on each one after going through it -->

## Start here

- **[Svelte tutorial: Styling](https://svelte.dev/tutorial/svelte/styling).** The official interactive tutorial. Every step is a small editor with a result next to it, and the lessons that follow cover `:global`, the `class` attribute and passing styles to components.
- **[Svelte docs: Scoped styles](https://svelte.dev/docs/svelte/scoped-styles)** and **[Global styles](https://svelte.dev/docs/svelte/global-styles).** Short reference pages: what the compiler does, specificity, `:global(…)` and the `:global { … }` block.
- **[Svelte docs: Custom properties](https://svelte.dev/docs/svelte/custom-properties).** Passing values like `--accent="red"` to a component, and the wrapper element that holds them.

## A course

<!-- TODO: check whether the course is free (the page answered 402 to a script) -->

- **[Joy of Code: The Complete Svelte 5 Course](https://joyofcode.xyz/learn-svelte).** Written, not a video, and up to date with Svelte 5. Its styling part covers scoped styles, `:global`, the nested `:global { … }` block, and `article :global { … }` to style everything inside one element.

## Videos

- **["Styling in Svelte"](https://m.youtube.com/watch?v=etUliqGJAaY).** Scoped CSS first, then `:global` to opt out.
- **["Scoped Styles In Svelte With The Style Tag"](https://www.youtube.com/watch?v=KVogcmGsf9I).** A general introduction to the `<style>` block.
- **["Svelte - Global CSS"](https://www.youtube.com/watch?v=v7s6pb0jrhI).** Short, only about `:global`.
- **["Master Styling In Svelte 5"](https://m.youtube.com/watch?v=EfpJDs4MdXo).** Longer, and Svelte 5 specific.

<!-- TODO: which video was worth it -->

## Try it yourself

What made it click was the [Svelte playground](https://svelte.dev/playground). It compiles as you type, and the **CSS output** and **JS output** tabs show exactly what the compiler did. Three experiments:

1. **Where the class goes.** A page with a `<p>` and a child component that renders an `<h2>`. Add a rule for each in the page's `<style>`. The `h2` rule is marked `(unused)`: the heading is written in the child, so it never gets the page's class.
2. **Children belong to the parent.** Pass `<span class="new">` into a card as children. A `.new` rule in the page styles it, even though it shows up inside the card. Move the rule into the card and it stops working.
3. **Custom properties.** Render the same card with `--accent="red"` and `--accent="blue"`, and have the card use `var(--accent, orange)`. Inspect the result: both cards have the same scoped class, and each sits in a `<svelte-css-wrapper style="display: contents; --accent: …">`. Scoping decides which elements a rule matches; the custom property only changes a value it uses.

<!-- TODO: what surprised me in each experiment -->

## Related, not Svelte-specific

- **[MDN: :where()](https://developer.mozilla.org/docs/Web/CSS/:where).** Why the extra scoped classes add no specificity.
- **[MDN: @layer](https://developer.mozilla.org/docs/Web/CSS/@layer).** In my site, global styles live in cascade layers and component styles don't, so a component's style always wins. That matters more than specificity.
- **[MDN: Using CSS custom properties](https://developer.mozilla.org/docs/Web/CSS/Using_CSS_custom_properties).** How the values inherit through the wrapper.
