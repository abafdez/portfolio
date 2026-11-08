---
title: 'Breadcrumbs in SvelteKit, and why I compare route ids'
date: 2026-11-04
tags: [sveltekit, accessibility, navigation]
description: A breadcrumb trail from data the routes already have, and the bug I found on the way. My nav's current-page marker was never in the prerendered HTML, because resolve() writes relative links while prerendering.
---

Inside a project or a post it was easy to lose track of where I was on my site. The nav highlighted the current page, but only on the section pages themselves: on `/projects/cv`, nothing was highlighted at all.

So now nested pages have breadcrumbs:

```text
Home / Projects / CV builder
Home / Blog / #css
```

<!-- TODO: a screenshot of the breadcrumbs and the nav marker on /projects/cv -->

## What a page needs to say

Every nested page on my site belongs to one section, and the section is the first part of its route: `/projects/cv` is in Projects, `/blog/tags/[tag]` is in Blog. My nav already has the list of sections, so I moved it to `links.ts` and both components use it:

```ts
export const sections: { href: RouteWithoutParams; label: string }[] = [
	{ href: '/', label: 'Home' },
	{ href: '/blog', label: 'Blog' }
	// …
];
```

(**Update:** since the site has a Spanish version, each `label` is a message, `label: m.navBlog`, called as `label()`, so it comes out in the page's language.)

The only thing the breadcrumbs can't work out is the page's own name. The route knows it (it's loading the post or the project anyway), so it says it in its load data:

```ts
// src/routes/blog/[slug]/+page.server.ts
return { post, crumb: post.title };
```

`crumb` is typed in `App.PageData` (`src/app.d.ts`), like the `composition` my routes already send to the layout. That makes `page.data.crumb` a `string | undefined` everywhere.

## The markup

```svelte
{#if section && page.data.crumb}
	<nav aria-label="Breadcrumb">
		<ol>
			<li><a href={resolve('/')}>Home</a></li>
			<li><a href={resolve(section.href)}>{section.label}</a></li>
			<li aria-current="page">{page.data.crumb}</li>
		</ol>
	</nav>
{/if}
```

- A `<nav>` with its own label, so it shows up as a separate landmark from the main navigation.
- An **ordered** list, because the order is the point.
- The last item is text, not a link: a link to the page I'm already on would do nothing. `aria-current="page"` tells a screen reader it's where I am.

The slashes are CSS, with an alt text:

```css
li + li::before {
	content: '/' / '';
}
```

The part after the second `/` is the alternative text for the generated content. It's empty, so a screen reader skips the slash instead of reading "slash" between every item.

<!-- TODO: what a screen reader actually said on the breadcrumbs -->

## The bug: a marker that was never in the HTML

To mark the section in the nav, I first matched URLs, like the nav always had:

```ts
page.url.pathname === resolve(link.href);
```

It worked on screen. Then I looked at the prerendered file:

```sh
grep -c 'Breadcrumb' build/projects/cv.html # 0
```

No breadcrumbs, and no `aria-current` on any nav link, on any page. They only appeared once the JavaScript ran: without JS there was no current page at all, and with JS the marker popped in after load.

The reason is `paths.relative`, which SvelteKit turns on by default. While prerendering, `resolve()` writes links **relative to the page**, so the same HTML works under any base path:

```html
<!-- build/projects/cv.html -->
<a href="../projects">Projects</a>
```

`'../projects'` never equals `'/portfolio/projects/cv'`. In the browser `resolve()` gives absolute paths again, so the match worked there.

The fix is to compare something that doesn't depend on the URL: the **route id**. `page.route.id` is the route's file path, `/projects/cv` or `/blog/[slug]`. It has no base path, and it's the same on the server and in the browser:

```ts
export const isInside = (href: RouteWithoutParams, route: string | null) =>
	href !== '/' && !!route?.startsWith(`${href}/`);
```

(`null` is a page with no route, like a 404. Home is left out because every route starts with `/`.)

The nav now says `aria-current="page"` on a section's own page and `aria-current="true"` on a page inside it. `"true"` means "the current item in this set", which is exactly what Projects is while I'm on the CV builder.

<!-- TODO: try it: build with BASE_PATH=/portfolio, open build/projects/cv.html and look at the nav's hrefs. Then turn JavaScript off in DevTools and check the marker is still there -->

## Links

- [WAI-ARIA APG: Breadcrumb pattern](https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/)
- [MDN: aria-current](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-current)
- [MDN: content, alternative text](https://developer.mozilla.org/en-US/docs/Web/CSS/content#alternative_text_string_counter)
- [SvelteKit: paths.relative](https://svelte.dev/docs/kit/configuration#paths)
- [SvelteKit: page.route](https://svelte.dev/docs/kit/$app-state#page)
