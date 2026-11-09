import { expect, test } from 'vitest';
import { compile } from 'mdsvex';
import { rehypeTables } from './tables';

// Through mdsvex, like the site (see callouts.test.ts).
async function html(markdown: string, filename = 'post.md') {
	const out = await compile(markdown, {
		filename,
		extensions: ['.md'],
		rehypePlugins: [rehypeTables] as never
	});
	return out!.code.replace(/\s+/g, ' ').trim();
}

const table = '| A | B |\n| - | - |\n| 1 | 2 |';

test('a table is wrapped in a named region a keyboard can scroll', async () => {
	const out = await html(table);
	expect(out).toMatch(
		/^<div class="table-scroll" role="region" aria-label="Table" tabindex="0"> ?<table>/
	);
	expect(out).toMatch(/<\/table> ?<\/div>$/);
});

test('named in the file’s language', async () => {
	expect(await html(table, 'post.es.md')).toContain('aria-label="Tabla"');
});

test('everything else is left alone', async () => {
	expect(await html('A paragraph.')).toBe('<p>A paragraph.</p>');
});
