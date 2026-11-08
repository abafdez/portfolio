---
title: 'Draft posts that never ship: a glob, import.meta.env.DEV and dead code'
date: 2026-11-02
tags: [sveltekit, vite, blog]
description: Why filtering out draft posts wasn't enough on a static SvelteKit blog, and how a dev-only glob keeps every draft out of the build.
cover: A funnel filtering posts.
---

My blog started with every post marked `draft: true` in its frontmatter, and a filter that hid drafts outside of dev. It looked fine: no draft showed up on the built site. But the drafts were still in the build, and anyone could read them.

## Why a filter isn't enough

Each post page gets its body from a glob:

```ts
const bodies = import.meta.glob<Component>('/content/blog/*.md', { import: 'default' });
```

`import.meta.glob` is a Vite feature. Vite resolves it while the site builds, from file paths only. It never reads the frontmatter, so it can't know a file is a draft. It makes a JavaScript chunk for every file the glob matches, used or not.

So the filter hid the links and the pages, but every draft's body still ended up in `build/_app/immutable/` as a `.js` file, ready to open by its URL.

<!-- TODO: what I found in the build output (grep a draft's title in build/) before the fix -->

## Drafts are a folder

Now a draft is a draft because of where it lives: `content/blog/drafts/`, next to `content/blog/published/`. Each post is a folder with its images, and publishing one means moving its folder from one to the other (`git mv content/blog/drafts/<slug> content/blog/published/`). The `draft` flag comes from the path, so there's no frontmatter to forget:

```ts
const draft = path.includes('/drafts/');
```

## A glob only dev can see

The drafts get their own glob, behind `import.meta.env.DEV`:

```ts
const bodies = {
	...import.meta.glob<Component>('/content/blog/published/*/*.md', { import: 'default' }),
	...(import.meta.env.DEV
		? import.meta.glob<Component>('/content/blog/drafts/*/*.md', { import: 'default' })
		: {})
};
```

(`*/*.md`: every post sits in a folder with its own name, next to its images.)

In a build, Vite replaces `import.meta.env.DEV` with `false`. The condition becomes `false ? … : {}`, the bundler sees that the first branch can never run, and removes it, glob included. With no glob, no chunk is made and no draft is read.

The list of posts (frontmatter only) works the same way in `content.ts`, so `/blog` and the home page never list a draft in a build either.

<!-- TODO: try it: `pnpm build`, then `grep -rl "<a draft's title>" build/` finds nothing; `pnpm dev` shows the drafts -->

## The body comes from a universal load

The post page has two load files. The frontmatter comes from `+page.server.ts`, and the body from `+page.ts`. A server `load` sends its data to the browser serialized, and a component is a function, which can't be serialized. A universal `load` runs in the browser too, so it can just `import()` the chunk.

## One exception to a useful check

While every post is a draft, `/blog/[slug]` has no pages at all in a build. SvelteKit fails the build when a route is never reached while prerendering, and I like that check: it catches a page I forgot to link. So I didn't turn it off. I made one exception:

```ts
sveltekit({
	prerender: {
		handleUnseenRoutes: ({ routes, message }) => {
			if (routes.some((route) => route !== '/blog/[slug]')) throw new Error(message);
		}
	}
});
```

Any other unseen route still fails the build. Once I publish a post, `entries()` returns it, the route gets a page, and the exception stops mattering.

<!-- TODO: the first post I published, and whether I removed the exception -->
