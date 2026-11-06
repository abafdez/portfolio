// enhanceImages() gets what mdsvex writes for a post. The inputs here are copied from
// real mdsvex output, including the long-tag case below, which broke the first version.
import { describe, expect, test } from 'vitest';
import { enhanceImages } from './enhance-images.ts';

// What mdsvex writes around a post's body: a component script, then the HTML.
const post = (html: string) =>
	`<script>\n\timport Layout from './Layout.svelte';\n</script>\n${html}`;

describe('enhanceImages', () => {
	test('turns a local image into an import and an <enhanced:img>', () => {
		const out = enhanceImages(post('<p><img src="./a.png" alt="A diagram"></p>'), 'post.md');
		expect(out).toContain("import __image0 from './a.png?enhanced';");
		expect(out).toContain('<p><enhanced:img src={__image0} alt="A diagram" loading="lazy" /></p>');
	});

	test('handles a long tag, which mdsvex splits over several lines', () => {
		const html = '<p><img\n  src="./a.png"\n  alt="A long description of a diagram"\n></p>';
		const out = enhanceImages(post(html), 'post.md');
		expect(out).toContain("import __image0 from './a.png?enhanced';");
		expect(out).toMatch(/<enhanced:img src=\{__image0\}\s+alt="A long description of a diagram"/);
	});

	test('makes a captioned image a figure, even split over lines', () => {
		const html = '<p><img\n  src="./a.png"\n  alt="A diagram"\n  title="What it shows"\n></p>';
		const out = enhanceImages(post(html), 'post.md');
		expect(out).toMatch(
			/^<figure><enhanced:img src=\{__image0\}\s+alt="A diagram" loading="lazy" \/>/m
		);
		expect(out).toContain('<figcaption>What it shows</figcaption></figure>');
		expect(out).not.toContain('<p><figure>');
	});

	test('numbers each image', () => {
		const out = enhanceImages(
			post('<p><img src="./a.png" alt="A"></p>\n<p><img src="./b.png" alt="B"></p>'),
			'post.md'
		);
		expect(out).toContain("import __image1 from './b.png?enhanced';");
	});

	test('leaves images from other sites alone', () => {
		const code = post('<p><img src="https://example.com/a.png" alt="A"></p>');
		expect(enhanceImages(code, 'post.md')).toBe(code);
	});

	test('fails on an image without alt text, naming the file', () => {
		expect(() => enhanceImages(post('<p><img src="./a.png"></p>'), 'post.md')).toThrow(
			'post.md: ./a.png needs alt text'
		);
	});
});
