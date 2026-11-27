// Fenced-block components: a code block whose language is one of the names below, with
// YAML fields as its body, becomes that component instead of highlighted code.
//
//   ```video
//   src: ./filters.mp4
//   width: 1280
//   height: 720
//   caption: The filters appear after the list has loaded.
//   ```
//
// Anywhere else (Obsidian, GitHub, a plain editor) it's a readable block of YAML.
// The blocks plugin (markdown/blocks-plugin.ts) reads each of these fences with readBlock() (a
// wrong field fails the build there) and draws it with its component (markdown/blocks/; a
// test checks each block has one). The CMS makes its editor
// components from the same fields (src/lib/cms/components.ts). Its own file so it can be
// unit-tested (blocks.test.ts).
import { parse } from 'yaml';
import { youtubeId } from './markdown/blocks/values.ts';

// The helpers the block components use live in values.ts (no YAML parser for the
// browser); they're re-exported here for the rest.
export { videoType, watchOnYoutube, youtubeId, youtubeUrl } from './markdown/blocks/values.ts';

// What a field may hold. A file is a path next to the post (./clip.mp4): markdown/blocks-plugin.ts lists it
// and markdown/media.ts loads it, so a missing file fails the build.
// A youtube is a link to a video on youtube.com or youtu.be.
type Kind = 'text' | 'file' | 'size' | 'youtube';
type Field = { kind: Kind; required: boolean };
const required = (kind: Kind): Field => ({ kind, required: true });
const optional = (kind: Kind): Field => ({ kind, required: false });

// Each block's fields, in the order the CMS shows them and writes them.
export const blocks: Record<string, { fields: Record<string, Field> }> = {
	// A short screen recording: no sound, no autoplay, the reader presses play. The
	// <video> rules (why each attribute) are in content/blog/posts/README.md.
	video: {
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
		fields: {
			src: required('youtube'),
			title: required('text'), // the link's text: what the reader is about to open
			thumbnail: optional('file'), // 16:9; YouTube's 4:3 ones get their bars cropped
			caption: optional('text')
		}
	}
};

// A ```name block's fields, checked, or undefined if name isn't one of ours. Fails the
// build on fields the block doesn't have, on missing required ones, and on a value of
// the wrong kind, naming the file. The components in markdown/blocks/ take these values.
export function readBlock(
	lang: string | null | undefined,
	code: string,
	file: string
): { name: string; values: Record<string, unknown> } | undefined {
	if (!lang || !Object.hasOwn(blocks, lang)) return;
	const { fields } = blocks[lang];
	const fail = (problem: string): never => {
		throw new Error(`${file}: the \`\`\`${lang} block ${problem}`);
	};

	let values: unknown;
	try {
		values = parse(code);
	} catch (error) {
		fail(`isn't valid YAML: ${(error as Error).message}`);
	}
	if (typeof values !== 'object' || values === null || Array.isArray(values)) {
		return fail('needs its fields, one per line: "name: value"');
	}
	const given = values as Record<string, unknown>;

	const names = Object.keys(fields);
	for (const name of Object.keys(given)) {
		if (!Object.hasOwn(fields, name))
			fail(`has no "${name}" field. Its fields: ${names.join(', ')}`);
	}
	for (const [name, field] of Object.entries(fields)) {
		const value = given[name];
		if (value === undefined || value === null) {
			if (field.required) fail(`needs a "${name}" field`);
			continue;
		}
		const problem = check(field.kind, value);
		if (problem) fail(`"${name}" ${problem}`);
	}
	return { name: lang, values: given };
}

// What's wrong with a value, or undefined if nothing.
function check(kind: Kind, value: unknown): string | undefined {
	if (kind === 'size') {
		return Number.isInteger(value) && (value as number) > 0
			? undefined
			: 'should be a size in pixels, like 1280';
	}
	if (typeof value !== 'string')
		return 'should be text (in quotes if YAML reads it as something else)';
	if (kind === 'youtube' && !youtubeId(value)) {
		return `should be a YouTube link, like https://www.youtube.com/watch?v=… (got "${value}")`;
	}
	if (kind === 'file' && !value.startsWith('./')) {
		return `should be a file next to the post, starting with ./ (got "${value}")`;
	}
}
