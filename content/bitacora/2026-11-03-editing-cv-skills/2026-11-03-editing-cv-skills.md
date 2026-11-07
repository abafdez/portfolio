---
title: Editing the CV's skills, per profile
date: 2026-11-03
phase: 5.5
tags: [svelte, runes, forms, local-storage]
---

## What we did

- A "Skills" section in the CV builder: every group as a `<details>` (closed), every skill of every profile with a checkbox ("on the CV") and its wording in a text field, then my own skills with Add and Remove, and "Reset the skills for `<profile>`".
- The changes are per profile (the mainframe CV can leave out what the web CV keeps), in `SkillEdits` (`edits.svelte.ts`), saved to their own `localStorage` key, `cv-builder-skills`.
- They're stored as changes to the YAML, not a copy of it: `on` and `off` (skill names that differ from the YAML), `labels` (my wording), `added` (mine, by group). A skill added to the YAML later still shows up, and Reset just forgets the changes. Switching a skill back to what the YAML says removes it from `on`/`off`.
- Export puts the edits in the file under `skills`, and import reads them back.
- `storage.ts`: `loadJson`/`saveJson` and the checks (`isObject`, `strings`, `stringRecord`), shared by both classes. Skills carry their YAML `name` as a stable key.

## What I learned

- `a ??= b` evaluates to `b`, the plain object I passed in, not the `$state` proxy it became. Changes made through the plain object aren't seen. So: `this.all[profile] ??= {…}`, then read `this.all[profile]` back.
- Reading must never write: the page calls `get(profile)` while it renders, so it returns a shared empty object for a profile with no changes; only the write methods create one.
- Function bindings (`bind:checked={() => get, (v) => set}`) let a checkbox read and write something computed, here "is it on the CV", which is the YAML plus my changes.
- `isObject(x): x is Record<string, unknown>` is a type guard: after the `if`, TypeScript knows the type. `filter((entry): entry is [string, string] => …)` does the same for `filter`.
- Focus after Add goes to the new field (after `tick()`, once it's on the page); after Remove, to "Add a skill" nearby, not `<body>`.
- `:checkbox` is jQuery, not CSS. `[type='checkbox']` it is.

## Links

- [Svelte: function bindings](https://svelte.dev/docs/svelte/bind#Function-bindings)
- [Svelte: tick](https://svelte.dev/docs/svelte/lifecycle-hooks#tick)
- [MDN: logical nullish assignment (??=)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing_assignment)
- [TypeScript: type predicates](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates)
- [MDN: accent-color](https://developer.mozilla.org/en-US/docs/Web/CSS/accent-color)

## Next

- Use it for real: edit the skills for each profile and print the three CVs. Then the Phase 5.5 PR.
