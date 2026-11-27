import { describe, expect, test } from 'vitest';
import { checkBlock, youtubeUrl } from './blocks';

// What the blocks draw is tested through the real renderers (markdown/render.test.ts);
// here, what checkBlock() gives and what fails the build.
const minimal = { src: './clip.mp4', width: '1280', height: '720' };
const video = (args: Record<string, string>, hasLabel = false) =>
	checkBlock('video', args, hasLabel, 'post.md');

describe('checkBlock', () => {
	test('gives the arguments as strings, with no label field among them', () => {
		expect(video({ ...minimal, webm: './clip.webm' }, true)).toEqual({
			...minimal,
			webm: './clip.webm'
		});
	});

	test('unescapes a \\" in a quoted value', () => {
		expect(
			checkBlock(
				'yt',
				{ src: 'https://youtu.be/gd5uJ7Nlvvo', caption: 'He said \\"hi\\"' },
				true,
				'post.md'
			).caption
		).toBe('He said "hi"');
	});

	test.each([
		[
			'a missing field',
			{ src: './clip.mp4', width: '1280' },
			/post\.md: ::video needs a "height" argument/
		],
		[
			'an unknown argument',
			{ ...minimal, autoplay: 'true' },
			/has no "autoplay" argument\. Its arguments: src, webm/
		],
		[
			'a size that is not a number',
			{ ...minimal, width: 'wide' },
			/"width" should be a size in pixels/
		],
		['a size of 0', { ...minimal, height: '0' }, /"height" should be a size in pixels/],
		[
			'a file without ./',
			{ ...minimal, src: 'clip.mp4' },
			/"src" should be a file next to the post/
		],
		[
			'the label field as an argument',
			{ ...minimal, caption: 'x' },
			/takes its caption in the brackets/
		]
	])('fails on %s', (_, args, error) => {
		expect(() => video(args)).toThrow(error);
	});

	test('yt fails on a link that is not YouTube, and without a title in brackets', () => {
		expect(() => checkBlock('yt', { src: 'https://vimeo.com/123' }, true, 'post.md')).toThrow(
			'should be a YouTube link'
		);
		expect(() =>
			checkBlock('yt', { src: 'https://youtu.be/gd5uJ7Nlvvo' }, false, 'post.md')
		).toThrow('needs its title in brackets');
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
