// The HTML symbols tool's logic: the characters (symbols.json, made by
// scripts/symbols.ts), the ways to write each one, and the search.
import data from './symbols.json';

export interface Character {
	codePoint: number;
	// Unicode's name, as Unicode writes it: "COPYRIGHT SIGN". The same in every language.
	name: string;
	// HTML's names for it, shortest first: ['copy', 'COPY'] for &copy; and &COPY;.
	entities: string[];
	// Which of the blocks below it's in, or -1 (characters from other blocks are here
	// only because HTML names them).
	block: number;
}

export interface Block {
	name: string;
	start: number;
	end: number;
}

export const unicodeVersion = data.unicode;

export const blocks: Block[] = (data.blocks as [string, number, number][]).map(
	([name, start, end]) => ({ name, start, end })
);

export const symbols: Character[] = (data.chars as [number, string, string[]?][]).map(
	([codePoint, name, entities = []]) => ({
		codePoint,
		name,
		entities,
		block: blocks.findIndex(({ start, end }) => codePoint >= start && codePoint <= end)
	})
);

const hex = (codePoint: number, digits = 4) =>
	codePoint.toString(16).toUpperCase().padStart(digits, '0');

// Every way to write a character, worked out from its code point. Nothing here is
// stored: a code point is all you need.
export function forms(symbol: Character) {
	const { codePoint } = symbol;
	const char = String.fromCodePoint(codePoint);
	const bytes = [...new TextEncoder().encode(char)];
	const units = Array.from({ length: char.length }, (_, i) => char.charCodeAt(i));
	return {
		char,
		// How Unicode names it: U+ and at least 4 hex digits.
		unicode: `U+${hex(codePoint)}`,
		// In HTML: by name when it has one, or by number, decimal or hex. The numbers
		// work for every character, named or not.
		entities: symbol.entities.map((name) => `&${name};`),
		decimal: `&#${codePoint};`,
		hex: `&#x${hex(codePoint, 1)};`,
		// In CSS, inside a string: content: "\00A9". A CSS escape takes up to 6 hex
		// digits, so a hex-looking letter right after it would be read as part of it;
		// 6 digits (or a space after it) end it for sure.
		css: `\\${hex(codePoint)}`,
		// In JavaScript: \u takes exactly 4 digits; above FFFF it needs the braces.
		js: codePoint > 0xffff ? `\\u{${hex(codePoint, 1)}}` : `\\u${hex(codePoint)}`,
		// In a URL: its UTF-8 bytes, each as %XX.
		url: encodeURIComponent(char),
		// How it's stored: 1 to 4 bytes in UTF-8, one or two 16-bit units in UTF-16
		// (what JavaScript's string.length counts).
		utf8: bytes.map((byte) => hex(byte, 2)).join(' '),
		utf16: units.map((unit) => hex(unit)).join(' ')
	};
}

// "COPYRIGHT SIGN" → "Copyright sign": easier to read in a grid of hundreds.
export const label = (name: string) => name.charAt(0) + name.slice(1).toLowerCase();

// What the search box understands:
// - a character itself, pasted: "→" finds RIGHTWARDS ARROW;
// - a code point: "U+2192" or "u+2192";
// - an entity: "&rarr;", "&rarr" or "rarr;";
// - words, in any order and case: "right arrow", "double arrow", "copy".
export function search(query: string, from: Character[] = symbols): Character[] {
	const q = query.trim();
	if (!q) return from;

	const codePoint = q.match(/^u\+([0-9a-f]{1,6})$/i);
	if (codePoint) return from.filter((s) => s.codePoint === parseInt(codePoint[1], 16));

	// A single character that isn't a plain ASCII letter or digit: the character itself.
	// ("a" alone is the start of a word, not the letter a.)
	const chars = [...q];
	if (chars.length === 1 && !/[a-z0-9]/i.test(q)) {
		return from.filter((s) => s.codePoint === q.codePointAt(0));
	}

	const entity = q.match(/^&?([a-z0-9]+);?$/i);
	const byEntity =
		entity && (q.startsWith('&') || q.endsWith(';'))
			? from.filter((s) => s.entities.some((name) => name === entity[1]))
			: [];
	if (byEntity.length) return byEntity;

	// Words: every word must start a word of the name or an entity name, so "arr" finds
	// arrows and "&rarr;" names, but "row" doesn't find "arrow".
	const words = q.toLowerCase().replace(/[&;]/g, ' ').split(/\s+/).filter(Boolean);
	return from.filter((s) => {
		const haystack = [
			...s.name.toLowerCase().split(/[\s-]+/),
			...s.entities.map((e) => e.toLowerCase())
		];
		return words.every((word) => haystack.some((part) => part.startsWith(word)));
	});
}
