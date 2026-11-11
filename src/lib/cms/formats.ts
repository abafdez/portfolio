// The file formats the CMS reads and writes with: ours (src/lib/content-files.ts), then
// Prettier with the repo's own config, so a saved file passes `pnpm lint` and an unedited
// one comes back byte for byte (content-files.test.ts checks every file in content/).
import * as prettier from 'prettier/standalone';
import * as markdown from 'prettier/plugins/markdown';
import * as yaml from 'prettier/plugins/yaml';
import config from '../../../prettier.config.js';
import { readEntry, readList, writeEntry, writeList } from '#lib/content-files.ts';

// The plugin and overrides are for .svelte files, which the CMS never writes.
const { plugins: _plugins, overrides: _overrides, ...options } = config;
const pretty = (text: string, parser: 'markdown' | 'yaml') =>
	prettier.format(text, { ...options, parser, plugins: [markdown, yaml] });

type Data = Record<string, unknown>;

// name → the extension and the two functions Sveltia's registerCustomFormat() takes.
export const formats = {
	entry: {
		extension: 'md',
		fromFile: readEntry,
		toFile: (data: Data) => pretty(writeEntry(data), 'markdown')
	},
	list: {
		extension: 'yaml',
		fromFile: readList,
		toFile: (data: Data) => pretty(writeList(data), 'yaml')
	}
};
