---
title: 'SEO on a GitHub Pages project site, starting with a robots.txt that did nothing'
date: 2026-11-04
tags: [sveltekit, seo, github-pages]
description: My robots.txt was blocking every crawler, or so I thought. On a project site it's never read. What actually controls indexing there, plus one Seo component, absolute URLs while prerendering, and a sitemap from my content.
---

When I started this site, I added a `robots.txt` that blocked everything:

```text
User-agent: *
Disallow: /
```

The plan was to keep the site hidden until it was ready. It wasn't hidden. It never was.

## Where crawlers look for robots.txt

A crawler asks for `robots.txt` at the **root of the host**, and only there. My site is a GitHub Pages _project_ site: it lives at `abafdez.github.io/portfolio/`. So a crawler asks for:

```text
https://abafdez.github.io/robots.txt            → 404
```

My file was at `https://abafdez.github.io/portfolio/robots.txt`, a perfectly normal file that no crawler ever asks for. The root one is a 404, and a missing `robots.txt` means "crawl everything".

The root of `abafdez.github.io` belongs to a different repository (`abafdez.github.io`, if I ever make one). On a project site, the only switch I control is a tag on each page:

```html
<meta name="robots" content="noindex" />
```

They don't mean the same thing anyway. `Disallow` says "don't crawl this", but a URL other sites link to can still show up in results, without a description. `noindex` says "don't list this page", and the crawler has to be allowed in to read it.

<!-- TODO: what I decided, and why: findable, because a portfolio is meant to be found -->

I decided to make the site findable. The file is gone, and the one page that isn't ready (the mascot's review sheet) says `noindex`.

## One component for every page's head

Every page had its own `<svelte:head>` with a title, and some had a description. Now they all use one component:

```svelte
<Seo title={post.title} section="Blog" description={post.description} published={post.date} />
```

`Seo.svelte` writes:

- the `<title>`: `title · section · Alfonso Baeza`;
- the description, which search results usually show under the title;
- the canonical URL: the page's one true address;
- the Open Graph tags (`og:title`, `og:description`, `og:url`, `og:type`), which LinkedIn, Slack or Discord read to build a link preview;
- `twitter:card`, because X reads the `og:` tags but needs this one to show a card at all.

A page with a `published` date is an `article` with `article:published_time`, the rest are `website`. `noindex` is a prop, so `/mascot` is just `<Seo … noindex />`.

I started without an `og:image`, so previews were text cards. (Previews need a PNG or JPG, not SVG.) Later, posts got [cover images](./2026-11-06-cover-images-and-cards), and a post with a cover now uses it as its `og:image`, with `twitter:card` set to `summary_large_image`, the big card.

<!-- TODO: a screenshot of a link preview, from a messaging app or an OG preview tool, once it's deployed -->

## Absolute URLs while prerendering

A canonical URL must be absolute. The component builds it from `page.url`:

```ts
const canonical = $derived(page.url.origin + page.url.pathname);
```

Without the query: `/projects/cv?profile=support` is the same page as `/projects/cv`.

But my site is prerendered, so there's no real request at build time, and SvelteKit makes up the URL. Its origin is `http://sveltekit-prerender`. One line in the config fixes that:

```ts
paths: {
	base: base,
	origin: 'https://abafdez.github.io'
}
```

(In SvelteKit 3 it's `paths.origin`. Older docs and posts put it under `prerender`.) Now the built HTML says:

```html
<link rel="canonical" href="https://abafdez.github.io/portfolio/projects/cv" />
```

**Update:** the site is in English and Spanish now, so the component builds the page's address in every language and adds `hreflang` links between them. A post that isn't translated yet has a Spanish copy whose canonical points at the English page, so search engines don't see the same text twice. The [post on the second language](./2026-11-08-a-second-language-without-a-library) has the details.

## A description for every page

Posts have a `description` in their frontmatter. Devlog entries don't, and I'm not going to write 47 of them. So `content.ts` takes one from the body: the first paragraph or list item, as plain text, cut at a word under 160 characters (search results cut at about that).

````ts
export function summary(text: string, max = 160): string {
	const first =
		text
			.replace(frontmatter, '')
			.replace(codeBlock, '') // whole fenced blocks, fence to fence
			.split(/\r?\n/)
			.map((line) => line.trim())
			.find((line) => line && !/^(#|<!--|```)/.test(line)) ?? '';
	// …strip the list marker, links and code marks, then cut at a word
}
````

My entries start with "What we did", so the first bullet is usually a good one-line summary. (My first unit test of this function found a bug: it skipped a code block's opening fence but took the code under it as the summary. That's the [next post](./2026-11-04-unit-tests-with-vitest).)

## A sitemap from the content

A sitemap lists the pages search engines should know about. Mine is a prerendered endpoint, `src/routes/sitemap.xml/+server.ts`, built from the same lists the pages come from:

```ts
const pages: Page[] = [
	...sections.map(({ href }) => ({ path: resolve(href) })),
	...allLog.map(({ slug, date }) => ({
		path: resolve('/devlog/[slug]', { slug }),
		updated: date
	}))
	// …projects, Awesome lists, posts, tags
];
```

A new post or entry is in it without touching this file. Nothing links to it, so it goes in `prerender.entries`, like my SVG sprite.

Normally `robots.txt` says where the sitemap is. Not for me, see above. So I submit it by hand in Google Search Console.

<!-- TODO: submitting the sitemap in Search Console, and what it reported -->

## Links

- [Google: robots.txt introduction](https://developers.google.com/search/docs/crawling-indexing/robots/intro)
- [Google: Block indexing with noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing)
- [The Open Graph protocol](https://ogp.me/)
- [sitemaps.org protocol](https://www.sitemaps.org/protocol.html)
- [SvelteKit: configuration, paths](https://svelte.dev/docs/kit/configuration#paths)
