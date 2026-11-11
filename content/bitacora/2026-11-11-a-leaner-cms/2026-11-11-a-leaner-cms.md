---
title: A leaner CMS
date: 2026-11-11
phase: 11
tags: [cms, svelte, vite, testing]
---

## What we did

- After [svelte-markdown replaced mdsvex](./2026-11-11-svelte-markdown-instead-of-mdsvex), I went through the CMS and asked of each piece whether it still earned its place. It went from 977 to 694 lines of code.
- The CMS moved from `cms/` to `src/lib/cms/`, next to the code it shares with the site. Nothing needs `cms/` in Vite's allowed folders, `tsconfig` or the test config any more.
- Sveltia is imported from npm. `main.ts` sets `CMS_MANUAL_INIT`, imports `@sveltia/cms`, registers our pieces and calls `init({ config })` with `config.yml` read by our own code. The Vite plugin went from 92 lines to 46: it only answers `/admin` with a page that has one script.
- The "Real page" tab is gone: the hidden `.preview.md` files, the endpoint that wrote them, and the `?preview` branches in the `[slug]` pages. The preview draws with the page's own components now, so it had nothing left to show.
- The editor components show a one-line summary (the block's name and title). The preview pane next to them draws the real block, so `blocks.ts` lost its second copy of each block's markup as HTML strings.
- Covers come from a Vite glob instead of a dev-only route; `content.ts` reads frontmatter with the same `readEntry()` as the CMS; the preview's reading time is the site's `readingTime()`, in its own small file.
- Kept: the post's header in the preview, drawn in React. Mounting `ArticleHeader.svelte` there would need a language prop, and its scoped CSS can't reach Sveltia's frame.

## What I learned

- The CMS page isn't a SvelteKit route on purpose: every route sits inside the root layout and its global CSS, and it would be part of the build.
- A React effect must return a function or nothing. Whatever it returns, React calls as its cleanup before the effect runs again.
- Sveltia's editorial workflow (a branch and a pull request per entry, publish = merge) needs the GitHub backend: it's for when the CMS is hosted, not for the local workflow.

## Problems & fixes

- Awaiting `import('@sveltia/cms')` at the top of `main.ts` hung with no error. The page's `DOMContentLoaded` waits for that module to finish, and Sveltia waits for `DOMContentLoaded`. `import(…).then(setUp)` instead.
- Vite's dependency optimizer broke Sveltia's npm build, which loads fonts and wasm from a folder next to its code. It's in `optimizeDeps.exclude`.
- Sveltia's build uses `import.meta.hot`, so Vite's client is on the CMS page anyway. I checked that changing content doesn't reload it, so the CMS's components no longer need to be compiled without hot reload.
- Reading `config.yml` ourselves needed `merge: true` in the `yaml` package: the config uses `<<:` merge keys.
- The live preview drew the first version and then stopped, with `l is not a function` in react-dom on every keystroke. The React wrapper's effect was an arrow that returned a value (`() => update(props)`). A block body fixed it, and `markdown.test.ts` checks it under a stand-in React that keeps React's rule.

## Links

- [Sveltia CMS: manual initialization](https://sveltiacms.app/en/docs/api)
- [Sveltia CMS: editorial workflow](https://sveltiacms.app/en/docs/workflows/editorial)
- [React: useEffect and its cleanup](https://react.dev/reference/react/useEffect)
- [Vite: dependency optimization options](https://vite.dev/config/dep-optimization-options)
- [MDN: DOMContentLoaded](https://developer.mozilla.org/en-US/docs/Web/API/Document/DOMContentLoaded_event)

## Next

- Check the whole editing flow by hand (Sveltia's folder picker can't be automated).
- Images (keep enhanced-img, cache it in CI) and how drafts get published: open questions in `design/svelte-markdown-spike.md`.
