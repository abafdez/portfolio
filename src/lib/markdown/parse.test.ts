import { describe, expect, test } from 'vitest';
import type { Token, Tokens } from 'marked';
import { parse, type Callout, type CalloutTitle, type Figure } from './parse';
import { blocks } from '#lib/blocks.ts';
import { components } from './blocks/index.ts';

const first = (markdown: string, file = 'post.md') => parse(markdown, file).tokens[0];

// The plain text of some tokens, to check what ends up where without the token details.
function plain(tokens: Token[]): string {
	return tokens
		.map((token) =>
			'tokens' in token && token.tokens ? plain(token.tokens) : (token as Tokens.Text).text
		)
		.join('');
}

describe('callouts', () => {
	test('a callout gets its type, a title token and the text', () => {
		const callout = first('> [!note]\n> Some **bold** text.') as unknown as Callout;
		expect(callout.type).toBe('callout');
		expect(callout.kind).toBe('note');
		const [title, body] = callout.tokens as unknown as [CalloutTitle, Tokens.Paragraph];
		expect(title).toMatchObject({ type: 'calloutTitle', kind: 'note', custom: false });
		expect(body.type).toBe('paragraph');
		expect(plain(body.tokens)).toBe('Some bold text.');
		expect(body.tokens.map(({ type }) => type)).toEqual(['text', 'strong', 'text']);
	});

	test.each(['note', 'tip', 'important', 'warning', 'caution'])('[!%s] is a type', (type) => {
		expect(first(`> [!${type}]\n> Text.`)).toMatchObject({ type: 'callout', kind: type });
	});

	test('the type is case-insensitive, like on GitHub', () => {
		expect(first('> [!WARNING]\n> Text.')).toMatchObject({ kind: 'warning' });
	});

	test('a custom title keeps its markup, and the text follows', () => {
		const callout = first('> [!tip] Use `pnpm`, not **npm**\n> Text.') as unknown as Callout;
		const [title, body] = callout.tokens as unknown as [CalloutTitle, Tokens.Paragraph];
		expect(title.custom).toBe(true);
		expect(title.tokens.map(({ type }) => type)).toEqual(['text', 'codespan', 'text', 'strong']);
		expect(plain(title.tokens)).toBe('Use pnpm, not npm');
		expect(plain(body.tokens)).toBe('Text.');
	});

	test('more paragraphs stay paragraphs', () => {
		const callout = first('> [!caution]\n> One\n> line.\n>\n> Two.') as unknown as Callout;
		const paragraphs = callout.tokens.filter(
			({ type }) => type === 'paragraph'
		) as Tokens.Paragraph[];
		expect(paragraphs.map((p) => plain(p.tokens))).toEqual(['One\nline.', 'Two.']);
	});

	test('a title alone has no empty paragraph', () => {
		const callout = first('> [!important] Only a title') as unknown as Callout;
		expect(callout.tokens.map(({ type }) => type)).toEqual(['calloutTitle']);
	});

	test("Obsidian's folding sign is accepted (shown open)", () => {
		const callout = first('> [!note]- Folded\n> Text.') as unknown as Callout;
		expect(plain((callout.tokens[0] as unknown as CalloutTitle).tokens)).toBe('Folded');
	});

	test('a plain blockquote stays one', () => {
		expect(first('> Just a quote.').type).toBe('blockquote');
	});

	test('[!type] later in the text is just text', () => {
		expect(first('> See [!note] here.').type).toBe('blockquote');
	});

	test('a callout inside a callout', () => {
		const outer = first('> [!note]\n> Outer.\n>\n> > [!tip]\n> > Inner.') as unknown as Callout;
		expect(outer.tokens.at(-1)).toMatchObject({ type: 'callout', kind: 'tip' });
	});

	test('a callout inside a list item', () => {
		const list = first('- Item\n\n  > [!tip]\n  > Inside.') as Tokens.List;
		expect(list.items[0].tokens.some(({ type }) => type === 'callout')).toBe(true);
	});

	test('an unknown type fails, naming the file', () => {
		expect(() => parse('> [!info]\n> Text.', 'post.md')).toThrow(
			/post\.md: \[!info\] isn't a callout type\. Use one of: note, tip/
		);
	});
});

describe('figures', () => {
	test('an image with a title, alone in its paragraph, is a figure', () => {
		const figure = first('![A diagram](./a.png "What it shows")') as unknown as Figure;
		expect(figure).toMatchObject({ type: 'figure', caption: 'What it shows' });
		expect(figure.tokens[0]).toMatchObject({
			type: 'image',
			href: './a.png',
			text: 'A diagram',
			title: null
		});
	});

	test('without a title, or with text around it, it stays in its paragraph', () => {
		expect(first('![A diagram](./a.png)').type).toBe('paragraph');
		expect(first('See ![A diagram](./a.png "Caption") here.').type).toBe('paragraph');
	});
});

describe('HTML in the text', () => {
	test('a tag fails the build, naming the file and the tag', () => {
		expect(() => parse('Some <profile> here.', 'post.md')).toThrow(
			'post.md: <profile> is in the text. Put it in backticks: `<profile>`.'
		);
		expect(() => parse('<details>\n<summary>Hi</summary>\n</details>', 'post.md')).toThrow(
			/<details> is in the text/
		);
	});

	test('in backticks or a code block it is text', () => {
		expect(() =>
			parse('Use `<details>`.\n\n```html\n<details></details>\n```', 'post.md')
		).not.toThrow();
	});

	test('a comment is dropped', () => {
		expect(parse('<!-- TODO -->\n\nText.', 'post.md').tokens.map(({ type }) => type)).not.toContain(
			'html'
		);
	});
});

describe('code languages', () => {
	test('collected for Shiki, without our blocks', () => {
		const { languages } = parse(
			'```ts\na\n```\n\n```yt\nsrc: https://youtu.be/gd5uJ7Nlvvo\ntitle: A talk\n```\n\n> ```css\n> b\n> ```',
			'post.md'
		);
		expect([...languages].sort()).toEqual(['css', 'ts']);
	});
});

describe('files next to the post', () => {
	test("images and our blocks' file fields, so they can be loaded before rendering", () => {
		const { files } = parse(
			'![A](./a.png)\n\n| x |\n| - |\n| ![C](./c.png) |\n\n' +
				'```video\nsrc: ./v.mp4\nposter: ./p.png\nwidth: 1\nheight: 1\n```',
			'post.md'
		);
		expect([...files].sort()).toEqual(['./a.png', './c.png', './p.png', './v.mp4']);
	});

	test('an image from elsewhere, or without alt text, fails the build', () => {
		expect(() => parse('![B](https://example.com/b.png)', 'post.md')).toThrow(
			'post.md: https://example.com/b.png should be a file next to the post (./…)'
		);
		expect(() => parse('![](./a.png)', 'post.md')).toThrow('post.md: ./a.png needs alt text');
	});
});

test('every fenced block in blocks.ts has a component', () => {
	expect(Object.keys(components).sort()).toEqual(Object.keys(blocks).sort());
});
