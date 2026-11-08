---
title: 'Tag pages on a static SvelteKit blog'
date: 2026-11-02
tags: [sveltekit, blog, accessibility]
description: One prerendered page per tag, a list of tags built from the posts, and a build that fails on a bad tag.
cover: A document with multiple tags going into folders.
---

Every post on my blog has tags in its frontmatter. I wanted each one to be a link to a page that lists the posts with that tag. The site is static, so every tag page has to exist as a file after the build.

## Where the tags come from

My `content.ts` already reads every post's frontmatter, and the tags come with it. Each post knows its own tags. What I needed was the list of all of them, once:

```ts
export const postTags = [...new Set(allPosts.flatMap((post) => post.tags ?? []))].sort();

export function postsTagged(tag: string): Entry<PostMeta>[] {
	return allPosts.filter((post) => post.tags?.includes(tag));
}
```

`flatMap` makes one long list of every tag of every post, `Set` keeps each one once, and `sort` puts them A to Z. This can't happen inside the `.map()` that reads each file: that one sees one file at a time.

`allPosts` has no drafts in a build (they're [left out on purpose](./2026-11-02-drafts-that-never-ship)). So a tag that only drafts use gets no page, and I didn't write a line for that.

## One page per tag

The route is `src/routes/blog/tags/[tag]/`. SvelteKit can't guess which tags exist, so `entries()` tells it which pages to prerender:

```ts
export const entries: EntryGenerator = () => postTags.map((tag) => ({ tag }));

export const load: PageServerLoad = ({ params }) => {
	const posts = postsTagged(params.tag);
	if (!posts.length) error(404, 'No posts with that tag');
	return { tag: params.tag, posts };
};
```

While every post was a draft, a build had no tags, so the route had no pages and nothing linked to it. SvelteKit's crawler reports a route like that as "unseen" and fails the build. I made an exception for it in `handleUnseenRoutes`. Once a post is published, its card links to its tags, so their pages can't go unseen.

<!-- TODO: the "unseen routes" error I got, if I saw it -->

## Links only where a page exists

The same tag list shows up on blog cards, the post header, and the Devlog. The Devlog's tags have no pages. A tag like `planning` is only used there, and a link to `/blog/tags/planning` would be a 404.

So the list component doesn't build links itself. It takes a function that turns a tag into a link, and without one the tags stay plain text:

```svelte
<script lang="ts">
	import type { ResolvedPathname } from '$app/types';

	interface Props {
		tags: string[];
		tagHref?: (tag: string) => ResolvedPathname;
	}

	let { tags, tagHref }: Props = $props();
</script>

<ul aria-label="Tags">
	{#each tags as tag (tag)}
		<li>
			{#if tagHref}
				<a href={tagHref(tag)}>#{tag}</a>
			{:else}
				#{tag}
			{/if}
		</li>
	{/each}
</ul>
```

Blog pages pass `blogTag`, a one-line helper around `resolve('/blog/tags/[tag]', { tag })`. The Devlog passes nothing. The component never needs to know which routes exist.

**Update:** the Devlog has tag pages now too, at `/devlog/tags/[tag]`, so it passes `devlogTag`. On an Awesome list, a link's tags filter the list instead: `tagHref` gives `?tag=css`, and an `onTag` function filters in place when it's clicked.

## A bad tag fails the build

Each tag becomes part of a URL. `CSS` and `css` would be two tags in the index but one page, and `design tokens` would be a URL with `%20` in it. I could fix tags quietly (lowercase them, swap spaces for hyphens), but then every place that uses a tag has to fix it the same way: the list, the filter, the link, the label.

Instead there's one rule, checked while the site builds:

```ts
const kebabCase = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function checkTags(path: string, tags: string[] = []) {
	const bad = tags.filter((tag) => !kebabCase.test(tag));
	if (bad.length) throw new Error(`${path}: tags must be lowercase kebab-case: ${bad.join(', ')}`);
}
```

A tag that breaks it stops the build and names the file. I'm the only one writing these posts, so the fix is always to edit one word in one file.

## Two accessibility fixes

- **Target size.** Tags are small links in a list, not in a sentence, so WCAG asks for at least 24 by 24 pixels. A bit of `padding-block` makes them 26px tall.
- **Heading order.** Lighthouse gave the first version of the tag page 98: it went from the `h1` straight to the cards' `h3`s. Grouping the posts by year, like `/blog` does, puts an `h2` in between.

<!-- TODO: a screenshot of the tag index on /blog -->
