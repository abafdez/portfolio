---
title: A CV form that folds away, and skills I can reorder
date: 2026-11-03
phase: 5.5
tags: [html, svelte, accessibility, forms]
---

## What we did

- "About you" and "Skills" are `<details name="cv-form">`: an accordion, so opening one closes the other. Closed, each says how it's doing ("4 required fields left", "2 fields to fix", my name; "56 on the CV"). The profile and the "Your CV" buttons stay visible.
- The skill groups inside Skills are an accordion too (`name="cv-skill-groups"`).
- Every skill row has ↑ ↓ (my own skills too, plus ✕). The order is per profile, in `order` by group (skill names and my skills' ids); anything not in it, like a skill new to the YAML, goes last. The editor and the CV read the same `items()`, so they can't disagree.
- My own skills now have an id (`crypto.randomUUID()`). Skills saved the old way, as plain strings, still load.
- Print opens "About you" before focusing a field that needs fixing.
- Each skill group is a panel on `--surface-1` with a border, so it stands off the blueprint grid; each skill row is a `--surface-2` strip, and the text fields in it go back to `--surface-1` so they still read as fields (Alfonso's idea: the groups were hard to read).
- The "Your CV" buttons (print, export, import) moved out of the form to sit over the live CV they act on. A `<fieldset>` works outside a form too, so it still disables them until the data is loaded; print hides it with the form.
- One `.visually-hidden` in `global.css` instead of four copies (`Skill`, `SkillWindow`, `SkillEditor`, now `Cv`).

## What I learned

- `<details>` with the same `name` is an exclusive accordion, in HTML, no JS. A field inside a closed `<details>` can't take the focus, so open it first (`details.open = true`).
- `display: flex` on a `<summary>` hides its marker (the marker belongs to `display: list-item`), so I draw one with `::before`.
- A keyed `{#each}` moves the `<li>` instead of rewriting it, and `animate:flip` slides it there. `prefersReducedMotion` from `svelte/motion` sets the duration to 0 when asked.
- Moving an element in the DOM takes the focus away from what's inside it, so the move puts it back on the same arrow, or on the other one once the row is at the top or the bottom (a disabled button can't take the focus).
- The list moves silently for a screen reader: a visually hidden `role="status"` says "Python: 5 of 7 in Languages."
- Up/down buttons over drag and drop: native drag and drop doesn't work on touch and isn't usable from the keyboard, so the buttons would have to be there anyway.
- A test that reads the page right after `reload()` can beat hydration: wait for something only JS changes (here the fieldsets losing `disabled`).

## Links

- [MDN: details name (exclusive accordion)](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details#name)
- [Svelte: animate:flip](https://svelte.dev/docs/svelte/animate)
- [Svelte: prefersReducedMotion](https://svelte.dev/docs/svelte/svelte-motion#prefersReducedMotion)
- [MDN: crypto.randomUUID()](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID)

## Next

- Edit and print the three CVs for real, then the Phase 5.5 PR.
