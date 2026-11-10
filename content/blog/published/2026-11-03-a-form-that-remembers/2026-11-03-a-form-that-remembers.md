---
title: A form that remembers, with a $state class and localStorage
date: 2026-11-03
tags: [svelte, forms, local-storage]
description: My CV builder keeps what I type in the browser, never on a server. One $state object, an $effect to save it, and a select that taught me events don't always arrive in the order I think.
cover: A curriculum with arrows to forms.
---

I'm building a tool on this site that makes a CV for each kind of job I apply for. The skills come from the site's own data. The personal part (name, phone, email, where I live, a short letter) can't go in the repo or the build: this is a public site. So it's typed into a form and stays in the browser, in `localStorage`.

## One object, not one state per field

The form's values live in a class, as one `$state` object:

```ts
export class CvDetails {
	values: Details;
	loaded = $state(false);

	constructor(profiles: string[]) {
		const empty = Object.fromEntries(fields.map((field) => [field, ''])) as Details;
		this.values = $state({ ...empty, profile: profiles[0] });
	}
}
```

A `$state` object is a deep proxy, so every input can bind straight to it (`bind:value={cv.values.name}`), and `JSON.stringify(cv.values)` gives every field. If each field were its own `$state` on the class, Svelte would turn them into getters and setters on the prototype, and `JSON.stringify` doesn't look there: it would give `{}`.

## Loading: in the browser, after hydration

```ts
onMount(() => cv.load());
```

Not in the constructor. The page is prerendered at build time, where `localStorage` doesn't exist. And in the browser, the first render has to match the prerendered HTML; `onMount` runs after that.

What `load()` reads goes through `read(data: unknown)`, which keeps only the fields it knows, only strings, and only a profile that still exists. It's my own data, but `localStorage` belongs to the origin, and every project I publish on `abafdez.github.io` shares it.

## Saving: the bug that made it an $effect

My first version saved from the form:

```svelte
<form oninput={() => cv.save()}>
```

Input events bubble, so one handler covered every field. Typing worked. Changing the profile in the `<select>` saved the profile I'd had _before_. A select fires `input` and then `change`, and Svelte updates `bind:value` on a select at `change`. My save ran in between.

Saving to `localStorage` is keeping something outside Svelte in step with the state, which is what `$effect` is for:

```ts
$effect(() => {
	if (cv.loaded) cv.save();
});
```

`save()` stringifies every field, so the effect depends on all of them and runs again whenever any changes, whatever event changed it. The `if (cv.loaded)` matters: without it, an effect that ran before `load()` would save the empty form over what I had.

## Small things the form does

- `autocomplete="given-name"`, `"tel"`, `"postal-code"`: the browser offers to fill them in.
- `type="email"`, `type="tel"`, `inputmode="numeric"`: the right keyboard on a phone.
- `onsubmit={(event) => event.preventDefault()}`: a form without an `action` sends its fields to the same page as `?name=…&phone=…`. For personal data, that's the address bar and the browser history.
- `<fieldset disabled={!cv.loaded}>`: nothing can be typed before the saved values are in, and without JavaScript, the form stays disabled.
