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
}

export interface PostMeta extends Frontmatter {
	description: string;
}

export interface LogMeta extends Frontmatter {
	phase?: number;
}

// draft: the file is in a drafts/ folder (only possible in dev, see below).
export type Entry<T extends Frontmatter> = T & { slug: string; draft: boolean };

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

// The file name is the slug: /content/blog/2026-10-27-design-tokens.md -> 2026-10-27-design-tokens
function toList<T extends Frontmatter>(files: Record<string, string>): Entry<T>[] {
	return Object.entries(files)
		.map(([path, text]) => ({
			...(parse(text.match(frontmatter)?.[1] ?? '') as T),
			slug: path.split('/').at(-1)!.replace(/\.md$/, ''),
			draft: path.includes('/drafts/')
		}))
		.sort((a, b) => b.date.localeCompare(a.date) || b.slug.localeCompare(a.slug));
}

export const allPosts = toList<PostMeta>({ ...posts, ...drafts });
export const allLog = toList<LogMeta>(log);
