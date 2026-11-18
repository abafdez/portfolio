// Unit tests for drafts.ts: which folders are drafts, and how the marker becomes
// exclusions. draftFolders() reads a small content/ folder made in a temporary directory.
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, test } from 'vitest';
import { draftFolders, excludeDrafts, marker } from './drafts.ts';

describe('excludeDrafts', () => {
	const code = `import.meta.glob(['/content/blog/posts/*/*.md', ${marker}], { eager: true });`;

	test('turns the marker into one exclusion per draft folder', () => {
		expect(excludeDrafts(code, ['/content/blog/posts/a', '/content/blog/posts/b'])).toBe(
			"import.meta.glob(['/content/blog/posts/*/*.md', '!/content/blog/posts/a/**', '!/content/blog/posts/b/**'], { eager: true });"
		);
	});

	test('keeps the marker when there are no drafts', () => {
		expect(excludeDrafts(code, [])).toBe(code);
	});

	test('replaces every marker in the file', () => {
		const twice = `${code}\n${code}`;
		expect(excludeDrafts(twice, ['/content/x']).match(/!\/content\/x\/\*\*/g)).toHaveLength(2);
	});
});

describe('draftFolders', () => {
	const root = mkdtempSync(join(tmpdir(), 'drafts-'));
	const write = (path: string, text: string) => {
		mkdirSync(join(root, path, '..'), { recursive: true });
		writeFileSync(join(root, path), text);
	};
	write('content/blog/posts/a/a.md', '---\ntitle: A\ndraft: true\n---\n\nText.\n');
	write('content/blog/posts/a/a.es.md', '---\ntitle: A\nreviewed: false\n---\n\nTexto.\n');
	write('content/blog/posts/b/b.md', '---\ntitle: B\n---\n\nText.\n');
	write('content/blog/posts/c/c.md', '---\ntitle: C\ndraft: false\n---\n\nText.\n');
	// Not a post: a README next to the folders, and a file that isn't named like its folder.
	write('content/blog/posts/README.md', '---\ndraft: true\n---\n');
	write('content/blog/posts/d/notes.md', '---\ndraft: true\n---\n');
	afterAll(() => rmSync(root, { recursive: true, force: true }));

	test('finds the folders whose English file says draft: true', () => {
		expect(draftFolders(root)).toEqual(['/content/blog/posts/a']);
	});
});
