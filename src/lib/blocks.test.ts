import { describe, expect, test } from 'vitest';
import { readBlock, youtubeUrl } from './blocks';

// What the blocks draw is tested through the real renderers (markdown/render.test.ts);
// here, which blocks exist and what fails the build.
const video = (yaml: string) => readBlock('video', yaml, 'post.md');
const minimal = 'src: ./clip.mp4\nwidth: 1280\nheight: 720';

describe('readBlock', () => {
	test('a language that is not a block is left to the highlighter', () => {
		expect(readBlock('ts', 'const a = 1;', 'post.md')).toBeUndefined();
		expect(readBlock(undefined, 'text', 'post.md')).toBeUndefined();
		// Not one of the object's built-in keys either.
		expect(readBlock('toString', '', 'post.md')).toBeUndefined();
	});

	test('gives the block and its values', () => {
		expect(video(`${minimal}\ncaption: It plays`)).toEqual({
			name: 'video',
			values: { src: './clip.mp4', width: 1280, height: 720, caption: 'It plays' }
		});
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

	test('yt fails on a link that is not YouTube, and without a title', () => {
		expect(() => readBlock('yt', 'src: https://vimeo.com/123\ntitle: T', 'post.md')).toThrow(
			'should be a YouTube link'
		);
		expect(() =>
			readBlock('yt', 'src: https://www.youtube.com/watch?v=gd5uJ7Nlvvo', 'post.md')
		).toThrow('needs a "title" field');
	});
});

describe('youtubeUrl', () => {
	test.each([
		'https://youtu.be/gd5uJ7Nlvvo',
		'https://m.youtube.com/watch?v=gd5uJ7Nlvvo&feature=share',
		'https://www.youtube.com/embed/gd5uJ7Nlvvo',
		'https://www.youtube.com/shorts/gd5uJ7Nlvvo'
	])('any link shape becomes the same link: %s', (src) => {
		expect(youtubeUrl(src)).toBe('https://www.youtube.com/watch?v=gd5uJ7Nlvvo');
	});

	test('keeps a start time', () => {
		expect(youtubeUrl('https://youtu.be/gd5uJ7Nlvvo?t=90')).toBe(
			'https://www.youtube.com/watch?v=gd5uJ7Nlvvo&t=90'
		);
	});
});
