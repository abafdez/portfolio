// The markdown in content/, as typed lists sorted newest first.
// Only import this from +page.server.ts files: there it runs at build time, so the
// markdown is read once and never ships to the browser.
// Only the frontmatter is read here; the bodies are rendered by each [slug] page.
import { parse } from 'yaml';

interface Frontmatter {
	title: string;
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
// minutes: reading time, from the words in the file (see readingTime()).
// description: the frontmatter's, or one taken from the body (see summary()).
export type Entry<T extends Frontmatter> = T & {
	slug: string;
	draft: boolean;
	minutes: number;
	description: string;
};

// import.meta.glob is a Vite feature: it finds the files at build time and imports
// them all. eager: imported right away, not as lazy functions. query '?raw' +
// import 'default': each file as plain text, not as a module. The options must be
// written inline: Vite reads them from the source code, before anything runs.
const posts = import.meta.glob<string>('/content/blog/*.md', {
	eager: true,
	query: '?raw',
	import: 'default'
});
// Drafts only exist in dev. In a build, Vite replaces import.meta.env.DEV with false
// and removes the dead branch, glob included, so no draft is read or bundled.
const drafts = import.meta.env.DEV
	? import.meta.glob<string>('/content/blog/drafts/*.md', {
			eager: true,
			query: '?raw',
			import: 'default'
		})
	: {};
const log = import.meta.glob<string>('/content/bitacora/*.md', {
	eager: true,
	query: '?raw',
	import: 'default'
});

// The frontmatter is the YAML between the two --- lines at the top of the file.
const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/;

// Minutes to read the body (the file without its frontmatter), rounded up.
// 200 words a minute: a bit under the usual ~238 for non-fiction, because the posts
// are technical and full of code. Code counts as words too.
function readingTime(text: string): number {
	const words = text.replace(frontmatter, '').match(/\S+/g)?.length ?? 0;
	return Math.max(1, Math.ceil(words / 200));
}

// A description for a file that has none (Bitácora entries): the body's first
// paragraph or list item, as plain text, cut at a word to fit in max characters.
// Search results show about 160. Headings, HTML comments and code fences are skipped.
export function summary(text: string, max = 160): string {
	const first =
		text
			.replace(frontmatter, '')
			.split(/\r?\n/)
			.map((line) => line.trim())
			.find((line) => line && !/^(#|<!--|```)/.test(line)) ?? '';
	const plain = first
		.replace(/^([-*+]|\d+\.)\s+/, '') // a list marker
		.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // [text](url) -> text
		.replace(/[`*]/g, ''); // code and emphasis marks (not _, which names use: page_data)
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

// The file name is the slug: /content/blog/2026-10-27-design-tokens.md -> 2026-10-27-design-tokens
function toList<T extends Frontmatter>(files: Record<string, string>): Entry<T>[] {
	return Object.entries(files)
		.map(([path, text]) => {
			const meta = parse(text.match(frontmatter)?.[1] ?? '') as T;
			checkTags(path, meta.tags);
			return {
				...meta,
				slug: path.split('/').at(-1)!.replace(/\.md$/, ''),
				draft: path.includes('/drafts/'),
				minutes: readingTime(text),
				description: meta.description ?? summary(text)
			};
		})
		.sort((a, b) => b.date.localeCompare(a.date) || b.slug.localeCompare(a.slug));
}

export const allPosts = toList<PostMeta>({ ...posts, ...drafts });
export const allLog = toList<LogMeta>(log);

// Every tag a post uses, once, A to Z. The tag pages are made from this list, so in a
// build (no drafts) a tag that only drafts use has no page.
export const postTags = [...new Set(allPosts.flatMap((post) => post.tags ?? []))].sort();

// The posts with a tag, newest first (allPosts is sorted that way).
export function postsTagged(tag: string): Entry<PostMeta>[] {
	return allPosts.filter((post) => post.tags?.includes(tag));
}
