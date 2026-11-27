// A post's body from its markdown to HTML, the way the site makes it: each test writes a
// markdown file, imports it (Vite's mdsvex plugin compiles it, with our options and
// replacement components) and renders it with svelte/server, with the contexts a
// [slug] page gives.
import { afterAll, describe, expect, test } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { render } from 'svelte/server';
import type { Component } from 'svelte';
import type { Locale } from '#lib/i18n/locales.ts';
import { markdownContext } from './context.ts';
import type { Media } from './media.ts';

const dir = mkdtempSync(join(tmpdir(), 'markdown-'));
afterAll(() => rmSync(dir, { recursive: true, force: true }));
let count = 0;

// Files as plain URLs: enhanced:img draws a plain <img> for a string. The pictures the
// build would fetch from YouTube (yt-<id>.jpg) aren't there, as when the download fails.
const media: Media = {
	picture: (_file, src) => `/files/${src.slice(2)}`,
	url: (_file, src) => `/files/${src.slice(2)}`,
	has: (_file, src) => !src.startsWith('./yt-')
};

// file: the language of the file (.es.md is Spanish); page: the page's language.
async function html(markdown: string, { file = 'en', page = 'en' } = {}) {
	const path = join(dir, `post-${count++}${file === 'es' ? '.es' : ''}.md`);
	writeFileSync(path, markdown);
	const { default: Body } = (await import(/* @vite-ignore */ path)) as { default: Component };
	const context = markdownContext(
		() => page as Locale,
		() => media
	);
	// Without Svelte's hydration markers.
	return render(Body, { context }).body.replace(/<!--[^]*?-->/g, '');
}

describe('a body', () => {
	test('headings get an id and link to themselves; repeats get -1', async () => {
		expect(await html('## The base path\n\n## The base path')).toBe(
			'<h2 id="the-base-path"><a href="#the-base-path">The base path</a></h2>' +
				'<h2 id="the-base-path-1"><a href="#the-base-path-1">The base path</a></h2>'
		);
	});

	test('the frontmatter and comments are not part of it', async () => {
		expect(await html('---\ntitle: X\n---\n\n<!-- a note -->\n\nText.')).toBe('<p>Text.</p>');
	});

	test('code in a sentence keeps its backticks and entities as written', async () => {
		expect(await html('Use `` `a` `` and `&rarr;`.')).toBe(
			'<p>Use <code>`a`</code> and <code>&amp;rarr;</code>.</p>'
		);
	});

	test('a code block is highlighted, with its language and a hidden copy button', async () => {
		const out = await html('```ts\nconst a = 1;\n```');
		expect(out).toMatch(
			/^<figure class="code-block" data-lang="ts"><figcaption data-pagefind-ignore=""><span>ts<\/span>/
		);
		expect(out).toContain('<button type="button" hidden="" data-copy=""');
		expect(out).toContain('<code><span class="l"><span class="tok keyword">const</span>');
		expect(out).not.toContain('tabindex');
	});

	test("the button speaks the page's language", async () => {
		expect(await html('```ts\na\n```', { page: 'es' })).toContain('>copiar</button>');
	});

	test("a callout, with its title in the file's language", async () => {
		const out = await html('> [!tip]\n> Test the build.', { file: 'es' });
		expect(out).toMatch(/^<aside class="callout" data-callout="tip"><p class="callout-title">/);
		expect(out).toContain('<span>Sugerencia</span></p> <p>Test the build.</p></aside>');
	});

	test('a custom title, read for the type too; its markup is plain text for now', async () => {
		const out = await html('> [!WARNING] Not on *GitHub* Pages\n> Text.');
		expect(out).toContain('data-callout="warning"');
		expect(out).toContain('Not on GitHub Pages');
		expect(out).toContain('<p>Text.</p>');
	});

	test('a plain blockquote stays one', async () => {
		expect(await html('> Just a quote.')).toBe('<blockquote><p>Just a quote.</p></blockquote>');
	});

	test("a table scrolls in its own box, labelled in the file's language", async () => {
		const out = await html('| a | b |\n| - | - |\n| 1 | 2 |', { file: 'es' });
		expect(out).toMatch(
			/^<div class="table-scroll" role="region" aria-label="Tabla" tabindex="0"><table>/
		);
	});

	test("links: site paths get the page's language; https is external", async () => {
		const out = await html('[A](/about) [B](https://svelte.dev) [C](#x)', { page: 'es' });
		expect(out).toBe(
			'<p><a href="/es/about">A</a> <a href="https://svelte.dev" rel="external">B</a>' +
				' <a href="#x">C</a></p>'
		);
	});
});

