---
title: A language in the URL
date: 2026-11-08
phase: 10
tags: [i18n, sveltekit, seo, accessibility]
---

## What we did

- Phase 10 started: the site in English and Spanish. I chose a homemade setup over [Paraglide JS](https://paraglidejs.com): most of the text is markdown and YAML, which Paraglide doesn't translate, its URL handling is a SvelteKit hook I can write myself, and its v3 was days old. My messages are shaped like Paraglide's (`m.blogTitle()`), so moving later is mostly a change of imports.
- Decided in an interview: English at `/portfolio/`, Spanish at `/portfolio/es/`, same paths (no translated slugs), Spain's Spanish (`es-ES`), no language detection, an ES/EN link in the header, ISO dates in both languages.
- A spike on `/blog` first, then every page:
  - `src/hooks.ts`: a `reroute` hook strips the `/es`, so `/es/blog` is the `/blog` route. Route ids don't change, so the breadcrumbs, the nav marker and `isInside()` kept working.
  - `src/lib/i18n/`: `en.ts` and `es.ts` (about 130 messages each; `es.ts` uses `satisfies`, so a missing one fails `pnpm check`), `locales.ts` (no SvelteKit imports: `split()`, `plural()` with `Intl.PluralRules`), `index.ts` (`m`, `route()`, `getLocale()`, `formatNumber()`).
  - `<html lang>` through a `%lang%` placeholder in `app.html`, filled in `hooks.server.ts`, and updated in the browser after a client-side switch.
  - `Seo.svelte`: `hreflang` alternates, `x-default`, `og:locale`. The sitemap lists each translated page once per language.
- Tests: the smoke test runs in both languages, plus a test for the switch; unit tests for `split()`, plurals and every message.

## What I learned

- **`reroute` changes the route, not the URL.** `page.url` keeps the `/es` (that's where the language comes from); `page.route.id` stays `/blog`.
- **`resolve()` writes links relative to the real URL** while prerendering: on `/es/blog`, `resolve('/blog')` is `../blog`, the English page. So every link goes through `route()`, which puts `es/` right after `resolve('/')`. A unit test fails if any other file imports `resolve`.
- **The language comes from the page, not from a variable:** the build renders every page, in both languages, in one process. `getLocale()` reads `page.data.locale`, which belongs to the page being rendered.
- **Same route, new language, same component:** SvelteKit keeps a page's component when only the URL's language changes, so anything worked out once in a `<script>` stays in the old language. `{#key getLocale()}` in the root layout rebuilds the page.
- Spanish writes `4,53`, not `4.53`: `Intl.NumberFormat` knows.

## Problems & fixes

- Vite's `import.meta.env.BASE_URL` is `./` under SvelteKit, so it can't tell the hook the base path. `vite.config.ts` defines `import.meta.env.BASE_PATH` instead.
- The first sitemap had no Spanish URLs. It builds its page list when the module loads, where `resolve()` is absolute, and localized it during the request, where `resolve('/')` is relative. `localizePath()` works from the real base path instead.
- The test for "every message has text" called each message with `{ count: 2 }`; the skill level messages need a `level`. It found nothing wrong in the messages, but it was a reminder that the test's sample has to fit every message.

## Links

- [SvelteKit: reroute](https://svelte.dev/docs/kit/hooks#Universal-hooks-reroute)
- [Google: tell Google about localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [MDN: Intl.PluralRules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/PluralRules)

## Next

- The content side: posts, entries and YAML in both languages.
