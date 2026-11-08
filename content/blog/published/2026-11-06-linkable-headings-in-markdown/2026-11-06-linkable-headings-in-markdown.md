---
title: 'Linkable headings in markdown, and a build that checks them'
date: 2026-11-06
tags: [markdown, accessibility, sveltekit]
description: Two rehype plugins give every heading in my posts an id and a link to itself. Why I wrap the heading instead of adding a "#" link, and how SvelteKit fails the build on a broken one.
cover: A heading with a hash sign and an anchor linking to a list of sections.
---

I wanted to link to a section of a post: "see the part about the base path", straight to it. That needs an `id` on the heading, and my markdown headings had none. `## The base path` became a plain `<h2>The base path</h2>`.

## Two plugins

My markdown goes through mdsvex, which can run [rehype](https://github.com/rehypejs/rehype) plugins on the HTML it makes. Two do this job:

- [`rehype-slug`](https://github.com/rehypejs/rehype-slug) gives every heading an `id` made from its text: lowercase, spaces become hyphens, punctuation goes. A second heading with the same text gets `-1`.
- [`rehype-autolink-headings`](https://github.com/rehypejs/rehype-autolink-headings) adds a link to that `id`.

```ts
const out = await compile(markdown, {
	rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: 'wrap' }]]
	// …
});
```

The result:

```html
<h2 id="the-base-path"><a href="#the-base-path">The base path</a></h2>
```

## Wrap, don't append

`rehype-autolink-headings` can put the link in several places. The common look, a little `#` next to the heading, is `behavior: 'append'`: a separate link inside the heading. But a heading's accessible name is all the text inside it, so a screen reader would hear "The base path #", or with a label on the link, "The base path, Link to this section". Every heading, every time.

With `behavior: 'wrap'`, the heading's own text is the link. Its name doesn't change: "The base path", announced as a heading and a link. Nothing extra to read.

I still wanted the `#` as a visual hint, so it's drawn by CSS, only on hover and keyboard focus:

```css
.prose :is(h2, h3, h4) > a[href^='#'] {
	color: inherit;
	text-decoration: none;

	&:is(:hover, :focus-visible)::after {
		content: '#' / '';
		margin-inline-start: 0.3em;
		color: var(--brand);
	}
}
```

The `/ ''` after the content is its alternative text: empty, so screen readers skip it. The heading keeps the heading's color, without an underline, so it still reads as a heading.

## The build checks the links

SvelteKit prerenders my site, following every link to make every page. It turns out it also checks links with a `#`: if a page links to `#something` and no element on the target page has that `id`, the build fails:

```text
prerender_missing_id
```

I tried it with a link to `#nope`, and the build stopped. So if I rename a heading, which changes its `id`, every link to it from my own site is checked on the next build. Links from other sites can't be checked, which is a good reason not to rename a published heading without a reason.

## One type cast

mdsvex 0.12 is typed with an older version of `unified`, the library under remark and rehype, than these plugins are. They work on the same HTML trees, so it runs fine, but TypeScript sees two different `Node` types and complains. One cast, with a comment saying why:

```ts
const rehypePlugins = [
	rehypeSlug,
	[rehypeAutolinkHeadings, { behavior: 'wrap' }]
] as unknown as MdsvexCompileOptions['rehypePlugins'];
```

## Not under the header

My header is sticky on wide screens. A jump to a heading would put it right under the header, hidden. A rule I already had takes care of it:

```css
html {
	scroll-padding-block-start: var(--header-space);
}
```

`scroll-padding` tells the browser to leave that much room at the top whenever it scrolls something into view, a `#heading` included.

## Links

- [rehype-slug](https://github.com/rehypejs/rehype-slug)
- [rehype-autolink-headings](https://github.com/rehypejs/rehype-autolink-headings)
- [Amber Wilson: Are your anchor links accessible?](https://amberwilson.co.uk/blog/are-your-anchor-links-accessible/)
- [SvelteKit: prerender options](https://svelte.dev/docs/kit/configuration#prerender)
- [MDN: scroll-padding](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-padding)
- [Markdown with mdsvex](./2026-10-31-markdown-with-mdsvex)
