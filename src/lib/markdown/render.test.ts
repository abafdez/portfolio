import { describe, expect, test } from 'vitest';
import { renderMarkdown } from './render.server';
import type { Media } from './media';

// Files as plain URLs: enhanced:img draws a plain <img> for a string.
const media: Media = {
	picture: (_file, src) => `/files/${src.slice(2)}`,
	url: (_file, src) => `/files/${src.slice(2)}`
};

const file = '/content/blog/published/x/x.md';
const html = (markdown: string, path = file, locale: 'en' | 'es' = 'en') =>
	renderMarkdown(markdown, path, locale, media);

describe('renderMarkdown', () => {
	test('headings get an id and link to themselves; repeats get -1', async () => {
		expect(await html('## The base path\n\n## The base path')).toBe(
			'<h2 id="the-base-path"><a href="#the-base-path">The base path</a></h2>' +
				'<h2 id="the-base-path-1"><a href="#the-base-path-1">The base path</a></h2>'
		);
	});

	test('the frontmatter is not part of the body', async () => {
		expect(await html('---\ntitle: X\n---\n\nText.')).toBe('<p>Text.</p>');
	});

	test('code in a sentence keeps its backticks and entities as written', async () => {
		expect(await html('Use `` `a` `` and `&rarr;`.')).toBe(
			'<p>Use <code>`a`</code> and <code>&amp;rarr;</code>.</p>'
		);
	});

	test('a code block is highlighted, with its language and a hidden copy button', async () => {
		const out = await html('```ts\nconst a = 1;\n```');
		expect(out).toMatch(/^<figure class="code-block"><figcaption><span>ts<\/span>/);
		expect(out).toContain('<button type="button" hidden="" data-copy=""');
		expect(out).toContain('<pre class="shiki tokens"');
		expect(out).not.toContain('tabindex');
		expect(out).not.toContain('<!--'); // Svelte's hydration markers are gone
	});

	test('the button speaks the page language', async () => {
		expect(await html('```ts\na\n```', file, 'es')).toContain('>copiar</button>');
	});

	test('a callout, with its title in the file language', async () => {
		const out = await html('> [!tip] Use `pnpm`\n> Text.', '/content/blog/published/x/x.es.md');
		expect(out).toMatch(/^<aside class="callout" data-callout="tip"><p class="callout-title"><svg/);
		expect(out).toContain(
			'<span class="visually-hidden">Sugerencia: </span>Use <code>pnpm</code></span></p><p>Text.</p></aside>'
		);
	});

	test('a table scrolls in its own box, labelled in the file language', async () => {
		const out = await html('| a |\n| - |\n| b |', '/content/blog/published/x/x.es.md');
		expect(out).toMatch(
			/^<div class="table-scroll" role="region" aria-label="Tabla" tabindex="0"><table>/
		);
	});

	test('links: site paths get the base and the page language; https is external', async () => {
		const out = await html('[A](/about) [B](https://svelte.dev) [C](#x)', file, 'es');
		expect(out).toContain('<a href="/es/about">A</a>'); // no base path in tests
		expect(out).toContain('<a href="https://svelte.dev" rel="external">B</a>');
		expect(out).toContain('<a href="#x">C</a>');
	});

	test('an image with a caption is a figure; without, it stays inline', async () => {
		expect(await html('![A diagram](./a.png "What it shows")')).toBe(
			'<figure><img src="/files/a.png" alt="A diagram" loading="lazy"/> <figcaption>What it shows</figcaption></figure>'
		);
		expect(await html('![A diagram](./a.png)')).toBe(
			'<p><img src="/files/a.png" alt="A diagram" loading="lazy"/></p>'
		);
	});

	test('an image needs alt text', async () => {
		await expect(html('![](./a.png)')).rejects.toThrow('x.md: ./a.png needs alt text');
	});

	test('a ```video block becomes the video', async () => {
		const out = await html(
			'```video\nsrc: ./a.mp4\nwidth: 640\nheight: 360\ncaption: It plays\n```'
		);
		expect(out).toBe(
			'<figure><video width="640" height="360" controls="" muted="" playsinline="" preload="metadata">' +
				'<source src="/files/a.mp4" type="video/mp4"/></video> <figcaption>It plays</figcaption></figure>'
		);
	});

	test('a ```yt block becomes a link card, in the file language', async () => {
		const out = await html(
			'```yt\nsrc: https://youtu.be/gd5uJ7Nlvvo\ntitle: A talk\n```',
			'/content/blog/published/x/x.es.md'
		);
		expect(out).toContain('<a href="https://www.youtube.com/watch?v=gd5uJ7Nlvvo" target="_blank"');
		expect(out).toContain(
			'<span class="yt-where">Ver en YouTube · se abre en una pestaña nueva</span>'
		);
	});

	test('a video: WebM first, then MP4, and a poster', async () => {
		const out = await html(
			'```video\nsrc: ./a.mp4\nwebm: ./a.webm\nposter: ./a.png\nwidth: 640\nheight: 360\n```'
		);
		expect(out).toContain('poster="/files/a.png"');
		expect(out).toMatch(
			/<source src="\/files\/a\.webm" type="video\/webm"\/>\s*<source src="\/files\/a\.mp4"/
		);
	});

	test('block text is text, not markup', async () => {
		const out = await html(
			'```video\nsrc: ./a.mp4\nwidth: 1\nheight: 1\ncaption: "<b> & {x}"\n```'
		);
		expect(out).toContain('<figcaption>&lt;b> &amp; {x}</figcaption>');
	});

	test('a yt block: nothing from Google on the page, a decorative thumbnail, a caption', async () => {
		const out = await html(
			'```yt\nsrc: https://youtu.be/gd5uJ7Nlvvo?t=90\ntitle: T\nthumbnail: ./talk.jpg\ncaption: A talk.\n```'
		);
		expect(out).toContain('href="https://www.youtube.com/watch?v=gd5uJ7Nlvvo&amp;t=90"');
		expect(out).toContain('<img src="/files/talk.jpg" alt="" loading="lazy"/>');
		expect(out).toContain('<figcaption>A talk.</figcaption>');
		expect(out).not.toMatch(/<iframe|<script|ytimg|youtube-nocookie/);
	});

	test('a wrong block field fails the build, naming the file', async () => {
		await expect(html('```video\nsrc: ./a.mp4\n```')).rejects.toThrow(
			/x\.md: the ```video block needs a "width"/
		);
	});
});
