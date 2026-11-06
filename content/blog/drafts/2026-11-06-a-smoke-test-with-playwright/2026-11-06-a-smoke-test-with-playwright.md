---
title: 'A smoke test: does every page still load?'
date: 2026-11-06
tags: [testing, playwright, ci]
description: One Playwright test that clicks every link in my site's nav, and why it checks for errors a build can't see.
---

My unit tests check small functions. They can't tell me whether the site works: whether a page loads, whether its JavaScript starts, whether a link goes where it should. For that, something has to open the site in a browser and click around, like I do before every merge. That's an **end-to-end test**: it tests the whole thing, from one end to the other.

The smallest useful one is a **smoke test**. The name comes from hardware: switch the new board on, and if smoke comes out, don't bother testing anything else. Mine asks one question: does every page in the nav load?

<!-- TODO: what I used to check by hand before each merge -->

## What the build already checks

SvelteKit prerenders my site: at build time it starts from the home page, follows every link, and writes each page as an HTML file. A link to a page that doesn't exist fails the build. So broken links are already covered.

What the build can't see is what happens in the browser afterwards. The HTML arrives, then the JavaScript **hydrates** it: it takes over the page so buttons, filters and the router work. If that JavaScript throws, the page still looks right. The text is there, but nothing behind it works. No build step would notice.

## Setting up Playwright

[Playwright](https://playwright.dev/) drives real browsers (Chromium, Firefox, WebKit) from a test file.

```sh
pnpm add -D @playwright/test
pnpm exec playwright install chromium
```

The second line downloads the browser itself. Then a config file, `playwright.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test';

const base = process.env.BASE_PATH ?? '/portfolio';
const port = 4174;

export default defineConfig({
	testDir: 'e2e',
	use: { baseURL: `http://localhost:${port}${base}/` },
	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
	webServer: {
		command: `pnpm preview --port ${port} --strictPort`,
		env: { BASE_PATH: base },
		url: `http://localhost:${port}${base}/`
	}
});
```

`webServer` is the useful part: Playwright starts my preview server before the tests, waits until `url` answers, and stops it at the end. The server serves the **build**, with the same base path as GitHub Pages, because that's what visitors get. Dev has no base path, so a link that forgets it works in dev and breaks in production.

A script builds first, then tests:

```json
"test:e2e": "BASE_PATH=/portfolio vite build && playwright test"
```

## The test

```ts
test('every nav link loads its page when clicked', async ({ page }) => {
	const errors = collectErrors(page);
	await page.goto('');
	const nav = page.getByRole('navigation', { name: 'Main navigation' });
	const links = await navLinks(page);

	for (const { label, url } of links) {
		await test.step(label, async () => {
			const link = nav.getByRole('link', { name: label, exact: true });
			await link.click();
			await expect(page).toHaveURL(url);
			await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
			await expect(link).toHaveAttribute('aria-current', 'page');
		});
	}
	expect(errors).toEqual([]);
});
```

A few things I didn't expect:

- **Every Playwright function is `async`**, because each one talks to a browser running in another process. Forget an `await` and the test moves on before the click has happened.
- **`getByRole` finds things the way a screen reader does**: a navigation called "Main navigation", a link called "Blog". If my nav lost its `aria-label`, the test would fail. That's a feature: it checks the page is labelled.
- **The links come from the nav**, not from a list in the test. Add a section, and it's tested.
- **`expect(page).toHaveURL()` waits.** A click starts a navigation, which takes a moment. Instead of a `sleep`, Playwright's `expect` retries for up to five seconds until the check is true. `toBeVisible()` does the same.
- **`test.step()`** gives each link a name in the report, so a failure says "Blog", not just "line 41".

A second test opens every link directly, without clicking: a full page load, like a visitor coming from a search result. It checks for a `200` and a title ending in my name.

## Catching errors that don't show

`collectErrors` is the part that sees what the build can't:

```ts
function collectErrors(page: Page): string[] {
	const errors: string[] = [];
	const add = (message: string) => errors.push(`${new URL(page.url()).pathname}: ${message}`);
	page.on('pageerror', (error) => add(error.message));
	page.on('console', (message) => {
		if (message.type() === 'error') add(message.text());
	});
	return errors;
}
```

`pageerror` fires for any uncaught error in the page; `console` errors include files that failed to load. Each one starts with the page's path, so a failure says where.

To check that the test can fail, I broke a page on purpose:

```svelte
<script lang="ts">
	import { onMount } from 'svelte';
	onMount(() => {
		throw new Error('broken on purpose');
	});
</script>
```

The build passed. Both tests failed, with `/portfolio/projects: Error: broken on purpose`. A test you've never seen fail hasn't proved anything yet.

<!-- TODO: try it: break a page yourself and read the failure, then open the trace (pnpm exec playwright show-trace …) -->

## In CI

My GitHub workflow already checked, linted and built every PR. Now it also runs the unit tests and, after the build, the smoke test:

```yaml
- name: Unit tests
  run: pnpm test

- name: Build
  run: pnpm run build
  env:
    BASE_PATH: '/${{ github.event.repository.name }}'

- name: Install Chromium for Playwright
  run: pnpm exec playwright install --with-deps chromium

- name: Smoke test
  run: pnpm exec playwright test
  env:
    BASE_PATH: '/${{ github.event.repository.name }}'

- name: Upload Playwright traces
  if: failure()
  uses: actions/upload-artifact@v7
  with:
    name: playwright-traces
    path: test-results/
```

`--with-deps` also installs the Linux libraries Chromium needs, which a fresh runner doesn't have. When the smoke test fails, the traces are uploaded, and a trace is a step-by-step replay of the test, with a snapshot of the page at each step.

A PR that breaks a page can't be merged without me seeing a red cross first.

## Links

- [Playwright: Writing tests](https://playwright.dev/docs/writing-tests)
- [Playwright: Locators](https://playwright.dev/docs/locators)
- [Playwright: Web server](https://playwright.dev/docs/test-webserver)
- [Playwright: Continuous integration](https://playwright.dev/docs/ci)
- [My first unit tests found a bug on the first run](./2026-11-04-unit-tests-with-vitest)
