// The toolbox: every tool on the dashboard opens, and the tools do their job in a real
// browser (the parts unit tests can't reach: the form, the file input, the clipboard).
import { expect, test } from '@playwright/test';

// Every tool is read from the dashboard itself, like the nav links in
// navigation.test.ts: a tool added later is tested without touching this file.
test('every tool on the dashboard opens', async ({ page }) => {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.goto('projects/toolbox');
	const titles = page.locator('[data-morph-card] h3 a');
	const names = await titles.allTextContents();
	expect(names.length).toBeGreaterThan(0);

	for (const name of names) {
		await test.step(name, async () => {
			await page.getByRole('link', { name, exact: true }).click();
			await expect(page.getByRole('heading', { level: 1, name })).toBeVisible();
			// Four levels: Home / Projects / Toolbox / the tool.
			const crumbs = page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('listitem');
			await expect(crumbs).toHaveText(['Home', 'Projects', 'Toolbox', name]);
			await page.goBack();
		});
	}
	expect(errors).toEqual([]);
});

test.describe('Base64', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('projects/toolbox/base64');
		// The form is disabled until the page's JS runs.
		await expect(page.getByRole('radio', { name: 'Encode' })).toBeEnabled();
	});

	test('text goes there and back as UTF-8', async ({ page }) => {
		await page.getByRole('textbox', { name: 'Text' }).fill('ñandú 😀');
		await expect(page.getByRole('textbox', { name: 'Base64' })).toHaveValue('w7FhbmTDuiDwn5iA');
		// Switching direction takes the output along.
		await page.getByRole('radio', { name: 'Decode' }).check();
		await expect(page.getByRole('textbox', { name: 'Text' })).toHaveValue('ñandú 😀');
	});

	test('says what is wrong with what you pasted', async ({ page }) => {
		await page.getByRole('radio', { name: 'Decode' }).check();
		const input = page.getByRole('textbox', { name: 'Base64' });
		await input.fill('Hello!');
		await expect(input).toHaveAttribute('aria-invalid', 'true');
		await expect(page.getByText("That isn't Base64")).toBeVisible();
	});

	test('a file becomes a data URL', async ({ page }) => {
		await page.locator('input[type=file]').setInputFiles({
			name: 'hello.txt',
			mimeType: 'text/plain',
			buffer: Buffer.from('Hello')
		});
		await expect(page.getByRole('textbox', { name: 'Data URL' })).toHaveValue(
			'data:text/plain;base64,SGVsbG8='
		);
	});
});

test.describe('HTML symbols', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('projects/toolbox/symbols');
		await expect(page.getByRole('searchbox', { name: 'Search' })).toBeEnabled();
	});

	test('search by entity, then every way to write it', async ({ page }) => {
		await page.getByRole('searchbox', { name: 'Search' }).fill('&rarr;');
		await page.getByRole('button', { name: 'Rightwards arrow' }).click();
		const details = page.getByRole('region', { name: 'Rightwards arrow' });
		await expect(details).toContainText('U+2192');
		await expect(details).toContainText('&rarr;');
		await expect(details).toContainText('E2 86 92');
	});

	test('closing the details puts focus back on the symbol', async ({ page }) => {
		const symbol = page.getByRole('button', { name: 'Rightwards arrow', exact: true });
		await symbol.click();
		await page.getByRole('button', { name: 'Close the details' }).click();
		await expect(symbol).toBeFocused();
	});

	test('a group shows all of its symbols', async ({ page }) => {
		await page.getByRole('combobox', { name: 'Group' }).selectOption({ label: 'Named in HTML' });
		const status = await page.getByRole('status').first().textContent();
		const count = Number(status!.match(/\d+/)![0]);
		await expect(page.locator('.grid button')).toHaveCount(count);
	});
});

