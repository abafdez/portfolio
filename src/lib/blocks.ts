// Block components: a leaf directive whose name is one of the blocks below, its label
// (the text in brackets) and fields as arguments, drawn by the block's component.
//
//   ::video[The filters appear after the list has loaded.](src=./filters.mp4, width=1280, height=720)
//   ::yt[Plain Text, by Dylan Beattie](src=https://youtu.be/gd5uJ7Nlvvo, thumbnail=./talk.jpg)
//
// Anywhere else (Obsidian, GitHub, a plain editor) it's a line of text that still reads.
// The blocks plugin (markdown/blocks-plugin.ts) checks each one with checkBlock() (a
// wrong field fails the build there) and draws it with its component (markdown/blocks/; a
// test checks each block has one). The CMS makes its editor components from the same
// fields (src/lib/cms/components.ts). Its own file so it can be unit-tested (blocks.test.ts).
// Until 2026-11-27 the blocks were code fences with YAML fields (```video); a fence left
// over fails the build.
import { youtubeId } from './markdown/blocks/values.ts';

// The helpers the block components use live in values.ts, so the browser gets only
// those; they're re-exported here for the rest.
export { videoType, watchOnYoutube, youtubeId, youtubeUrl } from './markdown/blocks/values.ts';

// What a field may hold. A file is a path next to the post (./clip.mp4): markdown/blocks-plugin.ts lists it
// and markdown/media.ts loads it, so a missing file fails the build.
// A youtube is a link to a video on youtube.com or youtu.be.
type Kind = 'text' | 'file' | 'size' | 'youtube';
type Field = { kind: Kind; required: boolean };
const required = (kind: Kind): Field => ({ kind, required: true });
const optional = (kind: Kind): Field => ({ kind, required: false });

// Each block's fields, in the order the CMS shows them and writes them. `label` names the
// field written in the brackets, the text a reader sees (drawn as inline markdown).
export const blocks: Record<string, { label: string; fields: Record<string, Field> }> = {
	// A short screen recording: no sound, no autoplay, the reader presses play. The
	// <video> rules (why each attribute) are in content/blog/posts/README.md.
	video: {
		label: 'caption',
		fields: {
			src: required('file'), // MP4 plays everywhere
			webm: optional('file'), // smaller; played first when the browser can
			poster: optional('file'), // shown before it plays, at the video's size
			width: required('size'), // the size it was exported at: its space is kept
			height: required('size'), // before the file arrives, so the page doesn't jump
			caption: optional('text') // a video has no alt text: say what it shows
		}
	},

	// A YouTube video, without YouTube on the page: its picture and title, as a link that
	// opens it on youtube.com in a new tab. An embedded player loads Google's scripts and
	// cookies on every visit, watched or not; this loads nothing from Google until the
	// reader clicks. The thumbnail is a file next to the post for the same reason (one
	// from i.ytimg.com would be a request to Google too). Without one, a blueprint tile.
	yt: {
		label: 'title',
		fields: {
			src: required('youtube'),
			title: required('text'), // the link's text: what the reader is about to open
			thumbnail: optional('file'), // 16:9; YouTube's 4:3 ones get their bars cropped
			caption: optional('text')
		}
	}
};

// A ::name directive's arguments, checked. Fails the build on arguments the block
// doesn't have, on missing required fields (the label one is the text in brackets), and
// on a value of the wrong kind, naming the file. Gives the arguments as the components
// take them: strings, an escaped \" in a quoted value unescaped.
export function checkBlock(
	name: string,
	args: Record<string, string>,
	hasLabel: boolean,
	file: string
): Record<string, string> {
	const { label, fields } = blocks[name];
	const fail = (problem: string): never => {
		throw new Error(`${file}: ::${name} ${problem}`);
	};

	const names = Object.keys(fields).filter((field) => field !== label);
	for (const arg of Object.keys(args)) {
		if (arg === label) fail(`takes its ${label} in the brackets: ::${name}[…](…)`);
		if (!Object.hasOwn(fields, arg))
			fail(`has no "${arg}" argument. Its arguments: ${names.join(', ')}`);
	}
	const values: Record<string, string> = {};
	for (const [field, { kind, required }] of Object.entries(fields)) {
		if (field === label) {
			if (required && !hasLabel) fail(`needs its ${label} in brackets: ::${name}[The ${label}](…)`);
			continue;
		}
		const value = args[field]?.replaceAll('\\"', '"');
		if (value === undefined || value === '') {
			if (required) fail(`needs a "${field}" argument`);
			continue;
		}
		const problem = check(kind, value);
		if (problem) fail(`"${field}" ${problem}`);
		values[field] = value;
	}
	return values;
}

// What's wrong with a value, or undefined if nothing.
function check(kind: Kind, value: string): string | undefined {
	if (kind === 'size' && !/^[1-9]\d*$/.test(value)) {
		return `should be a size in pixels, like 1280 (got "${value}")`;
	}
	if (kind === 'youtube' && !youtubeId(value)) {
		return `should be a YouTube link, like https://www.youtube.com/watch?v=… (got "${value}")`;
	}
	if (kind === 'file' && !value.startsWith('./')) {
		return `should be a file next to the post, starting with ./ (got "${value}")`;
	}
}
