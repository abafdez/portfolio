// Builds the HTML symbols tool's data: src/lib/projects/toolbox/symbols/symbols.json.
// Run it when Unicode or the HTML spec has something new (not on every build: the site
// never downloads anything while building):
//
//   pnpm data:symbols
//
// Three files, all read straight from their publishers:
// - UnicodeData.txt: every character's name and general category (letter, symbol…).
// - Blocks.txt: the ranges Unicode groups characters into (Arrows, Currency Symbols…).
// - entities.json, from the HTML spec: the named character references (&copy;).
// Everything else the tool shows (&#169;, &#xA9;, \00A9, %C2%A9, the UTF-8 bytes) is
// worked out from the code point in the browser, so it isn't stored.
// Both sources ask for a notice: the tool shows their credits (symbols/credits.ts).
import { writeFileSync } from 'node:fs';

const ucd = 'https://www.unicode.org/Public/UCD/latest/ucd';

// The blocks the tool offers, by their Unicode names. Characters from other blocks are
// kept only when they have an HTML name (accented letters, math letters…), so the
// "named in HTML" view is complete.
const picked = [
	'Basic Latin',
	'Latin-1 Supplement',
	'Greek and Coptic',
	'General Punctuation',
	'Superscripts and Subscripts',
	'Currency Symbols',
	'Letterlike Symbols',
	'Number Forms',
	'Arrows',
	'Mathematical Operators',
	'Miscellaneous Technical',
	'Enclosed Alphanumerics',
	'Box Drawing',
	'Block Elements',
	'Geometric Shapes',
	'Miscellaneous Symbols',
	'Dingbats',
	'Miscellaneous Symbols and Arrows',
	'Emoticons'
];

// Categories that don't stand on their own as a symbol: controls, formatting, private
// use, surrogates, combining marks (they sit on the character before them), and line
// or paragraph separators. Spaces (Zs) stay: &nbsp; and its relatives are why many
// people look these up.
const skipped = /^(C|M|Zl|Zp)/;

const text = async (url: string) => {
	const response = await fetch(url);
	if (!response.ok) throw new Error(`${url}: ${response.status}`);
	return response.text();
};

const [unicodeData, blocksText, entitiesText, readMe] = await Promise.all([
	text(`${ucd}/UnicodeData.txt`),
	text(`${ucd}/Blocks.txt`),
	text('https://html.spec.whatwg.org/entities.json'),
	text(`${ucd}/ReadMe.txt`)
]);

const version = readMe.match(/version (\d+\.\d+\.\d+)/)?.[1];
if (!version) throw new Error("Couldn't find the Unicode version in ReadMe.txt");

// "2190..21FF; Arrows"
const allBlocks = [...blocksText.matchAll(/^([0-9A-F]+)\.\.([0-9A-F]+); (.+)$/gm)].map(
	([, start, end, name]) => ({ name, start: parseInt(start, 16), end: parseInt(end, 16) })
);
const blocks = picked.map((name) => {
	const found = allBlocks.find((block) => block.name === name);
	if (!found) throw new Error(`No Unicode block called "${name}"`);
	return found;
});

// "&copy;": { "codepoints": [169], "characters": "©" }. Only the names with their ";"
// (the ones without are old forms HTML still accepts) and one code point each (a few
// names stand for two, like a letter plus a combining mark).
const entities = new Map<number, string[]>();
for (const [name, { codepoints }] of Object.entries(
	JSON.parse(entitiesText) as Record<string, { codepoints: number[] }>
)) {
	if (!name.endsWith(';') || codepoints.length !== 1) continue;
	const list = entities.get(codepoints[0]) ?? [];
	list.push(name.slice(1, -1));
	entities.set(codepoints[0], list);
}
// Shortest first, then A–Z: &rarr; before &RightArrow;.
for (const list of entities.values()) {
	list.sort((a, b) => a.length - b.length || a.localeCompare(b));
}

// "00A9;COPYRIGHT SIGN;So;0;ON;;;;;N;;;;;" (code point; name; category; …)
type Char = [codePoint: number, name: string, entities?: string[]];
const chars: Char[] = [];
for (const line of unicodeData.split('\n')) {
	const [hex, name, category] = line.split(';');
	if (!hex || name.startsWith('<') || skipped.test(category)) continue;
	const codePoint = parseInt(hex, 16);
	const inBlock = blocks.some(({ start, end }) => codePoint >= start && codePoint <= end);
	const names = entities.get(codePoint);
	if (!inBlock && !names) continue;
	chars.push(names ? [codePoint, name, names] : [codePoint, name]);
}

// One character per line: small diffs when Unicode adds a few.
const json = [
	'{',
	`"unicode": "${version}",`,
	`"blocks": ${JSON.stringify(blocks.map(({ name, start, end }) => [name, start, end]))},`,
	'"chars": [',
	chars.map((char) => JSON.stringify(char)).join(',\n'),
	']',
	'}',
	''
].join('\n');

const out = new URL('../src/lib/projects/toolbox/symbols/symbols.json', import.meta.url);
writeFileSync(out, json);
console.log(
	`Unicode ${version}: ${chars.length} characters, ${chars.filter((c) => c[2]).length} with an HTML name → ${out.pathname}`
);
