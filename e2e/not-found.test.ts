// The 404: GitHub Pages sends build/404.html for any address that isn't a page, and the
// app shows +error.svelte with one of the variants (src/lib/projects/not-found/). scripts/serve.ts
// does the same, so this runs against the real fallback.
import { expect, test } from '@playwright/test';

test('a missing page shows the 404 and every variant runs', async ({ page }) => {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	const response = await page.goto('no/such/page');
	expect(response?.status()).toBe(404);
	await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible();
	await expect(page.getByText('/no/such/page')).toBeVisible();

	// "Another 404" goes through them all, in order, from a random start.
	const name = page.locator('#variant-title');
	const seen = new Set<string>();
	for (let i = 0; i < 4; i++) {
		await expect(name).not.toBeEmpty();
		seen.add(await name.innerText());
		await page.getByRole('button', { name: 'Another 404' }).click();
	}
	expect([...seen].sort()).toEqual(['ASCII wave', 'Breakout', 'Loose dots', 'Snake']);
	expect(errors).toEqual([]);
});

test('Breakout starts with Space and breaks bricks', async ({ page }) => {
	await page.goto('no/such/page');
	const name = page.locator('#variant-title');
	while ((await name.innerText()) !== 'Breakout') {
		await page.getByRole('button', { name: 'Another 404' }).click();
	}
	const board = page.getByRole('application', { name: /Breakout/ });
	await board.focus();
	await page.keyboard.press('Space');
	await expect(page.getByRole('status')).toHaveText('Break every brick of the 404.');
	// The 404 has 47 cells: one broken is enough (nobody moves the paddle, so it misses).
	await expect(page.getByText(/^4[0-6] bricks left/)).toBeVisible({ timeout: 5000 });
});

test('a missing Spanish page is in Spanish', async ({ page }) => {
	await page.goto('es/no-existe');
	await expect(page.getByRole('heading', { level: 1, name: 'Página no encontrada' })).toBeVisible();
	await expect(page.locator('html')).toHaveAttribute('lang', 'es-ES');
});

test('the 404 games project shows each variant with links to its code', async ({ page }) => {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.goto('projects/404');
	await expect(page.getByRole('link', { name: 'Source code on GitHub' })).toHaveAttribute(
		'href',
		'https://github.com/abafdez/portfolio/tree/main/src/lib/projects/not-found'
	);
	for (const [name, file] of [
		['Snake', 'snake.ts'],
		['ASCII wave', 'ascii.ts'],
		['Loose dots', 'Particles.svelte'],
		['Breakout', 'breakout.ts']
	]) {
		await page.getByRole('radio', { name }).check();
		await expect(page.getByRole('heading', { level: 2, name })).toBeVisible();
		await expect(page.locator('section canvas, section pre').first()).toBeVisible();
		await expect(page.getByRole('link', { name: file, exact: true })).toHaveAttribute(
			'href',
			new RegExp(`/blob/main/src/lib/projects/not-found/${file}$`)
		);
	}
	expect(errors).toEqual([]);
});
