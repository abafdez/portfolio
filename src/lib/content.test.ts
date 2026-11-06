// Unit tests for content.ts: small pure functions, checked with inputs we write here.
// Run them with `pnpm test` (once) or `pnpm test:watch` (again on every save).
//
// describe() groups tests; test() is one case; expect(value) plus a matcher (toBe,
// toThrow…) is the check. If any expect fails, that test fails and says why.
import { describe, expect, test } from 'vitest';
import {
	allLog,
	checkCover,
	checkTags,
	checkUniqueSlugs,
	readingTime,
	slugOf,
	summary
} from './content.ts';

// A markdown file like ours: frontmatter, then a body.
const file = (body: string) => `---\ntitle: A title\ndate: 2026-11-04\n---\n\n${body}`;

describe('summary', () => {
	test('takes the first list item, without its marker', () => {
		expect(summary(file('## What we did\n\n- First bullet.\n- Second bullet.'))).toBe(
			'First bullet.'
		);
	});

	test('takes a numbered item too', () => {
		expect(summary(file('1. Step one.\n2. Step two.'))).toBe('Step one.');
	});

	test('skips headings and HTML comments', () => {
		expect(summary(file('# Title\n\n<!-- TODO: a screenshot -->\n\nThe text.'))).toBe('The text.');
	});

	test('skips a code block at the start, not just its fence', () => {
		expect(summary(file('```ts\nconst x = 1;\n```\n\nThe text.'))).toBe('The text.');
	});

	test('skips a four-backtick block with a ``` block inside it', () => {
		const block = '````md\n```ts\nconst x = 1;\n```\n````';
		expect(summary(file(`${block}\n\nThe text.`))).toBe('The text.');
	});

	test('turns links into their text and drops code marks', () => {
		expect(summary(file('- See [MDN](https://developer.mozilla.org) and `resolve()`.'))).toBe(
			'See MDN and resolve().'
		);
	});

	test('keeps underscores: they are part of names', () => {
		expect(summary(file('- `page_data` is a name.'))).toBe('page_data is a name.');
	});

	test('leaves a short text as it is', () => {
		expect(summary(file('Short.'))).toBe('Short.');
	});

	test('cuts a long text at a word, with an ellipsis, within max', () => {
		const result = summary(file('word '.repeat(50)));
		expect(result.length).toBeLessThanOrEqual(160);
		expect(result).toMatch(/word…$/); // a whole word, then the ellipsis
	});

	test('leaves no comma right before the ellipsis', () => {
		// 'one two, three four' cut to fit 11 characters would end in 'two,'.
		expect(summary(file('one two, three four'), 11)).toBe('one two…');
	});

	test('skips a line that is only an image', () => {
		expect(summary(file('![A diagram](./diagram.png)\n\nThe text.'))).toBe('The text.');
	});

	test('drops an image inside the text', () => {
		expect(summary(file('- Before ![a diagram](./diagram.png) after.'))).toBe('Before after.');
	});

	test('gives an empty string for a file with no text', () => {
		expect(summary(file('## Only a heading'))).toBe('');
	});
});

describe('readingTime', () => {
	test('is at least 1 minute', () => {
		expect(readingTime(file(''))).toBe(1);
	});

	test('rounds up at 200 words a minute', () => {
		expect(readingTime(file('word '.repeat(200)))).toBe(1);
		expect(readingTime(file('word '.repeat(201)))).toBe(2);
	});

	test("doesn't count the frontmatter", () => {
		const long = `---\ntitle: ${'word '.repeat(300)}\n---\n\nShort body.`;
		expect(readingTime(long)).toBe(1);
	});
});

describe('slugOf', () => {
	test('is the file name, inside a folder with the same name', () => {
		expect(slugOf('/content/blog/2026-10-27-tokens/2026-10-27-tokens.md')).toBe(
			'2026-10-27-tokens'
		);
	});

	test('works for drafts too', () => {
		expect(slugOf('/content/blog/drafts/2026-10-27-tokens/2026-10-27-tokens.md')).toBe(
			'2026-10-27-tokens'
		);
	});

	test.each([
		'/content/blog/2026-10-27-tokens/2026-10-27-renamed.md',
		'/content/blog/drafts/2026-10-27-tokens.md'
	])('rejects a folder and file that do not match: %s', (path) => {
		expect(() => slugOf(path)).toThrow(`${path}: the folder and the file must have the same name`);
	});
});

describe('checkUniqueSlugs', () => {
	const draft = '/content/blog/drafts/2026-11-06-a/2026-11-06-a.md';
	const published = '/content/blog/published/2026-11-06-a/2026-11-06-a.md';

	test('accepts different slugs', () => {
		expect(() =>
			checkUniqueSlugs([draft, '/content/blog/published/2026-11-06-b/2026-11-06-b.md'])
		).not.toThrow();
	});

	test('rejects a post that is both a draft and published', () => {
		expect(() => checkUniqueSlugs([published, draft])).toThrow(
			`${draft}: ${published} has the same name`
		);
	});
});

describe('checkCover', () => {
	const post = '/content/blog/published/2026-11-06-a/2026-11-06-a.md';
	const cover = '/content/blog/published/2026-11-06-a/cover.png';
	const other = '/content/blog/published/2026-11-06-b/cover.png';

	test('accepts a cover with its alt text', () => {
		expect(() => checkCover(post, 'A diagram', [cover])).not.toThrow();
	});

	test('accepts a post with neither', () => {
		expect(() => checkCover(post, undefined, [other])).not.toThrow();
	});

	test.each([undefined, '', '  ', 42])('rejects a cover whose alt is %j', (alt) => {
		expect(() => checkCover(post, alt, [cover])).toThrow(`${cover}: a cover needs alt text`);
	});

	test('rejects alt text without a cover', () => {
		expect(() => checkCover(post, 'A diagram', [other])).toThrow(
			`${post}: has cover: but no cover.png`
		);
	});
});

describe('checkTags', () => {
	// test.each runs the same test once per value: one line per case.
	test.each(['css', 'design-tokens', 'a11y', 'phase-5'])('accepts %s', (tag) => {
		expect(() => checkTags('post.md', [tag])).not.toThrow();
	});

	test.each(['CSS', 'bitácora', 'css_grid', 'design tokens', 'design--tokens', '-css', 'css-'])(
		'rejects "%s"',
		(tag) => {
			expect(() => checkTags('post.md', [tag])).toThrow(`post.md: tags must be lowercase`);
		}
	);

	test('accepts a file with no tags', () => {
		expect(() => checkTags('post.md')).not.toThrow();
	});
});

// Not a made-up input: the real entries in content/bitacora. If one gets an empty or
// too long description, this says which.
describe('every Bitácora entry', () => {
	test.each(allLog.map((entry) => [entry.slug, entry.description]))(
		'%s has a description of 1 to 160 characters',
		(_slug, description) => {
			expect(description.length).toBeGreaterThan(0);
			expect(description.length).toBeLessThanOrEqual(160);
		}
	);
});
