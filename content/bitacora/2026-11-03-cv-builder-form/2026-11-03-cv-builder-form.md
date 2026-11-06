---
title: A CV builder whose form remembers
date: 2026-11-03
phase: 5.5
tags: [svelte, sveltekit, forms, local-storage]
---

## What we did

- `/projects/cv`: pick a profile, fill in name, surnames, phone, email, city, state, postal code and a short letter, and a CV next to the form follows: name, profile, contact line, Summary (the letter), then the profile's skills by group, strongest first.
- The skills come from `content/skills.yaml`, cut down on the server (`src/lib/projects/cv/skills.server.ts`): names and profiles only. A skill without a level prints its note's first sentence: "Spanish (Native)".
- The CV builder has its own route, `src/routes/projects/cv/`, with a `+page.server.ts`. `projects.ts`' `tool` is optional now, `[tool]`'s `entries()` skips tools without one, and the page header is `ProjectHeader.svelte`, shared by both routes.
- My details live in `CvDetails` (`details.svelte.ts`), a `$state` class kept in `localStorage`. Nothing reaches the repo, the build or a server.

## What I learned

- SvelteKit prefers a fixed route over a `[param]` one, so `/projects/cv` beats `/projects/[tool]`. A route of its own gets server data with its exact type, instead of an optional prop on every tool.
- One `$state` object for the whole form: it's a deep proxy, so `bind:value={cv.values.name}` works and `JSON.stringify` sees every field. Separate `$state` fields on a class are getters on the prototype, and `JSON.stringify` would give `{}`.
- `localStorage` is read in `onMount`: it doesn't exist while prerendering, and loading before hydration would make the first render differ from the HTML.
- `read(data: unknown)` keeps only known fields, only strings, only a profile that exists. Storage belongs to the origin (`abafdez.github.io`, shared by all my Pages projects), so it can hold anything.
- Saving is an `$effect`: keeping something outside Svelte in step with the state. `save()` reads every field, so any change reruns it. The `if (cv.loaded)` guard stops the empty form overwriting what was saved, whatever order the effects run in.
- `autocomplete` values (`given-name`, `tel`, `postal-code`…) let the browser fill the form. A form without an `action` "submits" its fields into the URL, so `onsubmit` prevents it. A disabled `<fieldset>` disables every field in it.

## Problems & fixes

- Changing the profile saved the previous one. The form saved on `oninput`, but a `<select>` fires `input` before `change`, and Svelte updates `bind:value` on a select at `change`. The `$effect` doesn't depend on event order.
- The first test showed 14 errors: a preview server from before the rebuild was still on port 4173, serving the old file list. Restart the preview after every build.

## Links

- [Svelte: `$effect`](https://svelte.dev/docs/svelte/$effect)
- [Svelte: `$state` (deep state)](https://svelte.dev/docs/svelte/$state#Deep-state)
- [SvelteKit: route sorting](https://svelte.dev/docs/kit/advanced-routing#Sorting)
- [MDN: localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [MDN: autocomplete](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete)

## Next

- Print: a button and a print stylesheet for an ATS-friendly PDF. Then native form validation, editing the skills, and JSON import/export.
