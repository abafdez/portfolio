---
title: How Svelte scopes styles
date: 2026-11-01
phase: 6
tags: [svelte, css]
---

## What we did

- Found out why the entry page's styles couldn't reach the rendered markdown, and fixed it with a global `.prose` class.
- Compiled tiny components with the Svelte compiler and in the playground to read what it does to a `<style>` block.
- Wrote two draft posts: how scoping works, and the resources I'm using to learn it.

## What I learned

- The compiler adds a class (`svelte-<hash>`) to every element written in a component's markup, and the same class to every selector. The hash comes from the file's path: one per file, never one per instance.
- What decides it is where an element is written, not where it ends up. A child component's elements get the child's class. Children I pass into a component are written in my file, so they get my class and my rules style them.
- Selectors that can't match anything in the markup are removed, with an "Unused CSS selector" warning. An `h2` rule in a page doesn't style the headings a child renders.
- `:global(h2)` skips the class for that part only: `.prose :global(h2)` becomes `.prose.svelte-x h2`, still tied to this file's `.prose`.
- Specificity goes up by one class: further parts get the class inside `:where()`. Keyframes are renamed per component.
- `--accent="red"` on a component doesn't create a class. Svelte wraps the component in `<svelte-css-wrapper style="display: contents; --accent: red">`; the scoped rule reads the value with `var()`, and it inherits to everything inside the wrapper.
- Scoping decides which elements a rule matches (compile time). Custom properties decide the values it uses (per instance, at runtime).

## Links

- [Svelte docs: Scoped styles](https://svelte.dev/docs/svelte/scoped-styles)
- [Svelte docs: Global styles](https://svelte.dev/docs/svelte/global-styles)
- [Svelte docs: Custom properties](https://svelte.dev/docs/svelte/custom-properties)
- [Svelte tutorial: Styling](https://svelte.dev/tutorial/svelte/styling)

## Next

- Go through the resources in the styling post and add my verdicts.
