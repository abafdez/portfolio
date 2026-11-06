// The markdown in content/, as typed lists sorted newest first.
// Only import this from +page.server.ts files: there it runs at build time, so the
// markdown is read once and never ships to the browser.
// Only the frontmatter is read here; the bodies are rendered by each [slug] page.
import { parse } from 'yaml';

interface Frontmatter {
	title: string;
	// The alt text of the cover image, cover.png next to the file (see covers.ts).
	cover?: string;
	// 'YYYY-MM-DD'. The yaml package keeps unquoted dates as strings.
	date: string;
	tags?: string[];
	description?: string;
}

// A post must have a description: it's written for search results and link previews.
export interface PostMeta extends Frontmatter {
	description: string;
}

export interface LogMeta extends Frontmatter {
	phase?: number;
}

// draft: the file is in a drafts/ folder (only possible in dev, see below).
// folder: where the file and its images are, e.g. /content/blog/published/<slug>
// (covers.ts finds a cover by it).
// minutes: reading time, from the words in the file (see readingTime()).
// description: the frontmatter's, or one taken from the body (see summary()).
export type Entry<T extends Frontmatter> = T & {
	slug: string;
	folder: string;
	draft: boolean;
	minutes: number;
	description: string;
};

// import.meta.glob is a Vite feature: it finds the files at build time and imports
// them all. eager: imported right away, not as lazy functions. query '?raw' +
// import 'default': each file as plain text, not as a module. The options must be
// written inline: Vite reads them from the source code, before anything runs.
// Every file sits in a folder of its own, with its images (see slugOf()), so the
// pattern is folder/file: '*/*.md'.
const posts = import.meta.glob<string>('/content/blog/published/*/*.md', {
	eager: true,
	query: '?raw',
	import: 'default'
});
// Drafts only exist in dev. In a build, Vite replaces import.meta.env.DEV with false
// and removes the dead branch, glob included, so no draft is read or bundled.
const drafts = import.meta.env.DEV
	? import.meta.glob<string>('/content/blog/drafts/*/*.md', {
			eager: true,
			query: '?raw',
			import: 'default'
		})
	: {};
const log = import.meta.glob<string>('/content/bitacora/*/*.md', {
	eager: true,
	query: '?raw',
	import: 'default'
});

// The cover images (cover.png, .jpg or .webp next to a post's or an entry's markdown).
// Only their paths are used here, to check each one has its alt text: not eager, so
// no image is read. covers.ts imports them for the pages. Drafts only in dev.
const coverFiles = Object.keys({
	...import.meta.glob(['/content/**/cover.{png,jpg,jpeg,webp}', '!/content/blog/drafts/**']),
	...(import.meta.env.DEV
		? import.meta.glob('/content/blog/drafts/*/cover.{png,jpg,jpeg,webp}')
		: {})
});

// A cover and its alt text come together: an image nobody described is a problem for
// screen readers, and alt text without an image is a typo somewhere. Either fails the
// build, naming the file.
// Exported for its tests (content.test.ts).
export function checkCover(path: string, alt: unknown, files: string[] = coverFiles) {
	const folder = path.slice(0, path.lastIndexOf('/') + 1);
	const file = files.find((file) => file.startsWith(folder));
	if (file && (typeof alt !== 'string' || !alt.trim())) {
		throw new Error(`${file}: a cover needs alt text in the frontmatter: cover: What it shows`);
	}
	if (!file && alt !== undefined) {
		throw new Error(`${path}: has cover: but no cover.png, .jpg or .webp next to it`);
	}
}

// The frontmatter is the YAML between the two --- lines at the top of the file.
const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/;

// Minutes to read the body (the file without its frontmatter), rounded up.
// 200 words a minute: a bit under the usual ~238 for non-fiction, because the posts
// are technical and full of code. Code counts as words too.
// Exported for its tests (content.test.ts).
export function readingTime(text: string): number {
	const words = text.replace(frontmatter, '').match(/\S+/g)?.length ?? 0;
	return Math.max(1, Math.ceil(words / 200));
}

