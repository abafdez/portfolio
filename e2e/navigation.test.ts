// Smoke test: does every page in the main navigation load? Not every detail, just
// "does it start without smoke". If one of these fails, something big is broken.
import { expect, test, type Page } from '@playwright/test';

// A page can look fine and still have broken: a hydration error leaves the HTML on
// screen with no JS behind it. So every test collects the page's uncaught errors and
// console.error messages (a missing file shows up there too), and expects none.
// Each one starts with the page's path, so a failure says where it happened.
function collectErrors(page: Page): string[] {
	const errors: string[] = [];
	const add = (message: string) => errors.push(`${new URL(page.url()).pathname}: ${message}`);
	page.on('pageerror', (error) => add(error.message));
	page.on('console', (message) => {
		if (message.type() === 'error') add(message.text());
	});
	return errors;
}

// Every test runs in each language: the home page, the nav's accessible name (it's
// translated too), and the <html lang> every page in it must have.
const languages = [
	{ name: 'English', home: '', nav: 'Main navigation', lang: 'en' },
	{ name: 'Spanish', home: 'es', nav: 'Navegación principal', lang: 'es-ES' }
];

// The links are read from the nav itself, not from a list here: a section added later
// is tested without touching this file.
async function navLinks(page: Page, name: string) {
	const nav = page.getByRole('navigation', { name });
	const links = await nav.getByRole('link').all();
	return Promise.all(
		links.map(async (link) => ({
			label: (await link.textContent())!.trim(),
			url: await link.evaluate((a: HTMLAnchorElement) => a.href)
		}))
	);
}

// A Spanish page's links stay in Spanish: /portfolio/es/…
const inLanguage = (url: string, home: string) =>
	!home || new URL(url).pathname.split('/').includes(home);

for (const { name, home, nav: navName, lang } of languages) {
	test.describe(name, () => {
		test('every nav link loads its page when clicked', async ({ page }) => {
			const errors = collectErrors(page);
			await page.goto(home);
			const nav = page.getByRole('navigation', { name: navName });
			const links = await navLinks(page, navName);
			expect(links.length).toBeGreaterThan(1);

			for (const { label, url } of links) {
				// A step is a named part of the test: the report says which link failed.
				await test.step(label, async () => {
					expect(inLanguage(url, home), `${url} is in ${name}`).toBe(true);
					const link = nav.getByRole('link', { name: label, exact: true });
					await link.click();
					// Clicking is client-side navigation (SvelteKit's router, JS): the URL
					// changes, the new page renders, and the nav marks it as the current one.
					await expect(page).toHaveURL(url);
					await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
					await expect(link).toHaveAttribute('aria-current', 'page');
					await expect(page.locator('html')).toHaveAttribute('lang', lang);
				});
			}
			expect(errors).toEqual([]);
		});

		test('every nav page loads on its own, without the router', async ({ page }) => {
			const errors = collectErrors(page);
			await page.goto(home);
			const links = await navLinks(page, navName);

			for (const { label, url } of links) {
				await test.step(label, async () => {
					// A full page load, like a visitor arriving from a search result: the
					// prerendered HTML file and its assets, under the base path.
					const response = await page.goto(url);
					expect(response?.status()).toBe(200);
					await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
					// Seo.svelte gives every page a title ending in the site name.
					await expect(page).toHaveTitle(/Alfonso Baeza$/);
					// hooks.server.ts writes it into the HTML.
					await expect(page.locator('html')).toHaveAttribute('lang', lang);
				});
			}
			expect(errors).toEqual([]);
		});
	});
}

// The switch goes to the same page in the other language and back, without a reload
// (client-side navigation): the text, the links and <html lang> all follow.
test('the language switch keeps you on the same page', async ({ page }) => {
	const errors = collectErrors(page);
	await page.goto('blog');
	await page.getByRole('link', { name: /Leer en español/ }).click();
	await expect(page).toHaveURL(/\/es\/blog$/);
	await expect(page.locator('html')).toHaveAttribute('lang', 'es-ES');
	await expect(page.getByRole('heading', { name: 'Explorar por etiqueta' })).toBeVisible();

	await page.getByRole('link', { name: /Read in English/ }).click();
	await expect(page).toHaveURL(
		(url) => url.pathname.endsWith('/blog') && !url.pathname.includes('/es/')
	);
	await expect(page.locator('html')).toHaveAttribute('lang', 'en');
	await expect(page.getByRole('heading', { name: 'Browse by tag' })).toBeVisible();
	expect(errors).toEqual([]);
});
