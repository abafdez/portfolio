// The CMS's block widgets: what they write is what the build reads back (through
// mdsvex's compile() and our checks), and what they read is what they wrote.
import { describe, expect, test } from 'vitest';
import { compile } from 'mdsvex/compile';
import { compileOptions } from '#lib/markdown/options.ts';
import { blockComponents } from './components.ts';

const widget = (name: string) => blockComponents().find((c) => c.id === name)!;

function roundTrip(name: string, values: Record<string, unknown>) {
	const { pattern, toBlock, fromBlock } = widget(name);
	const line = toBlock(values);
	const match = line.match(pattern);
	expect(match, line).not.toBeNull();
	return { line, back: fromBlock(match!) };
}

// The props the build gives the component for a line (the compiled Svelte, attributes only).
const built = (line: string) =>
	compile(line, { filename: '/content/blog/posts/x/x.md', ...compileOptions }).code;

describe('block widgets', () => {
	test('a video: the caption in brackets, files with ./, sizes as numbers', () => {
		const values = { src: 'clip.mp4', width: 960, height: 540, caption: 'It plays, then stops.' };
		const { line, back } = roundTrip('video', values);
		expect(line).toBe('::video[It plays, then stops.](src=./clip.mp4, width=960, height=540)');
		expect(back).toEqual(values);
		expect(built(line)).toMatch(/src="\.\/clip\.mp4" width="960" height="540"/);
	});

	test('a yt with a quoted caption, a ] in the title and a start time', () => {
		const values = {
			src: 'https://youtu.be/gd5uJ7Nlvvo?t=90',
			title: 'Plain Text [NDC]',
			caption: 'A talk, "the" talk (2022)'
		};
		const { line, back } = roundTrip('yt', values);
		expect(back).toEqual(values);
		const svelte = built(line);
		expect(svelte).toContain('{#snippet label()}Plain Text [NDC]{/snippet}');
		expect(svelte).toContain('caption="A talk, &quot;the&quot; talk (2022)"');
	});

	test('reads the lines in the posts as they are written', () => {
		const { pattern, fromBlock } = widget('yt');
		const line =
			'::yt[Plain Text, by Dylan Beattie (NDC Copenhagen 2022)](src=https://www.youtube.com/watch?v=gd5uJ7Nlvvo, thumbnail=./plain-text-talk.jpg)';
		expect(fromBlock(line.match(pattern)!)).toEqual({
			title: 'Plain Text, by Dylan Beattie (NDC Copenhagen 2022)',
			src: 'https://www.youtube.com/watch?v=gd5uJ7Nlvvo',
			thumbnail: 'plain-text-talk.jpg'
		});
	});
});
