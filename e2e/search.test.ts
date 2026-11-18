// Search (Search.svelte, search.ts): the header's button opens the box, Pagefind's index
// (built by `pagefind --site build`) answers, and a result is a link that works.
import { expect, test } from '@playwright/test';

test('the header search finds a post and opens it', async ({ page }) => {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.goto('');
	await page.getByRole('button', { name: 'Search' }).click();
	const box = page.getByRole('searchbox', { name: 'Search' });
	await expect(box).toBeFocused();
	await box.fill('callouts');
	await expect(page.getByRole('status').filter({ hasText: /results?$/ })).toBeVisible();
	const first = page.locator('#search ol a').first();
	await expect(first).toBeVisible();
	const href = await first.getAttribute('href');
	expect(href).not.toMatch(/\.html$/);
	await first.click();
	await expect(page).toHaveURL(new RegExp(`${href}$`));
	await expect(page.locator('#search')).not.toBeVisible();
	expect(errors).toEqual([]);
});

test('"/" opens the search, and Spanish pages search the Spanish index', async ({ page }) => {
	await page.goto('es/');
	// The shortcut listens once the page's script runs: the button is enabled then.
	await expect(page.getByRole('button', { name: 'Buscar' })).toBeEnabled();
	await page.keyboard.press('/');
	const box = page.getByRole('searchbox', { name: 'Buscar' });
	await expect(box).toBeFocused();
	await box.fill('contraste');
	await expect(page.locator('#search ol a').first()).toHaveAttribute('href', /\/es\//);
});
