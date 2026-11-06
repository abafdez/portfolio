---
title: 'Store the changes, not the copy'
date: 2026-11-03
tags: [svelte, local-storage]
description: My CV builder lets me edit the skills for each job profile. Saving my changes to the list, instead of a copy of it, kept the site's data in charge, and one ??= taught me about Svelte's proxies.
---

My CV builder takes its skills from my site's data, a YAML file. For a real application I want to change them: leave one out of the mainframe CV, word another differently, add one that isn't on the site. Those edits are mine, so they live in the browser, like the rest of the form.

<!-- TODO: a screenshot of the editor with a skill unticked and one of my own -->

## Changes, not a copy

The easy way would be to copy the list into `localStorage` and edit the copy. But then the YAML stops mattering: a skill I add to the site next month never reaches the CV. So I store only what differs, per profile:

```ts
interface ProfileEdits {
	on: string[]; // switched on, though the YAML doesn't give this profile
	off: string[]; // switched off, though it does
	labels: Record<string, string>; // my wording, by skill name
	added: Record<string, { id: string; text: string }[]>; // my own, by group
	order: Record<string, string[]>; // my order, by group: skill names and my skills' ids
}
```

My own skills got an id when I added reordering: the order has to point at them, and their place in the list changes whenever one before them is removed.

Whether a skill is on the CV is computed every time:

```ts
included(skill: CvSkill, profile: string) {
	const { on, off } = this.get(profile);
	return on.includes(skill.name) || (skill.profiles.includes(profile) && !off.includes(skill.name));
}
```

Switching a skill back to what the YAML says removes it from both lists, so "Reset" is just forgetting the profile's changes.

<!-- TODO: open DevTools → Application → Local Storage and paste what my edits look like -->

## The ??= that didn't work

The first time I change a profile, its edits object has to be created:

```ts
(this.all[profile] ??= { on: [], off: [], labels: {}, added: {}, order: {} }).off.push(name);
```

That looks right, but it wouldn't update the page. `this.all` is `$state`, a deep proxy: the object I assign is wrapped in a new proxy when it's stored. But `a ??= b` evaluates to `b`, the plain object I passed in, not the proxy. Pushing to the plain object changes the data without telling Svelte. The fix is to read it back:

```ts
this.all[profile] ??= empty();
return this.all[profile];
```

<!-- TODO: did I understand why before reading this? Try the broken version in the playground -->

## A checkbox bound to a computation

"Is this skill on the CV" isn't a variable, it's the YAML plus my changes. A function binding lets the checkbox read and write it anyway:

```svelte
<input
	type="checkbox"
	bind:checked={
		() => edits.included(skill, profile.id), (value) => edits.include(skill, profile.id, value)
	}
/>
```
