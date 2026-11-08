---
title: 'Translations next to the post'
date: 2026-11-08
tags: [i18n, content, seo]
description: Each post's Spanish version is a second file in its folder, with only the words in its frontmatter. How the site reads it, and what a Spanish page shows until it exists.
cover: An English file sending its content to translated copies, one per flag.
---

My site's interface is in two languages now. Its content is the bigger job: posts, a dev log, a list of skills. This is how a post gets its Spanish version, and what the site does while it doesn't have one.

## A second file, in the same folder

Every post already lives in its own folder, with its images. The Spanish version goes right there:

```text
content/blog/published/an-accordion-without-javascript/
  an-accordion-without-javascript.md
  an-accordion-without-javascript.es.md
  cover.avif
```

Both files share the images, and publishing is still moving one folder. Obsidian and GitHub show both as plain markdown.

## Only the words are translated

The Spanish file's frontmatter has the title, the description, the cover's alt text, and nothing else:

```yaml
---
title: 'Un acordeón sin JavaScript'
description: Dales el mismo name a varios elementos details…
cover: Un elemento que se despliega y se pliega como un acordeón.
reviewed: false
---
```

The date and the tags come from the English file. If the translation could have its own, sooner or later the two would say different things. Writing them in the Spanish file fails the build instead.

`reviewed` is there because the translations aren't mine at first: Claude writes them, and I read them. Until I set it to `true`, the post shows a "sin revisar" badge, only in dev.

<!-- TODO: Alfonso, how many did you have to change, and what did you change most? -->

## Localize where the data is loaded

The site reads every post's frontmatter at build time. The lists stay English, each post knows which languages it has, and a page asks for each post in its own language:

```ts
export const load: PageServerLoad = ({ params, url }) => {
	const original = allPosts.find(({ slug }) => slug === params.slug);
	const post = inLocale(original, localeOf(url));
	return { post, translated: isTranslated(post) };
};
```

The component gets a post in one language and doesn't need to know there are two. The skills and the Awesome list work the same way: their YAML text is either plain (Docker is Docker) or `{ en, es }`, and the load picks.

## What a Spanish page shows meanwhile

Until a post is translated, its Spanish page shows the English post inside the Spanish site: the menus in Spanish, the post in English, marked "en inglés". Two details make that honest:

- `lang="en"` on the post, so a screen reader reads it with an English voice instead of mispronouncing it in Spanish.
- A canonical link to the English page, so search engines don't index the same text twice under two addresses. Only once there's a translation does the Spanish page list both versions with `hreflang`.

<!-- TODO: Alfonso, a screenshot of an untranslated post on the Spanish site. -->

## One trap: keys aren't labels

My CV builder saves my edits to each skill by its name. Translating the names would have orphaned everything already saved. So each skill now has a `key`, its English name, for storing, and a `name` to show. Anything that gets saved shouldn't depend on the language it's shown in.