describe('our blocks', () => {
	test('a ::video becomes the video: WebM first, then MP4, and a poster', async () => {
		const out = await html(
			'::video(src=./clip.mp4, webm=./clip.webm, poster=./clip.png, width=960, height=540)'
		);
		expect(out).toBe(
			'<video width="960" height="540" controls="" muted="" playsinline="" preload="metadata"' +
				' poster="/files/clip.png"><source src="/files/clip.webm" type="video/webm"/>' +
				'<source src="/files/clip.mp4" type="video/mp4"/></video>'
		);
	});

	test('its caption, the text in brackets, makes a figure and can hold markdown', async () => {
		const out = await html('::video[It _plays_.](src=./clip.mp4, width=960, height=540)');
		expect(out).toMatch(/^<figure><video/);
		expect(out).toContain('<figcaption>It <em>plays</em>.</figcaption></figure>');
	});

	test('HTML in a caption fails the build, like anywhere in a post', async () => {
		await expect(
			html('::video[<b>Bold?</b>](src=./clip.mp4, width=960, height=540)')
		).rejects.toThrow(/<b> is in the text/);
	});

	test("a ::yt is a link card in the file's language: nothing from Google on the page", async () => {
		const out = await html(
			'::yt[Plain Text](src=https://youtu.be/gd5uJ7Nlvvo?t=90, thumbnail=./talk.jpg, caption="A talk, in 2022.")',
			{ file: 'es' }
		);
		expect(out).toContain(
			'<a href="https://www.youtube.com/watch?v=gd5uJ7Nlvvo&amp;t=90" target="_blank" rel="external noopener noreferrer">'
		);
		expect(out).toContain('<img src="/files/talk.jpg" alt="" loading="lazy"/>');
		expect(out).toContain('<span class="yt-title">Plain Text</span>');
		expect(out).toContain('Ver en YouTube · se abre en una pestaña nueva');
		expect(out).toContain('<figcaption>A talk, in 2022.</figcaption>');
		expect(out).not.toMatch(/ytimg|youtube\.com\/embed|<iframe/);
	});

	test('a ::yt is compact: its picture, then the play sign beside the title', async () => {
		const out = await html(
			'::yt[Plain Text](src=https://youtu.be/gd5uJ7Nlvvo, thumbnail=./talk.jpg)'
		);
		expect(out).toMatch(
			/<span class="yt-picture"><img src="\/files\/talk.jpg"[^>]*\/><\/span> <span class="yt-row"><svg class="yt-play"/
		);
	});

	test('a ::yt without a thumbnail, when the build found no picture, is the row alone', async () => {
		const out = await html('::yt[Plain Text](src=https://youtu.be/gd5uJ7Nlvvo)');
		expect(out).not.toContain('yt-picture');
		expect(out).toContain('<span class="yt-row"><svg class="yt-play"');
		expect(out).toContain('<span class="yt-title">Plain Text</span>');
	});

	test('a wrong argument fails the build, naming the file', async () => {
		await expect(html('::video(src=./clip.mp4, widht=960, height=540)')).rejects.toThrow(
			/post-\d+\.md: ::video has no "widht" argument/
		);
	});
});

describe('directives', () => {
	test(':kbd draws a keycap per key, the + between them as text', async () => {
		expect(await html('Press :kbd[Ctrl+Shift+P] or :kbd[Ctrl++].')).toBe(
			'<p>Press <kbd class="keys"><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd></kbd> or ' +
				'<kbd class="keys"><kbd>Ctrl</kbd>+<kbd>+</kbd></kbd>.</p>'
		);
	});

	test(':::details is a native details, closed unless open=true', async () => {
		expect(await html(':::details[Show _it_]\nBody.\n:::')).toBe(
			'<details class="details"><summary>Show <em>it</em></summary> ' +
				'<div class="details-body"><p>Body.</p></div></details>'
		);
		expect(await html(':::details[Open](open=true)\nBody.\n:::')).toContain(
			'<details class="details" open="">'
		);
	});

	test(':::compare: a section per side, its heading still a linked heading', async () => {
		expect(await html(':::compare\n## Before\nOld.\n## After\nNew.\n:::')).toBe(
			'<div class="compare">' +
				'<section class="compare-side"><h2 id="before"><a href="#before">Before</a></h2> <p>Old.</p></section>' +
				'<section class="compare-side"><h2 id="after"><a href="#after">After</a></h2> <p>New.</p></section>' +
				'</div>'
		);
	});

	test("mdsvex's steps, tabs and toc", async () => {
		expect(await html(':::steps\n## Install\nAdd it.\n## Use\nRun it.\n:::')).toMatch(
			/^<ol class="steps" role="list"><li class="step"><div class="step-title"><h2 id="install">/
		);
		const tabs = await html(
			':::tabs\n```sh [npm]\nnpm i x\n```\n```sh [pnpm]\npnpm add x\n```\n:::'
		);
		expect(tabs).toMatch(/role="tab"[^>]*aria-selected="true"[^>]*>npm<\/button>/);
		expect(tabs).toMatch(/role="tabpanel"[^>]*hidden=""/);
		expect(await html('::toc[On this page]\n\n## One\n\n### Two')).toContain(
			'<ul><li><a href="#one">One</a><ul><li><a href="#two">Two</a></li></ul></li></ul></nav>'
		);
	});
});

describe('live demos', () => {
	test('a ```svelte run block draws its component above its code, named as a demo', async () => {
		const out = await html(
			'```svelte run\n<script>\n\tlet count = $state(2);\n</script>\n\n<button>clicked {count}</button>\n```'
		);
		expect(out).toMatch(
			/^<div class="code-demo"><div class="demo" role="group" aria-label="Live demo"><button>clicked 2<\/button><\/div> <figure class="code-block" data-lang="svelte"><figcaption/
		);
		// The code is still shown, as written.
		expect(out).toContain('clicked');
	});

	test("a script block's default export is called and its result shown", async () => {
		expect(await html('```ts run\nexport default () => 6 * 7;\n```')).toContain(
			'<div class="demo" role="group" aria-label="Live demo"><output>42</output></div>'
		);
	});

	test('a run=client block waits for a button, in the page language', async () => {
		expect(
			await html('```js run=client\nexport default () => innerWidth;\n```', { page: 'es' })
		).toContain('<button type="button" class="demo-run">Ejecutar la demo</button>');
	});

	test(':::demo is a window with its title in the bar', async () => {
		const out = await html(':::demo[A counter]\n```ts run\nexport default () => 1;\n```\n:::');
		expect(out).toMatch(
			/^<section class="demo-frame"><p class="demo-title"><span class="demo-lights" aria-hidden="true"><\/span>A counter<\/p> <div class="demo-body"><div class="code-demo">/
		);
	});
});
