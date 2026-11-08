import { describe, expect, test } from 'vitest';
import { compile } from 'mdsvex';
import { rehypeCallouts } from './callouts';

// Through mdsvex itself, like the site: the plugin depends on how its old parser reads
// [!note], so a test with a hand-made tree could pass while the real build breaks.
async function html(markdown: string, filename = 'post.md') {
	const out = await compile(markdown, {
		filename,
		extensions: ['.md'], // otherwise mdsvex skips the file (its default is .svx)
		rehypePlugins: [rehypeCallouts] as never // mdsvex 0.12's plugin types are older
	});
	// mdsvex puts new lines between blocks and splits long tags over lines ("<svg …\n>").
	// Without that whitespace the checks are easier to read.
	return out!.code.replace(/\s+>/g, '>').replace(/>\s+</g, '><').replace(/\s+/g, ' ').trim();
}

describe('rehypeCallouts', () => {
	test('a callout gets the type as its title', async () => {
		const out = await html('> [!note]\n> Some **bold** text.');
		expect(out).toMatch(/^<aside class="callout" data-callout="note">/);
		expect(out).toMatch(
			/<p class="callout-title"><svg [^>]*aria-hidden="true">.*<\/svg><span>Note<\/span><\/p>/
		);
		expect(out).toContain('<p>Some <strong>bold</strong> text.</p></aside>');
		expect(out).not.toContain('[!note]');
	});

	test.each(['note', 'tip', 'important', 'warning', 'caution'])('[!%s] is a type', async (type) => {
		expect(await html(`> [!${type}]\n> Text.`)).toContain(`data-callout="${type}"`);
	});

	test('the type is case-insensitive, like on GitHub', async () => {
		expect(await html('> [!WARNING]\n> Text.')).toContain('data-callout="warning"');
	});

	test('a custom title keeps the type for screen readers', async () => {
		const out = await html('> [!tip] Use `pnpm`, not **npm**\n> Text.');
		expect(out).toContain(
			'<span><span class="visually-hidden">Tip: </span>Use <code>pnpm</code>, not <strong>npm</strong></span></p>'
		);
		expect(out).toContain('<p>Text.</p>');
	});

	test('more paragraphs stay paragraphs', async () => {
		const out = await html('> [!caution]\n> One\n> line.\n>\n> Two.');
		expect(out).toContain('<p>One line.</p><p>Two.</p></aside>');
	});

	test('a title alone has no empty paragraph', async () => {
		const out = await html('> [!important] Only a title');
		expect(out).toMatch(/Only a title<\/span><\/p><\/aside>$/);
	});

	test("Obsidian's folding sign is accepted (shown open)", async () => {
		const out = await html('> [!note]- Folded\n> Text.');
		expect(out).toContain('</span>Folded</span></p>');
	});

	test('a plain blockquote stays one', async () => {
		expect(await html('> Just a quote.')).toBe('<blockquote><p>Just a quote.</p></blockquote>');
	});

	test('[!type] later in the text is just text', async () => {
		expect(await html('> See [!note] here.')).toContain('<blockquote>');
	});

	test('a callout inside a callout', async () => {
		const out = await html('> [!note]\n> Outer.\n>\n> > [!tip]\n> > Inner.');
		expect(out.match(/<aside/g)).toHaveLength(2);
	});

	// A translation (<slug>.es.md) gets the titles in Spanish: they're written into the
	// HTML at build time, from the file's name.
	test('a Spanish file gets Spanish titles', async () => {
		expect(await html('> [!tip]\n> Texto.', 'post.es.md')).toContain('<span>Sugerencia</span>');
		expect(await html('> [!warning] Ojo\n> Texto.', 'post.es.md')).toContain(
			'<span class="visually-hidden">Advertencia: </span>Ojo'
		);
	});

	test('an unknown type fails, naming the file', async () => {
		await expect(html('> [!info]\n> Text.')).rejects.toThrow(
			/post\.md: \[!info\] isn't a callout type\. Use one of: note, tip/
		);
	});
});
