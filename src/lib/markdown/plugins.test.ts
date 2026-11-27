// Our parse plugins and the blocks plugin, through mdsvex's compile(): what each one
// makes of the markdown (Svelte source, before our components draw it), and what fails
// the build.
import { describe, expect, test } from 'vitest';
import { compile } from 'mdsvex/compile';
import { blocks } from '#lib/blocks.ts';
import * as blockComponents from './blocks/index.ts';
import { compileOptions } from './options.ts';

const file = '/content/blog/posts/x/x.md';
const compiled = (markdown: string) => compile(markdown, { filename: file, ...compileOptions });
const svelte = (markdown: string) => compiled(markdown).code.replace(/<script[^]*?<\/script>/g, '');

describe('callouts', () => {
	test('a callout is a marked blockquote: its type, its custom title, the file', () => {
		expect(svelte('> [!tip]\n> Text.')).toContain(
			`<blockquote kind="tip" title="" file="${file}">`
		);
		expect(svelte('> [!Warning] Not on Pages\n> Text.')).toContain(
			`<blockquote kind="warning" title="Not on Pages" file="${file}">`
		);
	});

	test("Obsidian's folding sign is accepted (shown open)", () => {
		expect(svelte('> [!note]-\n> Text.')).toContain('<blockquote kind="note" title=""');
	});

	test('a callout inside a list item, or inside another callout', () => {
		expect(svelte('- > [!note]\n  > In a list.')).toContain('<li><blockquote kind="note"');
		const nested = svelte('> [!note]\n> Outer.\n>\n> > [!tip]\n> > Inner.');
		expect(nested).toContain('kind="note"');
		expect(nested).toContain('kind="tip"');
	});

	test('[!type] later in the text, or a plain quote, stays text', () => {
		expect(svelte('> Text with [!tip] in it.')).toContain('<blockquote>');
		expect(svelte('> Just a quote.')).toContain('<blockquote>');
	});

	test('an unknown type fails, naming the file', () => {
		expect(() => compiled('> [!tipp]\n> Text.')).toThrow(`${file}: [!tipp] isn't a callout type`);
	});
});

describe('figures', () => {
	// (compile() alone leaves the src as written; the Vite plugin makes it an import.)
	test('an image with a title, alone in its paragraph, is a figure', () => {
		expect(svelte('![A chart](./chart.png "Sales by month")')).toContain(
			'<figure><img src="./chart.png" alt="A chart" /><figcaption>Sales by month</figcaption></figure>'
		);
	});

	test('without a title, or with text around it, it stays in its paragraph', () => {
		expect(svelte('![A chart](./chart.png)')).toMatch(/^<p><img /);
		expect(svelte('See ![A chart](./chart.png "Sales") here.')).toMatch(/^<p>See <img /);
	});
});

describe('what fails the build', () => {
	test('HTML in the text, naming the file and the tag', () => {
		expect(() => compiled('Some <details>text</details>.')).toThrow(
			`${file}: <details> is in the text. Put it in backticks.`
		);
	});

	test('Svelte in the text: { } and blocks', () => {
		const message = `${file}: a { } in the text is Svelte code. Put it in backticks.`;
		expect(() => compiled('An object: {a: 1}.')).toThrow(message);
		expect(() => compiled('{#if true}x{/if}')).toThrow(message);
	});

	test('in backticks or a code block, all of that is text', () => {
		expect(() =>
			compiled('Use `<details>` and `{a: 1}`.\n\n```html\n<details></details>\n```')
		).not.toThrow();
	});

	test('an image from elsewhere, or without alt text', () => {
		expect(() => compiled('![A chart](https://example.com/c.png)')).toThrow(
			`${file}: https://example.com/c.png should be a file next to the post (./…)`
		);
		expect(() => compiled('![](./chart.png)')).toThrow(`${file}: ./chart.png needs alt text`);
	});
});

describe('our blocks', () => {
	test("a block is its component, its fields as props, and its files in the post's data", () => {
		const out = compiled(
			'```video\nsrc: ./clip.mp4\nposter: ./clip.png\nwidth: 960\nheight: 540\n```'
		);
		expect(out.code).toContain(
			`<Video_MDSVEX_D_G file="${file}" src="./clip.mp4" poster="./clip.png" width="960" height="540" />`
		);
		expect(out.data).toEqual({ blocks: { files: ['./clip.mp4', './clip.png'] } });
	});

	test('every fenced block in blocks.ts has a component', () => {
		expect(Object.keys(blockComponents).sort()).toEqual(Object.keys(blocks).sort());
	});
});

test('links that leave the site are rel="external"; our own full links are not', () => {
	expect(
		svelte('[a](https://svelte.dev) [b](https://abafdez.github.io/portfolio/) [c](/about)')
	).toBe(
		'<p><a href="https://svelte.dev" rel="external">a</a> <a href="https://abafdez.github.io/portfolio/">b</a> <a href="/about">c</a></p>'
	);
});

describe('our directives', () => {
	test(':kbd gets its text as keys', () => {
		expect(svelte('Press :kbd[Ctrl+Shift+P].')).toMatch(/<Kbd_\w+ keys="Ctrl\+Shift\+P">/);
	});

	test('a :::details without a summary fails, naming the file and line', () => {
		expect(() => compiled('Text.\n\n:::details\nBody.\n:::')).toThrow(
			`${file}:3: :::details needs a summary`
		);
	});

	test('each heading of the first depth inside :::compare starts a side', () => {
		const out = svelte(':::compare\n## Before\nOld.\n\n### More\nx\n## After\nNew.\n:::');
		expect(out.match(/<Compare_side_\w+>/g)).toHaveLength(2);
		// A deeper heading stays inside its side.
		expect(out).toMatch(/<h3 id="more">More<\/h3><p>x<\/p>\s*<\/Compare_side/);
	});

	test('a :::compare must start with a heading, and needs two sides', () => {
		expect(() => compiled(':::compare\nIntro.\n## A\na\n## B\nb\n:::')).toThrow(
			`${file}:2: a :::compare starts with a heading`
		);
		expect(() => compiled(':::compare\n## Only\nOne.\n:::')).toThrow(
			`${file}:1: :::compare needs two headings or more`
		);
	});

	test('an unknown directive fails, naming it', () => {
		expect(() => compiled(':::kdb[x]\ny\n:::')).toThrow(
			/no component renders the directive :::kdb/
		);
	});
});
