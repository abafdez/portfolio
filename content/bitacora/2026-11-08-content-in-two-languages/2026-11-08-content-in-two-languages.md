---
title: Content in two languages
date: 2026-11-08
phase: 10
tags: [i18n, content, svelte, seo]
---

## What we did

- A post's Spanish version is `<slug>.es.md`, next to `<slug>.md` in the same folder, sharing its images. Its frontmatter only has words: `title`, `description`, the cover's alt text and `reviewed`. `date`, `tags` and `phase` come from the English file, and writing them in the translation fails the build.
- `content.ts` reads both: the lists stay English, each entry knows its languages (`locales`) and its file (`path`), and `inLocale(entry, locale)` gives the translation or the English entry. Every load that lists content asks for each entry in its page's language; the `[slug]` pages render the body from `path`.
- Not translated yet: the Spanish page shows the English text with `lang="en"`, an "en inglés" badge, and a canonical link to the English page. Search engines only see a Spanish page once it exists.
- `reviewed: false` until I've read a translation (Claude writes them); in dev a "sin revisar" badge shows it.
- YAML text (skills, the Awesome list) is plain (the same in every language: Docker) or `{ en, es }`. The loads hand components plain strings in their language, so the components barely changed.
- Callout titles follow the file's language ("Sugerencia", "Advertencia").
- The first translation: "An accordion without JavaScript".

## What I learned

- **Localize where the data is loaded, not where it's shown.** A load function knows its page's language from its `url`; components get strings and don't care.
- **Keys aren't labels.** The CV builder stored my edits by skill name. Translating names would have dropped every saved edit, so each skill has a `key` (its English name) for storage and a `name` to show.
- **A translation that repeats the date can contradict it.** Taking date and tags from the English file means there's nothing to keep in sync.

## Problems & fixes

- `vite.config.ts` stopped loading: it imports the callout plugin, which now imports `locales.ts`, which read `import.meta.env.BASE_PATH` at the top. While Vite loads its config there's no `import.meta.env` yet. It's read with `?.` now; nothing that runs at that moment needs it.
- The "en inglés" badge said `lang="es"` instead of `es-ES`: I passed the language id, not its tag.

## Links

- [MDN: the lang attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/lang)
- [Google: localized versions and canonical](https://developers.google.com/search/docs/specialty/international/localized-versions)

## Next

- Translate the content in batches: about, skills and CV; projects and Awesome; posts; drafts; Bitácora.
