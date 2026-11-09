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

describe('yt', () => {
	const yt = (yaml: string, file = 'post.md') => renderBlock('yt', yaml, file)!;
	const minimal = 'src: https://www.youtube.com/watch?v=gd5uJ7Nlvvo\ntitle: Plain Text';

	test('a link that opens YouTube in a new tab, and nothing from Google on the page', () => {
		const out = yt(minimal);
		expect(out).toContain(
			'<a href="https://www.youtube.com/watch?v=gd5uJ7Nlvvo" target="_blank" rel="external noopener noreferrer">'
		);
		expect(out).toContain('<span class="yt-title">Plain Text</span>');
		expect(out).toContain('opens in a new tab');
		expect(out).not.toMatch(/<iframe|<script|ytimg|youtube-nocookie/);
	});

	test('in the post’s language', () => {
		expect(yt(minimal, 'post.es.md')).toContain('se abre en una pestaña nueva');
	});

	test.each([
		'https://youtu.be/gd5uJ7Nlvvo',
		'https://m.youtube.com/watch?v=gd5uJ7Nlvvo&feature=share',
		'https://www.youtube.com/embed/gd5uJ7Nlvvo',
		'https://www.youtube.com/shorts/gd5uJ7Nlvvo'
	])('any link shape becomes the same link: %s', (src) => {
		expect(yt(`src: ${src}\ntitle: T`)).toContain(
			'href="https://www.youtube.com/watch?v=gd5uJ7Nlvvo"'
		);
	});

	test('keeps a start time', () => {
		expect(yt('src: https://youtu.be/gd5uJ7Nlvvo?t=90\ntitle: T')).toContain(
			'href="https://www.youtube.com/watch?v=gd5uJ7Nlvvo&#38;t=90"'
		);
	});

	test('a thumbnail next to the post, decorative (the title names the link), and a caption', () => {
		const out = yt(`${minimal}\nthumbnail: ./talk.jpg\ncaption: Dylan Beattie on plain text.`);
		expect(out).toContain('<img src="./talk.jpg" alt="" />');
		expect(out).toContain('<figcaption>Dylan Beattie on plain text.</figcaption>');
		// The markdown step makes the thumbnail an import (a missing file fails the build).
		expect(enhanceMedia(`<script>\n</script>\n${out}`, 'post.md')).toContain(
			"import __image0 from './talk.jpg?enhanced';"
		);
	});

	test('fails on a link that is not YouTube, and without a title', () => {
		expect(() => yt('src: https://vimeo.com/123\ntitle: T')).toThrow('should be a YouTube link');
		expect(() => yt('src: https://www.youtube.com/watch?v=gd5uJ7Nlvvo')).toThrow(
			'needs a "title" field'
		);
	});
});
