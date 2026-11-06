---
title: Breadcrumbs, and a nav marker that was never in the HTML
date: 2026-11-04
phase: 9
tags: [sveltekit, accessibility, navigation]
---

## What we did

- Pages inside a section show where they are: `Home / Projects / CV builder`, `Home / Blog / #css`. Section pages (`/projects`, `/about`) don't, because the nav already says that.
- `Breadcrumbs.svelte` sits in the root layout, at the top of `<main>`. The section comes from the nav's own list, now `sections` in `links.ts`, shared by both. The page's name comes from its load data: each nested route returns `crumb` (a post's title, a tool's name, `#tag`), typed in `App.PageData`.
- The nav now marks the section on pages inside it too: `aria-current="true"` on Projects while I'm on `/projects/cv`, with the same marker. Before, no link was marked there.
- Fixed an old bug on the way: the nav's `aria-current` and marker were never in the prerendered HTML. They only appeared once the JS ran.

## What I learned

- A breadcrumb is a `<nav aria-label="Breadcrumb">` with an ordered list. The last item is the current page: text with `aria-current="page"`, not a link to where I already am.
- `content: '/' / ''` sets a pseudo-element's alt text. The second string is empty, so a screen reader doesn't read "slash" between the items.
- While prerendering, `resolve()` gives **relative** links (`./projects`, `../projects`), because `paths.relative` is on by default. So `page.url.pathname === resolve(href)` never matched in the HTML, only in the browser. `page.route.id` (`/projects/cv`, `/blog/[slug]`) has no base path and is the same on the server and the client, so the nav and the breadcrumbs compare route ids now.
- To find it I looked at the build output, not the page: `grep` on `build/projects/cv.html` showed no breadcrumbs, even though they were on screen.
- `aria-current="true"` means "the current item in this set". It's the right value for a section I'm inside but not on.

## Links

- [WAI-ARIA APG: Breadcrumb pattern](https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/)
- [MDN: aria-current](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-current)
- [MDN: content, alternative text](https://developer.mozilla.org/en-US/docs/Web/CSS/content#alternative_text_string_counter)
- [SvelteKit: paths.relative](https://svelte.dev/docs/kit/configuration#paths)
- [SvelteKit: page.route](https://svelte.dev/docs/kit/$app-state#page)

## Next

- Phase 9: the `Seo` component. Breadcrumbs could also go in as structured data (`BreadcrumbList`) there.
