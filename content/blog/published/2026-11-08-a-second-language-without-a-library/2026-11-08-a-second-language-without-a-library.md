---
title: A second language without a library
date: 2026-11-08
tags: [i18n, sveltekit, seo]
description: My site is in English and Spanish now, with a SvelteKit hook, two files of messages and one rule about links. What Paraglide would have done, and what I learned doing it myself.
cover: A globe surrounded by language codes, with a site switching to another language.
---

I wanted my site in Spanish too: it's my first language, and my CV is useful in both. The usual answer for SvelteKit is [Paraglide JS](https://paraglidejs.com), and it's a good one. I did it by hand instead, and this is why and how.

## Why not a library

Most of my site's text isn't in the interface. It's posts, dev-log entries, a list of skills, all in markdown and YAML, and a messages library doesn't touch those. What a library would give me is the part around the text: which language a URL is in, and links that stay in it. In SvelteKit that part is one hook.

My messages still look like Paraglide's, so I could move later by changing imports:

```ts
// en.ts
export const en = {
	blogTitle: () => 'Blog',
	tagPostCount: ({ count }: Count) => plural('en', count, { one: ' post', other: ' posts' })
};

// es.ts: satisfies checks every message is there, with the same parameters
export const es = {
	blogTitle: () => 'Blog',
	tagPostCount: ({ count }: Count) => plural('es', count, { one: ' artículo', other: ' artículos' })
} satisfies Messages;
```

## The language is in the URL

English stays where it was, `/portfolio/blog`, and Spanish is `/portfolio/es/blog`. I didn't want a second copy of every route, so a `reroute` hook tells SvelteKit that `/es/blog` is the `/blog` route:

```ts
// src/hooks.ts
export const reroute: Reroute = ({ url }) => delocalize(url.pathname);
```

The URL doesn't change, so `page.url` still has the `/es`, and that's where the root layout reads the language from. The route id doesn't change either, which mattered more than I expected: my breadcrumbs and my nav compare route ids, and they kept working without a line changed.

## The one rule: every link goes through route()

The spike's surprise. While SvelteKit prerenders a page, `resolve()` writes links relative to that page's real URL. On `/es/blog`, `resolve('/blog/[slug]')` gives `../blog/x`, and that's the English post.

So every link to a page goes through my own `route()`, which is `resolve()` plus the language right after the base path. And so I can't forget, a unit test reads every file and fails if one imports `resolve` without a good reason.

## The language belongs to the page

My first idea was a variable, `currentLocale`, set by the switch. It would have broken the build: SvelteKit prerenders every page, English and Spanish, in one process, so one page's language could leak into the next. The language comes from the page being rendered (`page.data.locale`), and every message looks it up when it's called.

One more trap: `/blog` and `/es/blog` are the same route, so switching language keeps the page's component and only updates its template. Anything a component worked out once in its script stays in the old language. Wrapping the page in `{#key getLocale()}` builds it again.

## The switch

The switch is a link in the header to the same page in the other language, with `hreflang` and `lang` set to where it goes. Since the whole page changes in place, it plays the same effects as my colour themes (a ripple, a glitch, a scanline or rain, taking turns), started from the root layout's `onNavigate` when the old and new URLs are in different languages. `data-sveltekit-reset="false"` keeps you where you were reading instead of jumping to the top.

## Search engines

Each page lists itself in both languages, so Google can send Spanish searchers to the Spanish page:

```html
<link rel="alternate" hreflang="en" href="…/portfolio/blog" />
<link rel="alternate" hreflang="es-ES" href="…/portfolio/es/blog" />
<link rel="alternate" hreflang="x-default" href="…/portfolio/blog" />
```

The sitemap says the same, and `<html lang>` says which language each page is in, so a screen reader picks the right voice.

## Would I use Paraglide next time?