// A description for a file that has none (Bitácora entries): the body's first
// paragraph or list item, as plain text, cut at a word to fit in max characters.
// Search results show about 160. Headings, HTML comments and code blocks are skipped.
// A code block goes whole, from its fence to the closing one with as many backticks
// (\1): skipping only the fence line would make the code's first line the summary.
const codeBlock = /^(`{3,})[^\n]*\n[\s\S]*?^\1/gm;

export function summary(text: string, max = 160): string {
	const first =
		text
			.replace(frontmatter, '')
			.replace(codeBlock, '')
			.split(/\r?\n/)
			.map((line) => line.trim())
			.find((line) => line && !/^(#|<!--|```|!\[)/.test(line)) ?? '';
	const plain = first
		.replace(/^([-*+]|\d+\.)\s+/, '') // a list marker
		.replace(/!\[[^\]]*\]\([^)]*\)/g, '') // an image inside the text: ![alt](./x.png)
		.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // [text](url) -> text
		.replace(/[`*]/g, '') // code and emphasis marks (not _, which names use: page_data)
		.replace(/\s{2,}/g, ' '); // the gap a removed image leaves
	if (plain.length <= max) return plain;
	// Leave room for the ellipsis, and don't cut a word in half.
	const cut = plain.slice(0, max - 1);
	// Nor leave a comma or an open bracket right before it.
	return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s,;:(]+$/, '')}…`;
}

// Tags become URLs (/blog/tags/design-tokens), so they must be lowercase kebab-case.
// Otherwise 'CSS' and 'css' would be two pages, and 'design tokens' an ugly URL.
// A tag that doesn't fit fails the build, with the file that has it.
// Exported for the Awesome lists (awesome.ts), whose tags end up in ?tag= URLs.
const kebabCase = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function checkTags(path: string, tags: string[] = []) {
	const bad = tags.filter((tag) => !kebabCase.test(tag));
	if (bad.length) throw new Error(`${path}: tags must be lowercase kebab-case: ${bad.join(', ')}`);
}

// The YAML at the top of a file. A YAML error names the line but not the file, so it's
// added: with a hundred markdown files, the file is what you need to know. The usual
// mistake is an unquoted ': ' inside a value; wrap the value in quotes.
// Exported for its tests (content.test.ts).
export function readFrontmatter<T>(path: string, text: string): T {
	try {
		return parse(text.match(frontmatter)?.[1] ?? '') as T;
	} catch (error) {
		throw new Error(`${path}: the frontmatter isn't valid YAML. ${(error as Error).message}`);
	}
}

// Each file sits in a folder with the same name, next to its images, and that name is
// the slug: /content/blog/2026-10-27-design-tokens/2026-10-27-design-tokens.md ->
// 2026-10-27-design-tokens. A folder and file that don't match fail the build (a
// rename that missed one, or a file dropped straight into drafts/).
// Exported for its tests (content.test.ts).
export function slugOf(path: string): string {
	const [folder, file] = path.split('/').slice(-2);
	const slug = file.replace(/\.md$/, '');
	if (folder !== slug) throw new Error(`${path}: the folder and the file must have the same name`);
	return slug;
}

function toList<T extends Frontmatter>(files: Record<string, string>): Entry<T>[] {
	return Object.entries(files)
		.map(([path, text]) => {
			const meta = readFrontmatter<T>(path, text);
			checkTags(path, meta.tags);
			checkCover(path, meta.cover);
			return {
				...meta,
				slug: slugOf(path),
				folder: path.slice(0, path.lastIndexOf('/')),
				draft: path.includes('/drafts/'),
				minutes: readingTime(text),
				description: meta.description ?? summary(text)
			};
		})
		.sort((a, b) => b.date.localeCompare(a.date) || b.slug.localeCompare(a.slug));
}

// A slug is a URL, so it can only be used once: a post copied to published/ instead of
// moved there would be in both folders, and two pages would want the same address.
// Exported for its tests (content.test.ts).
export function checkUniqueSlugs(paths: string[]) {
	const seen = new Map<string, string>();
	for (const path of paths) {
		const slug = slugOf(path);
		const other = seen.get(slug);
		if (other) throw new Error(`${path}: ${other} has the same name; move a draft, don't copy it`);
		seen.set(slug, path);
	}
}

checkUniqueSlugs([...Object.keys(posts), ...Object.keys(drafts)]);

export const allPosts = toList<PostMeta>({ ...posts, ...drafts });
export const allLog = toList<LogMeta>(log);

// Every tag a post uses, once, A to Z. The tag pages are made from this list, so in a
// build (no drafts) a tag that only drafts use has no page.
export const postTags = [...new Set(allPosts.flatMap((post) => post.tags ?? []))].sort();

// The posts with a tag, newest first (allPosts is sorted that way).
export function postsTagged(tag: string): Entry<PostMeta>[] {
	return allPosts.filter((post) => post.tags?.includes(tag));
}
