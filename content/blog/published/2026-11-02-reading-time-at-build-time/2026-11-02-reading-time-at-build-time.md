---
title: 'Reading time, counted once while the site builds'
date: 2026-11-02
tags: [sveltekit, vite, content]
description: Where to compute a post's reading time in SvelteKit, and why the answer is "where the text already is".
cover: A clock and a document.
---

Every post and Devlog entry on my site now says how long it takes to read: `· 6 min read`, next to the date. The code is one small function. The interesting part was where to put it.

## The function

```ts
function readingTime(text: string): number {
	const words = text.replace(frontmatter, '').match(/\S+/g)?.length ?? 0;
	return Math.max(1, Math.ceil(words / 200));
}
```

It removes the frontmatter, counts everything between spaces as a word, and divides by 200 words a minute. Studies put silent reading of non-fiction at about 238 words a minute. Mine are technical posts full of code, so I went a bit lower.

## Who has the text

My site reads each markdown file in two ways.

`content.ts` reads every file as plain text, with a `?raw` glob, to get its frontmatter. It only runs in `+page.server.ts` files, so only while the site builds:

```ts
const posts = import.meta.glob<string>('/content/blog/published/*/*.md', {
	eager: true,
	query: '?raw',
	import: 'default'
});
```

The post page imports one file as a compiled component, which mdsvex and Svelte turned into JavaScript. It has no words left to count, only code that builds HTML. The layout around it gets the content as a snippet to render, not as text either.

So `content.ts` is the only place that has every file's text, all at once.

## Who needs the number

The post page shows it, but so does every card on `/blog`, `/bitacora` and the home page. If the post page computed it, the list would have to load every post's body just to count words, and it would still have components, not text.

Computed in `content.ts`, `minutes` is part of each entry, next to the title and the date:

```ts
const entry = {
	...(parse(text.match(frontmatter)?.[1] ?? '') as T),
	slug: path.split('/').at(-1)!.replace(/\.md$/, ''),
	minutes: readingTime(text)
};
```

Every page gets it as data. The pages are prerendered, so it ends up in the HTML and in a few bytes of `__data.json`. No markdown reaches the browser to get it.

## The rule

Compute a value where its input already is, and pass it on as data. The slug and the draft flag come from the path, and the reading time from the text, so all of them live in `content.ts`. The tags are already there too: they're part of the frontmatter.

There's a side effect too. Counting the raw markdown means HTML tags and the `<span>`s of highlighted code are never counted as words.
