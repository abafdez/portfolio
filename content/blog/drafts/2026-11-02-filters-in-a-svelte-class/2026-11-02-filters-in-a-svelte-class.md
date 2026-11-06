---
title: 'Search and tag filters in a Svelte class, saved in the URL'
date: 2026-11-02
tags: [svelte, sveltekit, accessibility]
description: A $state class for an Awesome list's filters, $derived results, and a URL you can share, on a page that's prerendered.
---

My site has Awesome lists: curated links in categories, each with a description and tags. Twenty-five links is already too many to scan, so I wanted a search box and tag filters. And if I filter the list down to something useful, I want to send that view as a link.

## The data: YAML, not markdown

A list is data (a title, a URL, a description, some tags), not prose. So each list is a YAML file in `content/awesome/`, read at build time:

```yaml
title: Modern CSS
categories:
  - name: Color
    links:
      - title: oklch.com
        url: https://oklch.com
        description: Pick OKLCH colors and see which ones fit in sRGB and P3.
        tags: [tool, oklch]
```

The loader fails the build on a link that isn't `https://` or a tag that isn't kebab-case, and names the file. The tags end up in URLs, so `CSS` and `css` must not both exist.

## The filter is a class

In Svelte 5, runes work in classes too (in a `.svelte.ts` file). That keeps the state, what's computed from it and the ways to change it in one place:

```ts
export class LinkFilter {
	query = $state('');
	tags: string[] = $state([]);

	#categories: () => Category[];

	constructor(categories: () => Category[]) {
		this.#categories = categories;
	}

	results = $derived.by(() => {
		const words = this.query.toLowerCase().split(/\s+/).filter(Boolean);
		return this.#categories()
			.map((category) => ({
				...category,
				links: category.links.filter((link) => {
					const text = [link.title, link.description, ...link.tags].join(' ').toLowerCase();
					return (
						words.every((word) => text.includes(word)) &&
						this.tags.every((tag) => link.tags.includes(tag))
					);
				})
			}))
			.filter((category) => category.links.length);
	});

	toggle(tag: string) {
		this.tags = this.tags.includes(tag) ? this.tags.filter((t) => t !== tag) : [...this.tags, tag];
	}
}
```

Two details I had to think about:

- **The categories come in as a function.** If the class got the array itself, it would keep the first list it was given. With a function, `results` reads the current list every time.
- **`$derived` is lazy.** `results` is only recomputed when something reads it and the query, the tags or the list changed.

Every word must match, and every picked tag must match. Each thing you add narrows the list.

<!-- TODO: did AND feel right when I used it, or would I rather have tags as OR? -->

## Into the URL and back

The filter turns itself into params (`?q=grid&tag=docs&tag=layout`) and reads them back. The page is prerendered, though, and at build time there's no visitor URL to read. So the component reads it in `onMount`, which only runs in the browser:

```svelte
<script lang="ts">
	const filter = new LinkFilter(() => list.categories);
	let ready = $state(false);

	onMount(() => {
		filter.read(page.url.searchParams, list.tags);
		ready = true;
	});

	function share() {
		const url = new URL(page.url.href);
		url.search = filter.params.toString();
		goto(url, { shallow: true, replace: true });
	}
</script>
```

`shallow` changes the address bar without a navigation. `replace` keeps it to one history entry, so typing a word doesn't leave a Back step for every letter.

`read()` only keeps tags the list really has. Otherwise a link with `?tag=typo` would hide every link behind a button that isn't there.

To update the URL right where the search text changes, I used a function binding: a getter and a setter instead of a variable.

```svelte
<input
	type="search"
	bind:value={() => filter.query, (value) => ((filter.query = value), share())}
/>
```

## Without JavaScript

Without JS, the filters would be a search box and buttons that do nothing. The prerendered page already has every link, so nothing is lost by hiding them.

My first version didn't render them at all until `onMount` had run (`{#if ready}`). Lighthouse caught the problem: when they appeared, they pushed the whole list down, a **layout shift** (CLS 0.16, enough to drop the page under 90). Now they're in the prerendered HTML, but invisible until JS is ready, and gone entirely when scripting is off:

```css
search:not(.ready) {
	visibility: hidden;
}

@media (scripting: none) {
	search {
		display: none;
	}
}
```

`visibility: hidden` keeps an element's space but hides it from the eye, the keyboard and screen readers. `display: none` removes the space too. The class comes from `<search class:ready>`, set in `onMount`.

## Small accessibility details

- The tag buttons are toggles: `aria-pressed` makes screen readers say "pressed", and the fill shows it for everyone else.
- The count ("3 of 25 links") is a `role="status"`, so it's announced when it changes.
- "Clear filters" disappears once there's nothing to clear, and focus fell to the top of the page with it. Clearing now moves focus to the search box.

<!-- TODO: what a screen reader said when I toggled a tag and typed a search -->
