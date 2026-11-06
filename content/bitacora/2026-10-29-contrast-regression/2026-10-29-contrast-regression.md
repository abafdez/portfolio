---
title: A contrast bug the audit missed
date: 2026-10-29
phase: 4
tags: [accessibility, lighthouse, design-tokens]
---

## What we did

- Found that `--text-2` (`gray-6`) was only about 3:1 on light surfaces, below the 4.5:1 minimum for text. Changed it to `gray-7` (7.3:1 or better) and `--text-1` to `gray-9`, so the two stay distinct.
- Ran Lighthouse from the command line against the preview build, in both themes: 100 on the home page and the CV page.

## What I learned

- Lighthouse passed in Phase 3 because no page used `--text-2` yet. An audit only checks colors a page actually uses. Check a token pair's contrast when you define it.
- Lighthouse CLI from WSL, using Playwright's Chromium:
  `CHROME_PATH=~/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome pnpm dlx lighthouse@12 <url> --only-categories=accessibility --chrome-flags="--headless=new --no-sandbox"`
- For dark mode, add `--force-dark-mode` to the Chrome flags. `--force-prefers-color-scheme=dark` doesn't exist, and Chrome silently ignores it. I only noticed by checking `matchMedia` in headless Chrome.
- Lesson: when a flag "works", check that it actually did something.

## Problems & fixes

- My first "dark" Lighthouse run was really light. See above.
- The Bitácora page scores 98 (`heading-order`: `h1` jumps to `h3`). It was already like that, and the page gets rebuilt in Phase 6.

## Links

- [WCAG: Contrast (minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- [Lighthouse CLI](https://github.com/GoogleChrome/lighthouse#using-the-node-cli)

## Next

- Fix the Bitácora heading order in Phase 6.
