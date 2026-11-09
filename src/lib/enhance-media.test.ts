// enhanceMedia() gets what mdsvex writes for a post. The inputs here are copied from
// real mdsvex output, including the long-tag case below, which broke the first version.
import { describe, expect, test } from 'vitest';
import { enhanceMedia } from './enhance-media.ts';

// What mdsvex writes around a post's body: a component script, then the HTML.
const post = (html: string) =>
	`<script>\n\timport Layout from './Layout.svelte';\n</script>\n${html}`;

describe('enhanceMedia: images', () => {
	test('turns a local image into an import and an <enhanced:img>', () => {
		const out = enhanceMedia(post('<p><img src="./a.png" alt="A diagram"></p>'), 'post.md');
		expect(out).toContain("import __image0 from './a.png?enhanced';");
		expect(out).toContain('<p><enhanced:img src={__image0} alt="A diagram" loading="lazy" /></p>');
	});

	test('handles a long tag, which mdsvex splits over several lines', () => {
		const html = '<p><img\n  src="./a.png"\n  alt="A long description of a diagram"\n></p>';
		const out = enhanceMedia(post(html), 'post.md');
		expect(out).toContain("import __image0 from './a.png?enhanced';");
		expect(out).toMatch(/<enhanced:img src=\{__image0\}\s+alt="A long description of a diagram"/);
	});

	test('makes a captioned image a figure, even split over lines', () => {
		const html = '<p><img\n  src="./a.png"\n  alt="A diagram"\n  title="What it shows"\n></p>';
		const out = enhanceMedia(post(html), 'post.md');
		expect(out).toMatch(
			/^<figure><enhanced:img src=\{__image0\}\s+alt="A diagram" loading="lazy" \/>/m
		);
		expect(out).toContain('<figcaption>What it shows</figcaption></figure>');
		expect(out).not.toContain('<p><figure>');
	});

	test('numbers each image', () => {
		const out = enhanceMedia(
			post('<p><img src="./a.png" alt="A"></p>\n<p><img src="./b.png" alt="B"></p>'),
			'post.md'
		);
		expect(out).toContain("import __image1 from './b.png?enhanced';");
	});

	test('leaves images from other sites alone', () => {
		const code = post('<p><img src="https://example.com/a.png" alt="A"></p>');
		expect(enhanceMedia(code, 'post.md')).toBe(code);
	});

	test('fails on an image without alt text, naming the file', () => {
		expect(() => enhanceMedia(post('<p><img src="./a.png"></p>'), 'post.md')).toThrow(
			'post.md: ./a.png needs alt text'
		);
	});

	// What mdsvex 0.12 makes of ![A "quoted" word](./a.png): the quotes aren't escaped.
	test.each([
		['<p><img src="./a.png" alt="A "quoted" word"></p>'],
		['<p><img src="./a.png" alt="A" title="Cap "x""></p>']
	])('fails on a double quote in alt text or a caption: %s', (html) => {
		expect(() => enhanceMedia(post(html), 'post.md')).toThrow(
			'post.md: ./a.png has a double quote in its alt text or caption'
		);
	});

	test('an explicit alt="" (a decorative picture from a block) is allowed', () => {
		const out = enhanceMedia(post('<p><img src="./a.png" alt="" /></p>'), 'post.md');
		expect(out).toContain('<enhanced:img src={__image0} alt="" loading="lazy" />');
	});

	test("single and curly quotes are fine: ![It's “big”](./a.png)", () => {
		const out = enhanceMedia(post('<p><img src="./a.png" alt="It\'s “big”"></p>'), 'post.md');
		expect(out).toContain('alt="It\'s “big”"');
	});
});

describe('enhanceMedia: videos', () => {
	const video = (attributes: string, children = '') =>
		post(`<video${attributes} controls muted>${children}</video>`);

	test('turns a local video into an import, used as it is', () => {
		const out = enhanceMedia(video(' src="./clip.mp4" width="1280" height="720"'), 'post.md');
		expect(out).toContain("import __file0 from './clip.mp4';");
		expect(out).toContain('<video src={__file0} width="1280" height="720" controls muted>');
	});

	test('imports a poster and every <source> and <track>', () => {
		const out = enhanceMedia(
			video(
				' width="1280" height="720" poster="./clip.png"',
				'<source src="./clip.webm" type="video/webm"><source src="./clip.mp4" type="video/mp4"><track kind="captions" src="./clip.vtt">'
			),
			'post.md'
		);
		expect(out).toContain('poster={__file0}');
		expect(out).toContain('<source src={__file1} type="video/webm">');
		expect(out).toContain('<source src={__file2} type="video/mp4">');
		expect(out).toContain('<track kind="captions" src={__file3}>');
		expect(out).toContain("import __file3 from './clip.vtt';");
	});

	test('numbers images and videos together, so no two imports share a name', () => {
		const out = enhanceMedia(
			post(
				'<p><img src="./a.png" alt="A"></p>\n<video src="./clip.mp4" width="1280" height="720"></video>'
			),
			'post.md'
		);
		expect(out).toContain("import __image0 from './a.png?enhanced';");
		expect(out).toContain("import __file1 from './clip.mp4';");
	});

	test('leaves videos from other sites alone', () => {
		const code = video(' src="https://example.com/clip.mp4" width="1280" height="720"');
		expect(enhanceMedia(code, 'post.md')).toBe(code);
	});

	test('fails on a video without width and height, naming the file', () => {
		expect(() => enhanceMedia(video(' src="./clip.mp4" width="1280"'), 'post.md')).toThrow(
			'post.md: a <video> needs width and height'
		);
	});
});
