// Our block directives (::yt, ::video…) as Sveltia editor components, generated from the
// registry the build uses (src/lib/blocks.ts), so a new block needs no CMS code.
// Each one is edited in a dialog. In the editor it shows as one line (its name and label):
// the preview pane next to it draws the real block with the site's own component.
//
//   ::video[The caption](src=./clip.mp4, width=1280, height=720)
//
// The label field goes in the brackets, the others are arguments in the block's order.
import { blocks } from '#lib/blocks.ts';

type Values = Record<string, unknown>;

const widgets = {
	text: { widget: 'string' },
	youtube: { widget: 'string', hint: 'Any YouTube link' },
	file: { widget: 'file' },
	size: { widget: 'number', value_type: 'int' }
};

// Our blocks write files as "./clip.webm"; Sveltia's file field may hold "clip.webm".
const dotted = (value: string) => (value && !value.startsWith('./') ? `./${value}` : value);
const undotted = (value: string) => value.replace(/^\.\//, '');

// The text in brackets: a [, ] or \ in it is escaped, as markdown reads it back.
const label = (text: string) => text.replace(/[\\[\]]/g, (c) => `\\${c}`);
const unlabel = (text: string) => text.replace(/\\([\\[\]])/g, '$1');

// An argument's value, in double quotes when it has a space, a comma, a parenthesis or a
// quote (a quote inside is escaped).
const argument = (value: string) =>
	/[\s,()"]/.test(value) ? `"${value.replace(/["\\]/g, (c) => `\\${c}`)}"` : value;

// name=value, name="a, b" → { name: value }
function readArgs(text: string): Record<string, string> {
	const args: Record<string, string> = {};
	for (const match of text.matchAll(/([\w-]+)=("(?:\\.|[^"\\])*"|[^,]*)/g)) {
		const [, name, raw] = match;
		args[name] = raw.startsWith('"') ? raw.slice(1, -1).replace(/\\(.)/g, '$1') : raw.trim();
	}
	return args;
}

export function blockComponents() {
	return Object.entries(blocks).map(([name, block]) => {
		const fields = Object.entries(block.fields);
		const isFile = (field: string) => block.fields[field]?.kind === 'file';
		return {
			id: name,
			label: name,
			icon: name === 'video' ? 'movie' : 'smart_display',
			mode: 'dialog',
			summary: `${name}: {{${block.label}}}`,
			fields: fields.map(([field, { kind, required }]) => ({
				name: field,
				label: field,
				required,
				...widgets[kind]
			})),
			// A whole line: ::name, an optional [label] (\] escapes a bracket), (arguments).
			pattern: new RegExp(
				`^::${name}(?:\\[(?<label>(?:\\\\.|[^\\]\\\\])*)\\])?(?:\\((?<args>.*)\\))?$`,
				'm'
			),
			fromBlock(match: RegExpMatchArray) {
				const values: Values = {};
				const text = match.groups?.label;
				if (text) values[block.label] = unlabel(text);
				for (const [field, value] of Object.entries(readArgs(match.groups?.args ?? ''))) {
					const kind = block.fields[field]?.kind;
					values[field] = kind === 'size' ? Number(value) : isFile(field) ? undotted(value) : value;
				}
				return values;
			},
			toBlock(values: Values) {
				const given = (field: string) => {
					const value = values[field];
					return value === undefined || value === null || value === '' ? undefined : String(value);
				};
				const text = given(block.label);
				const args = fields
					.filter(([field]) => field !== block.label && given(field) !== undefined)
					.map(([field]) => {
						const value = given(field)!;
						return `${field}=${argument(isFile(field) ? dotted(value) : value)}`;
					});
				return `::${name}${text ? `[${label(text)}]` : ''}(${args.join(', ')})`;
			},
			// Text, so < and & are written as entities: the editor reads this as HTML.
			toPreview(values: Values) {
				const title = String(values[block.label] ?? '').replace(
					/[&<]/g,
					(c) => `&#${c.charCodeAt(0)};`
				);
				return `<p><strong>${name}</strong> ${title}</p>`;
			}
		};
	});
}
