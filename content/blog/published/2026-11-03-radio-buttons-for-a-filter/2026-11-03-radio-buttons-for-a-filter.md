---
title: 'Radio buttons for a filter, styled with :has()'
date: 2026-11-03
tags: [svelte, css, accessibility]
description: My about page now filters skills by the kind of job I'm applying for. One choice at a time means radio buttons, and :has() lets me style them without giving up what the browser does for free.
cover: Cards passing through a filter, with radio buttons for category and date.
---

I apply for different kinds of jobs: web development, IT support, mainframe. My about page lists every skill I have, and for a support job, half of them are noise. So the page got a filter: `/about?profile=support` shows only the skills that matter for support, and that's a link I can send.

<!-- TODO: a screenshot of the page with one profile picked -->

## Toggles or radios?

My Awesome lists already have a filter: tag buttons with `aria-pressed`, where you can pick several tags at once ([how that one works](./2026-11-02-filters-in-a-svelte-class)). Here you pick one profile at a time, and the browser already has a control for exactly that:

```svelte
<fieldset>
	<legend>Show skills for</legend>
	{#each [{ id: undefined, name: 'Everything' }, ...data.profiles] as option (option.id)}
		<label>
			<input
				type="radio"
				name="profile"
				checked={profile === option.id}
				onchange={() => pick(option.id)}
			/>{option.name}
		</label>
	{/each}
</fieldset>
```

Same `name`, and the inputs become a group. What comes with it, without one line of JavaScript of mine:

- Tab enters the group once and leaves it once, instead of stopping on every option.
- The arrow keys move between options and pick them as they go.
- A screen reader says the group's name, then "radio button, 2 of 4".

<!-- TODO: what a screen reader actually said, moving through the group -->

## Hiding the circle, not the input

I didn't want the round radio, I wanted the chips the rest of the site uses. The tempting way is `display: none` on the input and style the label. But `display: none` takes the input out of the tab order and out of the accessibility tree: no focus, no arrow keys, nothing for a screen reader. So the input stays, invisible:

```css
input {
	position: absolute;
	opacity: 0;
	pointer-events: none;
}
```

The label is what you see, and `:has()` lets it look at the input inside it:

```css
label:has(:checked) {
	border-color: var(--brand);
	background-color: var(--brand);
	color: var(--surface-1);
}

/* The input has the focus, so the label shows it. */
label:has(:focus-visible) {
	outline: 2px solid var(--brand);
	outline-offset: 3px;
}
```

Before `:has()`, this needed the input right before the label, outside it, so CSS could reach the label with `input:checked + label`.

<!-- TODO: remove opacity: 0 in DevTools and describe what's under the labels -->

## One piece of state

The page keeps one value, the profile id, and computes everything else from it:

```ts
let profile = $state<string>();

let groups = $derived.by(() => {
	const id = profile;
	if (!id) return data.groups;
	return data.groups
		.map((group) => ({ ...group, skills: group.skills.filter((s) => s.profiles.includes(id)) }))
		.filter((group) => group.skills.length);
});
let sections = $derived(groups.map(({ id, name }) => ({ id, label: name })));
```

The side nav (`sections`) follows the groups, and the count follows both. I could have updated the nav by hand when a radio changes, but the profile also changes when the page reads it from the URL, and every place that changes it would have to remember the nav. With `$derived` there's nothing to remember.

The `const id = profile` is for TypeScript: it narrows `profile` to a string after the `if`, but not inside the `filter` callback, which could in theory run later. A `const` can't change, so the narrowing holds.

## Why the URL is read in `onMount`

The page is prerendered: built once into one `about.html`, which the server sends for `/about`, `/about?profile=web` and anything else. There is no query string at build time, so only the browser can read it:

```ts
onMount(() => {
	const id = page.url.searchParams.get('profile');
	profile = data.profiles.find((p) => p.id === id)?.id;
});
```

Only ids the data declares: `?profile=nope` shows everything rather than nothing. Without JavaScript, the page shows every skill and no filter, which is the right fallback: a filter that can't filter shouldn't be there.

<!-- TODO: was there a flash of every skill before the filter applied? Did it bother me? -->
