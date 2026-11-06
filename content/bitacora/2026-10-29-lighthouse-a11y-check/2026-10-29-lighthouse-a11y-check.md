---
title: Lighthouse accessibility check
date: 2026-10-29
phase: 3
tags: [accessibility, lighthouse, testing]
---

## What we did

- Ran Lighthouse's accessibility audit on the preview build (`BASE_PATH=/portfolio pnpm build && BASE_PATH=/portfolio pnpm preview`), not on dev. It passes.
- Fixed what it found: the home page had no `<title>`. It now has `Alfonso Baeza · Portfolio`. I also fixed a typo in the Projects title.

## What I learned

- Audit the preview build, not `pnpm dev`. Dev isn't what ships: it uses no base path, no minification, and unbundled modules.
- Every page needs its own `<title>` in `<svelte:head>`. It's the first thing a screen reader announces, and it's what shows in tabs and bookmarks.
- Browser extensions affect Lighthouse results. Dark Reader showed up in the diagnostics even while turned off for my site, because its script still loads on every page. Run audits without extensions:
  - an Incognito window (extensions are off unless allowed there),
  - a separate Chrome profile or Guest mode with no extensions,
  - or the CLI, which starts a clean Chrome: `pnpm dlx lighthouse <url> --only-categories=accessibility --view`. From WSL it needs `CHROME_PATH`.
- `<meta name="darkreader-lock">` tells Dark Reader to leave a site alone. I didn't add it: it overrides the visitor's own choice in the extension.

## Links

- [Lighthouse accessibility scoring](https://developer.chrome.com/docs/lighthouse/accessibility/scoring)
- [Lighthouse CLI](https://github.com/GoogleChrome/lighthouse#using-the-node-cli)

## Next

- Open the Phase 3 PR.
