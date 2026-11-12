// Markdown -> tokens, with marked (the parser svelte-markdown and Sveltia use).
// svelte-markdown could lex the text itself, but doing it here first lets us change the
// tokens before they're drawn, and see what's in them:
//   - a blockquote that starts with [!type] becomes a `callout` token (callouts.ts has
//     the types and why they're GitHub's five);
//   - an image with a title, alone in its paragraph, becomes a `figure` with a caption;
//   - the languages of the code blocks, so Shiki can load them before rendering (a
//     Svelte component can't wait for anything while it renders), and for the same
//     reason the files next to the post it uses (images, a block's video);
//   - HTML written in the text fails the build: it has to go in backticks. Nothing in a
//     post reaches the page as raw markup: every element comes from one of our renderers;
//   - so does an image without alt text, or one that isn't next to the post.
// Every error the build can stop on is thrown here, before rendering, so the CMS preview
// can show it instead of the post.
// Plain TypeScript, no Svelte: parse.test.ts runs it directly.
import { Lexer, type Token, type Tokens } from 'marked';
import { calloutTypes, marker, type CalloutType } from '#lib/callouts.ts';
import { blocks, readBlock } from '#lib/blocks.ts';

// Our own token types. The Parser draws any token whose type has a renderer
// (Markdown.svelte), and gives the renderer the token's fields as props; `tokens` are
// drawn as its children.
export interface Callout {
	type: 'callout';
	raw: string;
	kind: CalloutType;
	tokens: Token[]; // a calloutTitle, then the blockquote's text
}
export interface CalloutTitle {
	type: 'calloutTitle';
	raw: string;
	kind: CalloutType;
	custom: boolean; // a title of its own (the type is then read out before it)
	tokens: Token[];
}

export interface Figure {
	type: 'figure';
	raw: string;
	caption: string;
	tokens: Token[]; // the image, without its title
}

export interface Parsed {
	tokens: Token[];
	languages: Set<string>; // of the code blocks, without our ```video-style blocks
	files: Set<string>; // ./files the post uses: images, and our blocks' file fields
}

type Found = Omit<Parsed, 'tokens'>;

export function parse(markdown: string, file: string): Parsed {
	const tokens = new Lexer({ gfm: true }).lex(markdown) as Token[];
	const found: Found = { languages: new Set(), files: new Set() };
	return { tokens: walk(tokens, file, found), ...found };
}

function walk(tokens: Token[], file: string, found: Found): Token[] {
	return tokens.flatMap((token): Token[] => {
		if (token.type === 'html') {
			// A comment (<!-- TODO -->) is a note to myself: nothing on the page.
			if (/^\s*<!--[\s\S]*-->\s*$/.test(token.raw)) return [];
			const tag = /<\/?([\w:-]+)/.exec(token.raw)?.[1] ?? 'tag';
			throw new Error(`${file}: <${tag}> is in the text. Put it in backticks: \`<${tag}>\`.`);
		}
		if (token.type === 'code' && token.lang) {
			const block = readBlock(token.lang, (token as Tokens.Code).text, file);
			if (!block) found.languages.add(token.lang);
			else {
				for (const [name, field] of Object.entries(blocks[block.name].fields)) {
					const value = block.values[name];
					if (field.kind === 'file' && typeof value === 'string') found.files.add(value);
				}
			}
		}
		if (token.type === 'image') {
			const { href, text } = token as Tokens.Image;
			if (!href.startsWith('./')) {
				throw new Error(`${file}: ${href} should be a file next to the post (./…)`);
			}
			if (!text.trim())
				throw new Error(`${file}: ${href} needs alt text: ![What it shows](${href})`);
			found.files.add(href);
		}
		const changed =
			token.type === 'blockquote'
				? (callout(token as Tokens.Blockquote, file) ?? token)
				: token.type === 'paragraph'
					? (figure(token as Tokens.Paragraph) ?? token)
					: token;
		// Go into everything that holds tokens: a callout can hold another one, a list
		// item a quote, a table cell an image.
		if ('tokens' in changed && Array.isArray(changed.tokens)) {
			changed.tokens = walk(changed.tokens, file, found);
		}
		if (changed.type === 'list') {
			for (const item of (changed as Tokens.List).items) {
				item.tokens = walk(item.tokens, file, found);
			}
		}
		if (changed.type === 'table') {
			const table = changed as Tokens.Table;
			for (const cell of [...table.header, ...table.rows.flat()]) {
				cell.tokens = walk(cell.tokens, file, found);
			}
		}
		return [changed as Token];
	});
}

// > [!tip] Optional title       ->  callout { calloutTitle { "Optional title" },
// > The text.                                  paragraph { "The text." } }
function callout(quote: Tokens.Blockquote, file: string): Token | undefined {
	const first = quote.tokens[0];
	if (first?.type !== 'paragraph') return;
	const paragraph = first as Tokens.Paragraph;
	const start = paragraph.tokens[0];
	const match = start?.type === 'text' ? marker.exec((start as Tokens.Text).text) : null;
	if (!match) return;

	const name = match[1].toLowerCase();
	if (!Object.hasOwn(calloutTypes, name)) {
		throw new Error(
			`${file}: [!${match[1]}] isn't a callout type. Use one of: ${Object.keys(calloutTypes).join(', ')}`
		);
	}
	const kind = name as CalloutType;

	// The rest of the first line is the title (it can have `code` or **bold** in it); the
	// lines after it are the text. marked keeps the line breaks inside text tokens.
	const inline: Token[] = [
		text((start as Tokens.Text).text.slice(match[0].length)),
		...paragraph.tokens.slice(1)
	];
	const title: Token[] = [];
	while (inline.length) {
		const token = inline[0];
		const newline = token.type === 'text' ? (token as Tokens.Text).text.indexOf('\n') : -1;
		if (newline !== -1) {
			const value = (token as Tokens.Text).text;
			if (newline > 0) title.push(text(value.slice(0, newline)));
			inline[0] = text(value.slice(newline + 1));
			break;
		}
		title.push(inline.shift()!);
	}
	const filled = (tokens: Token[]) =>
		tokens.some((token) => token.type !== 'text' || (token as Tokens.Text).text.trim());

	const heading: CalloutTitle = {
		type: 'calloutTitle',
		raw: '',
		kind,
		custom: filled(title),
		tokens: title
	};
	const body = filled(inline) ? [{ ...paragraph, tokens: inline }] : [];
	return {
		type: 'callout',
		raw: quote.raw,
		kind,
		tokens: [heading, ...body, ...quote.tokens.slice(1)]
	} satisfies Callout as unknown as Token;
}

// ![alt](./x.png "Caption") alone in a paragraph -> figure { image } with the caption.
function figure(paragraph: Tokens.Paragraph): Token | undefined {
	const [only, ...rest] = paragraph.tokens;
	if (rest.length || only?.type !== 'image' || !(only as Tokens.Image).title) return;
	const image = only as Tokens.Image;
	return {
		type: 'figure',
		raw: paragraph.raw,
		caption: image.title!,
		tokens: [{ ...image, title: null }]
	} satisfies Figure as unknown as Token;
}

function text(value: string): Tokens.Text {
	return { type: 'text', raw: value, text: value, escaped: false };
}
