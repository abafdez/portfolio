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
// highlight() in vite.config.ts asks renderBlock() first; mdsvex hands it every code
// block with its language and the file's name. Its own file so it can be unit-tested
// (blocks.test.ts).
import { parse } from 'yaml';

// What a field may hold. A file is a path next to the post (./clip.mp4): the markdown
// step turns it into an import (enhance-media.ts), so a missing file fails the build.
type Kind = 'text' | 'file' | 'size';
type Field = { kind: Kind; required: boolean };
const required = <K extends Kind>(kind: K) => ({ kind, required: true as const });
const optional = <K extends Kind>(kind: K) => ({ kind, required: false as const });

// The values render() gets: a size is a number, the rest strings, and an optional field
// may be missing. Worked out from the fields, so render() can't use one that isn't there.
type Value<F extends Field> = F['kind'] extends 'size' ? number : string;
type Values<Fields extends Record<string, Field>> = {
	[Name in keyof Fields]: Fields[Name]['required'] extends true
		? Value<Fields[Name]>
		: Value<Fields[Name]> | undefined;
};

type Block = { fields: Record<string, Field>; render: (values: never) => string };
function block<Fields extends Record<string, Field>>(
	fields: Fields,
	render: (values: Values<Fields>) => string
) {
	return { fields, render };
}

// render() returns markup for the post's Svelte file. Plain HTML here; a block that needs
// JS could return a component, <Components.Name …/>, like CodeBlock.
export const blocks: Record<string, Block> = {
	// A short screen recording: no sound, no autoplay, the reader presses play. The
	// <video> rules (why each attribute) are in content/blog/published/README.md.
	video: block(
		{
			src: required('file'), // MP4 plays everywhere
			webm: optional('file'), // smaller; played first when the browser can
			poster: optional('file'), // shown before it plays, at the video's size
			width: required('size'), // the size it was exported at: its space is kept
			height: required('size'), // before the file arrives, so the page doesn't jump
			caption: optional('text') // a video has no alt text: say what it shows
		},
		({ src, webm, poster, width, height, caption }) => {
			const sources = [webm, src]
				.filter((file) => file !== undefined)
				.map((file) => `<source src="${escape(file)}" type="${videoType(file)}" />`);
			const video =
				`<video width="${width}" height="${height}" controls muted playsinline preload="metadata"` +
				(poster ? ` poster="${escape(poster)}"` : '') +
				`>${sources.join('')}</video>`;
			return caption
				? `<figure>${video}<figcaption>${escape(caption)}</figcaption></figure>`
				: video;
		}
	)
};

// The markup for a ```name block, or undefined if name isn't one of ours (then it's
// highlighted as code). Fails the build on fields the block doesn't have, on missing
// required ones, and on a value of the wrong kind, naming the file.
export function renderBlock(lang: string | null | undefined, code: string, file: string) {
	if (!lang || !Object.hasOwn(blocks, lang)) return;
	const { fields, render } = blocks[lang];
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
	return render(given as never);
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
	if (kind === 'file' && !value.startsWith('./')) {
		return `should be a file next to the post, starting with ./ (got "${value}")`;
	}
}

function videoType(file: string) {
	return file.endsWith('.webm') ? 'video/webm' : 'video/mp4';
}

// Text into HTML, and into a Svelte file: < & " as entities so they show as text, and
// { } too, which Svelte would read as code.
function escape(text: string) {
	return text.replace(/[&<>"{}]/g, (c) => `&#${c.charCodeAt(0)};`);
}
