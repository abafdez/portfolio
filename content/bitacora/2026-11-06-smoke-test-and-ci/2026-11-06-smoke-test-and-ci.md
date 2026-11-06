---
title: A smoke test in a real browser, and tests in CI
date: 2026-11-06
phase: 9
tags: [testing, playwright, ci]
---

## What we did

- Added Playwright 1.64.1 (`@playwright/test`) and one smoke test, `e2e/navigation.test.ts`: it reads the links from the main nav, then clicks each one (the router) and opens each one directly (a full page load), checking the URL, an `h1`, `aria-current="page"`, a 200, the title, and no errors in the page.
- `playwright.config.ts`: Playwright starts `pnpm preview` on port 4174 with `BASE_PATH=/portfolio`, so the tests run on the built site with its base path. `pnpm test:e2e` builds first, then runs them.
- CI runs `pnpm test` after lint, and the smoke test after the build. When it fails, the traces are uploaded as an artifact.
- `tsconfig.json` now includes `e2e/` and `playwright.config.ts`, so `pnpm check` type-checks them too.
- Two more rejected tags in the unit tests: `bitácora` (an accent) and `css_grid` (an underscore).

## What I learned

- A **smoke test** only checks that nothing big is broken: every page in the nav loads. An **end-to-end (e2e)** test drives a real browser through the built site, like a visitor. Unit tests call functions; e2e tests click.
- The prerender crawler already fails the build on a broken link, so the smoke test checks what a build can't see: the JS. A hydration error leaves the HTML on screen with nothing working behind it. Listening to `pageerror` and `console` errors catches that.
- I broke the Projects page on purpose (an error in `onMount`): the build passed, and both tests failed, naming the page.
- The test reads the links from the nav (`getByRole('navigation', { name: 'Main navigation' })`), so a new section is tested without editing the test. Locators by role and name are how a screen reader finds things, so they also check the page is labelled.
- `expect(page).toHaveURL()` and `expect(locator).toBeVisible()` **wait** (up to 5 s) until they're true. A click starts a navigation that takes a moment, and these wait for it, with no `sleep`.
- `test.step()` names a part of a test, so the report says which link failed.
- pnpm refuses package versions published too recently (`minimumReleaseAge`): a compromised release is usually caught within days. Playwright 1.65.0 was a day old, so I used 1.64.1 instead of adding an exception.

## Problems & fixes

- `npm pkg set` refused to run: the `devEngines` field wants Node 22 and this shell has 24. I edited `package.json` by hand.
- The first version of the error list didn't say which page an error came from. Each error now starts with the page's path.

## Links

- [Playwright: Writing tests](https://playwright.dev/docs/writing-tests)
- [Playwright: Locators](https://playwright.dev/docs/locators)
- [Playwright: Web server](https://playwright.dev/docs/test-webserver)
- [Playwright: Continuous integration](https://playwright.dev/docs/ci)
- [pnpm: minimumReleaseAge](https://pnpm.io/settings#minimumreleaseage)

## Next

- Lighthouse ≥ 90 on every page (the last "done when" of Phase 9).
