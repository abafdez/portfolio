// Drafts are posts with `draft: true` in their frontmatter, in the same folder as the
// published ones (content/blog/posts/). They only exist in dev: a build must not read
// them, nor their images.
//
// A glob can leave out a folder ('!/content/blog/posts/<slug>/**'), but it can't read
// frontmatter. And leaving them out of the lists afterwards isn't enough: every file a
// glob matches reaches the build, lazy or not, used by a page or not (Vite makes a
// chunk for each one, and SvelteKit copies server assets into build/). So each glob over
// content that may hold drafts ends with a marker pattern, '!/:drafts:', and this Vite
// plugin replaces it, in a build, with one exclusion per draft folder:
//
//   import.meta.glob(['/content/blog/posts/*/*.md', '!/:drafts:'], …)
//   becomes, in a build with one draft,
//   import.meta.glob(['/content/blog/posts/*/*.md', '!/content/blog/posts/2026-11-09-x/**'], …)
//
// In dev (and in tests) the marker stays: a pattern like that matches no file, so
// nothing is left out, and Vite keeps updating the globs when files come and go.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { Plugin } from 'vite';
import { readEntry } from './content-files.ts';

export const marker = "'!/:drafts:'";

// '/content/blog/posts/<slug>' for every <slug>/<slug>.md under content/ whose
// frontmatter says draft: true. Only the English file decides: a translation follows it.
export function draftFolders(root: string): string[] {
	const folders: string[] = [];
	for (const entry of readdirSync(join(root, 'content'), {
		recursive: true,
		withFileTypes: true
	})) {
		const folder = entry.parentPath.slice(root.length).replaceAll('\\', '/');
		const isMain = entry.isFile() && entry.name === `${folder.split('/').at(-1)}.md`;
		if (
			isMain &&
			readEntry(readFileSync(join(entry.parentPath, entry.name), 'utf8')).draft === true
		) {
			folders.push(folder);
		}
	}
	return folders.sort();
}

// The marker swapped for the exclusions (or for a pattern that matches nothing when
// there are no drafts, so the array keeps its shape).
export function excludeDrafts(code: string, folders: string[]): string {
	const patterns = folders.length ? folders.map((folder) => `'!${folder}/**'`) : [marker];
	return code.replaceAll(marker, patterns.join(', '));
}

export function drafts(): Plugin {
	let build = false;
	let root = '';
	let folders: string[] = [];
	return {
		name: 'drafts',
		// Before Vite's own glob plugin reads the patterns.
		enforce: 'pre',
		configResolved(config) {
			build = config.command === 'build' && !process.env.VITEST;
			root = config.root;
		},
		buildStart() {
			if (build) folders = draftFolders(root);
		},
		transform(code) {
			// map: null, the lines don't move: the marker becomes patterns on the same line.
			if (build && code.includes(marker)) return { code: excludeDrafts(code, folders), map: null };
		}
	};
}
