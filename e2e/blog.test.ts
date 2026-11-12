// A blog post's body is HTML made on the server (src/lib/markdown/render.server.ts). Nothing in it is a Svelte component in the browser, so what JS
// does there is added by hand (copy.ts): this checks it still happens.
import { expect, test } from '@playwright/test';

// Two posts with code blocks, linked from the blog's list.
const first = 'blog/2026-11-07-callouts-that-read-well-everywhere';
const second = 'blog/2026-11-04-unit-tests-with-vitest';

test('code blocks get a copy button that copies the code', async ({ page, context }) => {
	await context.grantPermissions(['clipboard-read', 'clipboard-write']);
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));

	await page.goto(first);
	const block = page.locator('.prose .code-block').first();
	await block.getByRole('button', { name: 'copy' }).click();
	await expect(block.getByRole('status')).toHaveText('copied');
	const code = await block.locator('code').textContent();
	expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(code);

	// Another post through the router: new HTML, and its buttons work too ({#key}).
	await page.goto('blog');
	await page
		.locator(`a[href$="${second.split('/')[1]}"]`)
		.first()
		.click();
	await expect(page).toHaveURL(new RegExp(`${second}$`));
	await expect(page.locator('.prose .code-block button').first()).toBeVisible();

	expect(errors).toEqual([]);
});

test.describe('without JavaScript', () => {
	test.use({ javaScriptEnabled: false });

	test('the post is all there, and no button that does nothing', async ({ page }) => {
		await page.goto(first);
		await expect(page.locator('.prose aside.callout').first()).toBeVisible();
		await expect(page.locator('.prose .code-block').first()).toBeVisible();
		await expect(page.locator('.prose .code-block button').first()).toBeHidden();
	});
});
