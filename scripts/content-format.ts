// pnpm content:format: rewrites every file in content/ the way the CMS saves it
// (src/lib/content-files.ts, then Prettier with the repo's config). Run it after editing
// frontmatter by hand (in Obsidian, say), so the CMS's next save changes only what it
// edits. content-files.test.ts fails while a file isn't in this shape.
import { globSync, readFileSync, writeFileSync } from 'node:fs';
import { format } from 'prettier';
import config from '../prettier.config.js';
import { readEntry, readList, writeEntry, writeList } from '../src/lib/content-files.ts';

const { plugins: _plugins, overrides: _overrides, ...options } = config;
const entries = globSync('content/{blog,bitacora}/**/*.md').filter(
	(f) => !f.endsWith('README.md') && !f.includes('/.preview')
);
const lists = globSync('content/awesome/*.yaml');

let changed = 0;
for (const file of [...entries, ...lists]) {
	const text = readFileSync(file, 'utf8');
	const list = file.endsWith('.yaml');
	const saved = list ? writeList(readList(text)) : writeEntry(readEntry(text));
	const out = await format(saved, { ...options, parser: list ? 'yaml' : 'markdown' });
	if (out !== text) {
		writeFileSync(file, out);
		changed++;
		console.log(file);
	}
}
console.log(`${changed} of ${entries.length + lists.length} files rewritten`);
