import { describe, expect, test } from 'vitest';
import { renderMarkdown } from './render.ts';

const en = 'content/blog/drafts/a/a.md';
const es = 'content/blog/drafts/a/a.es.md';

describe('renderMarkdown, the CMS preview', () => {
	test('callouts, as the build makes them, in the file language', async () => {
		expect(await renderMarkdown('> [!tip]\n> Test the build.', en)).toContain(
			'<aside class="callout"'
		);
		expect(await renderMarkdown('> [!tip]\n> Prueba el build.', es)).toContain('Sugerencia');
	});

	test('our blocks become their components', async () => {
		const html = await renderMarkdown(
			'```yt\nsrc: https://youtu.be/gd5uJ7Nlvvo\ntitle: Plain Text\n```',
			en
		);
		expect(html).toContain('youtube.com/watch?v=gd5uJ7Nlvvo');
		expect(html).not.toContain('<pre');
	});

	test('a block with a wrong field fails, as the build would', async () => {
		await expect(renderMarkdown('```yt\ntitle: No link\n```', en)).rejects.toThrow(/src/);
	});

	test('other code is highlighted with our theme', async () => {
		const html = await renderMarkdown('```css\na { color: red; }\n```', en);
		expect(html).toContain('class="code-block"');
		expect(html).toContain('var(--code-');
	});

	test('headings get ids and link to themselves', async () => {
		expect(await renderMarkdown('## The base path', en)).toContain(
			'<h2 id="the-base-path"><a href="#the-base-path">'
		);
	});

	test('a captioned picture is a figure, and ./files go through resolve', async () => {
		const html = await renderMarkdown('![A diagram](./diagram.png "How it works")', en, (path) =>
			path.replace('./', 'blob:')
		);
		expect(html).toContain('<figure><img src="blob:diagram.png" alt="A diagram">');
		expect(html).toContain('<figcaption>How it works</figcaption>');
	});

	test('HTML in the markdown goes through', async () => {
		expect(await renderMarkdown('<details><summary>More</summary>Hidden</details>', en)).toContain(
			'<details><summary>More</summary>'
		);
	});
});
