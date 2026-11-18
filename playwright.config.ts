// End-to-end tests (pnpm test:e2e): a real browser opens the built site and clicks
// through it like a visitor. Unit tests (pnpm test, Vitest) call functions directly;
// these check that the pages load, hydrate and link to each other.
// https://playwright.dev/docs/test-configuration
import { defineConfig, devices } from '@playwright/test';

// The base path GitHub Pages serves the site from, the same one the build used
// (test:e2e sets it; CI passes the repo name), so the tests catch links that forget
// it (dev has no base path).
const base = process.env.BASE_PATH ?? '/portfolio';
// Not 4173 (preview's default), so a preview you have open doesn't get in the way.
const port = 4174;

export default defineConfig({
	testDir: 'e2e',
	// test.only left in by mistake fails CI instead of silently skipping every other test.
	forbidOnly: !!process.env.CI,
	// Every test on its own, in any order (none shares state), spread over the workers:
	// by default only files run side by side, and there are just three. On CI, one worker
	// per core of the runner (4); locally, Playwright's default (half the cores).
	fullyParallel: true,
	workers: process.env.CI ? '100%' : undefined,
	// On CI, the GitHub reporter turns failures into notes on the PR's changed lines.
	reporter: process.env.CI ? 'github' : 'list',
	use: {
		// page.goto('') opens the home page; links are followed as the site writes them.
		baseURL: `http://localhost:${port}${base}/`,
		// On a failure, keep a trace: every step with a snapshot of the page
		// (pnpm exec playwright show-trace <file>).
		trace: 'retain-on-failure'
	},
	// On CI, the Google Chrome GitHub's Ubuntu runners come with ('chrome' channel), so
	// there's no browser to download (that step took 27 s). Locally, Playwright's own
	// Chromium (pnpm exec playwright install chromium).
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'], channel: process.env.CI ? 'chrome' : undefined }
		}
	],
	// Playwright starts the preview server before the tests and stops it after.
	// The build itself happens before (see test:e2e in package.json and the CI workflow).
	webServer: {
		command: `pnpm preview --port ${port} --strictPort`,
		env: { BASE_PATH: base },
		url: `http://localhost:${port}${base}/`
	}
});