test.describe('Cursors and selection', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('projects/toolbox/cursors');
		// The forms are disabled until the page's JS runs. The builder sits in a hidden
		// tab, which role queries skip, so it's found by its tag.
		await expect(page.locator('select').first()).toBeEnabled();
	});

	test('tabs: arrow keys move between parts, and the hash remembers the open one', async ({
		page
	}) => {
		await page.getByRole('tab', { name: 'Cursors' }).focus();
		await page.keyboard.press('ArrowRight');
		await expect(page.getByRole('tab', { name: 'Your own' })).toHaveAttribute(
			'aria-selected',
			'true'
		);
		await expect(page.getByRole('tab', { name: 'Your own' })).toBeFocused();
		await expect(page).toHaveURL(/#custom-cursor$/);
		await expect(page.getByRole('heading', { name: 'Your own cursor, in SVG' })).toBeVisible();
		await expect(
			page.getByRole('heading', { name: 'The cursor says what a click will do' })
		).toBeHidden();
	});

	test('a link with a hash opens that tab', async ({ page }) => {
		await page.goto('projects/toolbox/cursors#user-select');
		await expect(page.getByRole('tab', { name: 'user-select' })).toHaveAttribute(
			'aria-selected',
			'true'
		);
		await expect(page.getByText('You can’t select this sentence.')).toBeVisible();
	});

	test('the striped layer takes the click until it lets it through', async ({ page }) => {
		await page.getByRole('tab', { name: 'pointer-events' }).click();
		const button = page.getByRole('button', { name: 'Click me' });
		const clicks = page.getByText(/^Clicks:/);
		// force: Playwright would refuse, since the layer covers the button (that's the point).
		await button.click({ force: true });
		await expect(clicks).toHaveText('Clicks: the button 0, the striped layer 1.');
		await page.getByRole('checkbox', { name: /pointer-events: none/ }).check();
		await button.click();
		await expect(clicks).toHaveText('Clicks: the button 1, the striped layer 1.');
	});

	test('the builder writes the cursor CSS, with the hotspot and the fallback last', async ({
		page
	}) => {
		await page.getByRole('tab', { name: 'Your own' }).click();
		await page.getByRole('combobox', { name: 'Shape' }).selectOption({ label: 'Crosshair' });
		await expect(page.getByRole('textbox', { name: 'CSS' }).first()).toHaveValue(
			/cursor: url\("data:image\/svg\+xml,[^"]+"\) 16 16, auto;/
		);
	});

	test('a GIF is split into frames that play as the cursor; the plain GIF stays put', async ({
		page
	}) => {
		await page.getByRole('tab', { name: 'Animated' }).click();
		await expect(page.getByText(/^8 frames, about 80 ms each/)).toBeVisible();
		const framed = page.getByRole('figure').filter({ hasText: 'The same GIF, frame by frame' });
		const area = framed.locator('.area');
		await area.hover();
		const first = await area.evaluate((el) => el.style.cursor);
		expect(first).toMatch(/^url\("data:image\/png;base64,/);
		await expect.poll(() => area.evaluate((el) => el.style.cursor)).not.toBe(first);
		// Your own GIF: here, the sample file itself.
		await page
			.getByLabel(/Choose a GIF of your own/)
			.setInputFiles('src/lib/projects/toolbox/cursors/spinner.gif');
		await expect(page.getByText(/^8 frames, about 80 ms each/)).toBeVisible();
	});

	test('effects that move things: the magnet pulls the button, the card tilts', async ({
		page
	}) => {
		await page.getByRole('tab', { name: 'Animated' }).click();
		const pick = page.getByRole('combobox', { name: 'Effect' });
		const button = page.getByRole('button', { name: 'A magnetic button' });
		await pick.selectOption({ label: 'Magnetic' });
		// The scene is far down the page: on screen first, or the mouse moves outside it.
		// Without smooth scrolling (global.css, html[data-smooth-scroll]), so the scroll
		// is over before anything is measured.
		await page.evaluate(() => document.documentElement.removeAttribute('data-smooth-scroll'));
		await page.locator('.playground').scrollIntoViewIfNeeded();
		const box = (await button.boundingBox())!;
		await page.mouse.move(box.x + box.width / 2 + 40, box.y + box.height / 2);
		await expect.poll(() => button.evaluate((el) => el.style.translate)).toMatch(/px/);

		await pick.selectOption({ label: 'Tilt' });
		const card = page.getByText('A card that tilts');
		const cardBox = (await card.boundingBox())!;
		await page.mouse.move(cardBox.x + cardBox.width * 0.8, cardBox.y + cardBox.height * 0.3);
		await expect.poll(() => card.evaluate((el) => el.style.transform)).toContain('rotateY');
		// The magnet lets go once another effect is picked.
		await expect(button).toHaveJSProperty('style.translate', '');
	});

	test('an animated cursor changes frames while the pointer is over it', async ({ page }) => {
		await page.getByRole('tab', { name: 'Animated' }).click();
		const spinner = page.getByRole('listitem').filter({ hasText: /^Spinner$/ });
		await spinner.hover();
		const first = await spinner.evaluate((el) => el.style.cursor);
		await expect.poll(() => spinner.evaluate((el) => el.style.cursor)).not.toBe(first);
	});
});
