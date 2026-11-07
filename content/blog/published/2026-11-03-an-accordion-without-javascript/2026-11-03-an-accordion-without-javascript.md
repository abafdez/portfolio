---
title: 'An accordion without JavaScript'
date: 2026-11-03
tags: [html, accessibility]
description: Give several <details> elements the same name, and opening one closes the others. My CV builder's form folds away with it, with one catch about focus.
cover: An element that expands and colapse into an accordion.
---

My CV builder's form got long: my details, then ten groups of skills. Once I've filled something in, I want it out of the way. The browser has had collapsible sections for years, `<details>` and `<summary>`. What's newer is that they can be an accordion:

```html
<details name="cv-form" open>
	<summary>About you</summary>
	…
</details>
<details name="cv-form">
	<summary>Skills</summary>
	…
</details>
```

Same `name`, and opening one closes the others. No JavaScript, no `aria-expanded` to keep in sync: the browser tells screen readers whether each one is open.

<!-- TODO: a short recording of the sections opening and closing -->

## A summary that says how it's doing

A closed section shouldn't hide that something's wrong in it. Each summary carries a status, computed from the form:

```svelte
<summary>About you <span class="note">{aboutStatus}</span></summary>
```

"4 required fields left", then "2 fields to fix" once I've been through them, then just my name.

## The catch: focus

Before printing, the form checks every field and moves the focus to the first one with a problem. If that field is inside a closed `<details>`, `focus()` does nothing: hidden content can't take the focus. So the section opens first:

```ts
function reveal(field: HTMLElement) {
	const section = field.closest('details');
	if (section) section.open = true;
	field.focus();
}
```

Opening it through `open` respects the accordion too: the other section closes.

<!-- TODO: try it with a screen reader: what does it say on a summary, open and closed? -->

## One more: the marker

I made the summary a flex row, to put the status next to the title. That takes the little triangle away: the marker belongs to `display: list-item`, which is what `<summary>` is by default. So with `display: flex` I draw my own:

```css
summary::before {
	content: '▸';
}

details[open] > summary::before {
	content: '▾';
}
```

<!-- TODO: which browsers support name on details today? Check and add a line -->
