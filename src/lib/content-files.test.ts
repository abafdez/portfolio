import { globSync, readFileSync } from 'node:fs';
import { format } from 'prettier';
import { describe, expect, test } from 'vitest';
import config from '../../prettier.config.js';
import { readEntry, readList, writeEntry, writeList } from './content-files.ts';

// The options pnpm lint checks with; the plugin and overrides are for .svelte files only.
const { plugins: _plugins, overrides: _overrides, ...options } = config;
const pretty = (text: string, parser: 'markdown' | 'yaml') => format(text, { ...options, parser });

// What the CMS saves when nothing was edited must be the file as it is: then a save only
// ever changes what was edited.
describe('every content file survives a save unchanged', () => {
	const entries = globSync('content/{blog,bitacora}/**/*.md').filter(
		(f) => !f.endsWith('README.md') && !f.includes('/.preview')
	);
	const lists = globSync('content/awesome/*.yaml');

	test('finds the files', () => {
		expect(entries.length).toBeGreaterThan(100);
		expect(lists.length).toBeGreaterThan(0);
	});

	test.each(entries)('%s', async (file) => {
		const text = readFileSync(file, 'utf8');
		expect(await pretty(writeEntry(readEntry(text)), 'markdown')).toBe(text);
	});

	test.each(lists)('%s', async (file) => {
		const text = readFileSync(file, 'utf8');
		expect(await pretty(writeList(readList(text)), 'yaml')).toBe(text);
	});
});

describe('writeEntry', () => {
	test('keeps short lists on one line and quotes only where YAML needs it', () => {
		const text = writeEntry({
			tags: ['css', 'dark-mode'],
			title: 'Dark mode: a toggle',
			date: '2026-11-09',
			body: 'Hello.'
		});
		expect(text).toBe(
			"---\ntitle: 'Dark mode: a toggle'\ndate: 2026-11-09\ntags: [css, dark-mode]\n---\n\nHello.\n"
		);
	});

	test('leaves out empty fields', () => {
		expect(writeEntry({ title: 'T', cover: '', tags: [], focus: null, body: '' })).toBe(
			'---\ntitle: T\n---\n'
		);
	});

	test('reads back what it writes', () => {
		const data = { title: 'T', phase: 8.5, reviewed: false, body: '## A heading\n\nText.' };
		expect(readEntry(writeEntry(data))).toEqual(data);
	});
});
