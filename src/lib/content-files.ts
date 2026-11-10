// How a content file is read and written back, in this repo's own style: the CMS
// (cms/main.ts) saves with these, so a file it saves looks like one written by hand.
// Sveltia's own writer turns `tags: [a, b]` into a block list and drops quotes; ours keeps
// short lists on one line. content-files.test.ts runs every file in content/ through
// read → write → Prettier and expects the same bytes back.
// Both run in the browser too (the CMS), so no Node imports here.
import { Document, isScalar, parse, visit } from 'yaml';

type Data = Record<string, unknown>;

// Frontmatter keys in the order the files use; anything else goes after, as given.
const order = ['title', 'date', 'phase', 'tags', 'description', 'cover', 'focus', 'reviewed'];
const rank = (key: string) => (order.includes(key) ? order.indexOf(key) : order.length);

const empty = (value: unknown) =>
	value === undefined ||
	value === null ||
	value === '' ||
	(Array.isArray(value) && value.length === 0);

// YAML in our style: quotes only where YAML needs them, and single ones; long lines never
// folded; a list of plain values (tags) on one line, like `[css, dark-mode]`.
function yaml(data: Data) {
	const doc = new Document(data);
	visit(doc, {
		Seq(_, seq) {
			if (seq.items.every(isScalar)) seq.flow = true;
		}
	});
	return doc.toString({ singleQuote: true, lineWidth: 0, flowCollectionPadding: false });
}

// A markdown file: frontmatter between --- lines, a blank line, then the body.
// The CMS edits the body as `body`, like Sveltia's own frontmatter format.
export function readEntry(text: string): Data {
	const match = /^---\n([\s\S]*?)\n?---\n?([\s\S]*)$/.exec(text);
	if (!match) return { body: text.trimEnd() };
	const meta = (parse(match[1]) as Data | null) ?? {};
	// Without the blank line after the frontmatter and the file's last newline: the
	// body is the text itself (writeEntry() adds both back).
	return { ...meta, body: match[2].replace(/^\n/, '').trimEnd() };
}

export function writeEntry(data: Data): string {
	const { body = '', ...rest } = data;
	const meta = Object.fromEntries(
		Object.entries(rest)
			.filter(([, value]) => !empty(value))
			.sort(([a], [b]) => rank(a) - rank(b))
	);
	const text = String(body).replace(/\s+$/, '');
	return `---\n${yaml(meta)}---\n${text ? `\n${text}\n` : ''}`;
}

// A YAML data file (an Awesome list). Its comments can't survive a save (the CMS only
// sees the data), so they live in content/awesome/README.md.
export function readList(text: string): Data {
	return (parse(text) as Data | null) ?? {};
}

export function writeList(data: Data): string {
	return yaml(data);
}
