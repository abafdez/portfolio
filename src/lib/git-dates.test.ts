import { expect, test } from 'vitest';
import { execFileSync } from 'node:child_process';
import { lastCommits } from './git-dates.server.ts';

test("a file's date is its last commit's", () => {
	const dates = lastCommits();
	// Last committed with a real edit (the ::video migration), not a move.
	const file =
		'content/blog/posts/2026-11-07-components-in-code-blocks/2026-11-07-components-in-code-blocks.md';
	const expected = execFileSync('git', ['log', '-1', '--format=%cI', '--', file], {
		encoding: 'utf8'
	}).trim();
	expect(dates.get(`/${file}`)).toBe(expected);
});

test('outside a repository, or for a folder git has never seen, no dates', () => {
	expect(lastCommits('no-such-folder').size).toBe(0);
});

test('a move that changed nothing is not a change: the date is from before the move', () => {
	// Every post moved into content/blog/posts/ on 2026-11-18 (R100), and this one has
	// not been touched since its own commits.
	const dates = lastCommits();
	const file =
		'content/blog/posts/2026-10-20-sveltekit-3-github-pages-workflow/2026-10-20-sveltekit-3-github-pages-workflow.md';
	const real = execFileSync(
		'git',
		['log', '-1', '-M', '--follow', '--diff-filter=AM', '--format=%cI', '--', file],
		{ encoding: 'utf8' }
	).trim();
	expect(dates.get(`/${file}`)).toBe(real);
});
