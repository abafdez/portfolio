// Our fenced-block components (```yt, ```video…) as Sveltia editor components, generated
// from the registry the build uses (src/lib/blocks.ts), so a new block needs no CMS code.
// Each one is edited in a dialog and previewed with the block's own render().
import { parse, stringify } from 'yaml';
import { blocks } from '#lib/blocks.ts';

type Values = Record<string, unknown>;

const widgets = {
	text: { widget: 'string' },
	youtube: { widget: 'string', hint: 'Any YouTube link' },
	file: { widget: 'file' },
	size: { widget: 'number', value_type: 'int' }
};

// One "name: value" line, quoted only when YAML needs it, never folded.
const line = (name: string, value: unknown) =>
	`${name}: ${stringify(value, { lineWidth: 0 }).trimEnd()}`;

// Our blocks write files as "./clip.webm"; Sveltia's file field may hold "clip.webm".
const dotted = (value: unknown) =>
	typeof value === 'string' && value && !value.startsWith('./') ? `./${value}` : value;
const undotted = (value: unknown) =>
	typeof value === 'string' ? value.replace(/^\.\//, '') : value;

export function blockComponents() {
	return Object.entries(blocks).map(([name, block]) => {
		const fields = Object.entries(block.fields);
		const isFile = (field: string) => block.fields[field]?.kind === 'file';
		const titleField = fields.find(([, field]) => field.kind === 'text')?.[0] ?? fields[0][0];
		return {
			id: name,
			label: name,
			icon: name === 'video' ? 'movie' : 'smart_display',
			mode: 'dialog',
			summary: `${name}: {{${titleField}}}`,
			fields: fields.map(([field, { kind, required }]) => ({
				name: field,
				label: field,
				required,
				...widgets[kind]
			})),
			// A whole fenced block: ```name, its YAML, ``` (m: ^ and $ match at line ends).
			pattern: new RegExp(`^\`\`\`${name}\\n(?<yaml>[\\s\\S]*?)\\n\`\`\`$`, 'm'),
			fromBlock(match: RegExpMatchArray) {
				const values: Values = parse(match.groups?.yaml ?? '') ?? {};
				return Object.fromEntries(
					Object.entries(values).map(([k, v]) => [k, isFile(k) ? undotted(v) : v])
				);
			},
			toBlock(values: Values) {
				const lines = fields
					.map(([field]) => [field, values[field]] as const)
					.filter(([, value]) => value !== undefined && value !== null && value !== '')
					.map(([field, value]) => line(field, isFile(field) ? dotted(value) : value));
				return `\`\`\`${name}\n${lines.join('\n')}\n\`\`\``;
			},
			toPreview(values: Values) {
				try {
					const withDots = Object.fromEntries(
						Object.entries(values).map(([k, v]) => [k, isFile(k) ? dotted(v) : v])
					);
					return block.render(withDots as never, 'post.md');
				} catch {
					return `<p>${name}: fill in its fields</p>`;
				}
			}
		};
	});
}
