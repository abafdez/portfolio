import { describe, expect, test } from 'vitest';
import { renderBlock } from './blocks';
import { enhanceMedia } from './enhance-media';

const video = (yaml: string) => renderBlock('video', yaml, 'post.md');
const minimal = 'src: ./clip.mp4\nwidth: 1280\nheight: 720';

describe('renderBlock', () => {
	test('a language that is not a block is left to the highlighter', () => {
		expect(renderBlock('ts', 'const a = 1;', 'post.md')).toBeUndefined();
		expect(renderBlock(undefined, 'text', 'post.md')).toBeUndefined();
		// Not one of the object's built-in keys either.
		expect(renderBlock('toString', '', 'post.md')).toBeUndefined();
	});

	test('a video with the required fields', () => {
		expect(video(minimal)).toBe(
			'<video width="1280" height="720" controls muted playsinline preload="metadata">' +
				'<source src="./clip.mp4" type="video/mp4" /></video>'
		);
	});

	test('WebM goes first, then MP4; a poster; a caption makes it a figure', () => {
		const out = video(
			`${minimal}\nwebm: ./clip.webm\nposter: ./clip.png\ncaption: The list jumps.`
		);
		expect(out).toMatch(/^<figure><video [^>]* poster="\.\/clip\.png">/);
		expect(out).toContain(
			'<source src="./clip.webm" type="video/webm" /><source src="./clip.mp4" type="video/mp4" />'
		);
		expect(out).toMatch(/<\/video><figcaption>The list jumps\.<\/figcaption><\/figure>$/);
	});

	test('the caption is text, not HTML or Svelte code', () => {
		expect(video(`${minimal}\ncaption: "<b> & {x}"`)).toContain(
			'<figcaption>&#60;b&#62; &#38; &#123;x&#125;</figcaption>'
		);
	});

	test('the files become imports, like a <video> written as HTML', () => {
		const svelte = `<script>\n</script>\n${video(`${minimal}\nwebm: ./clip.webm`)}`;
		const out = enhanceMedia(svelte, 'post.md');
		expect(out).toContain("import __file0 from './clip.webm';");
		expect(out).toContain('<source src={__file1} type="video/mp4" />');
	});

	test.each([
		[
			'a missing field',
			'src: ./clip.mp4\nwidth: 1280',
			/post\.md: the ```video block needs a "height" field/
		],
		[
			'an unknown field',
			`${minimal}\nautoplay: true`,
			/has no "autoplay" field\. Its fields: src, webm/
		],
		[
			'a size that is not a number',
			'src: ./clip.mp4\nwidth: wide\nheight: 720',
			/"width" should be a size in pixels/
		],
		[
			'a file without ./',
			'src: clip.mp4\nwidth: 1280\nheight: 720',
			/"src" should be a file next to the post/
		],
		['a caption YAML reads as a number', `${minimal}\ncaption: 2026`, /"caption" should be text/],
		['a list instead of fields', '- src: ./clip.mp4', /needs its fields, one per line/],
		['broken YAML', 'src: [./clip.mp4', /isn't valid YAML/]
	])('fails on %s', (_, yaml, error) => {
		expect(() => video(yaml)).toThrow(error);
	});
});
