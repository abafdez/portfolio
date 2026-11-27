// When each file in content/ was last committed: one `git log` for all of them, read once
// when the build (or the dev server) starts. Newest commits come first, so a file's first
// appearance is its last change; a file moved without a change keeps the dates of its
// old name. '/content/…' paths (as content.ts's globs name them) to an ISO date-time,
// the committer's.
// A file not committed yet has no date, and neither does anything when git isn't there
// (a copy of the repo without its history): the map is just empty. CI checks out the
// whole history for this (fetch-depth: 0 in the workflow); a shallow clone would date
// every file to its one commit.
// (mdsvex's page-data plugin does the same with last_modified: 'git', but in 1.1.0 it
// can't build a post with :::steps: a static directive and a plugin that defers work
// clash, fixed on mdsvex's main branch and not released yet.)
import { execFileSync } from 'node:child_process';

export function lastCommits(folder = 'content'): Map<string, string> {
	const dates = new Map<string, string>();
	let log: string;
	try {
		// --name-status -M: each touched file with how (A added, M modified, R<score> renamed
		// from a path, with a similarity score: R100 is a move that changed nothing).
		log = execFileSync('git', ['log', '-M', '--format=%x00%cI', '--name-status', '--', folder], {
			encoding: 'utf8',
			maxBuffer: 64 * 1024 * 1024,
			stdio: ['ignore', 'pipe', 'ignore']
		});
	} catch {
		return dates;
	}
	// A file's older commits under an earlier name count for its name now: old → new.
	const renamed = new Map<string, string>();
	const current = (path: string) => renamed.get(path) ?? path;
	const touch = (path: string, date: string) => {
		const name = `/${current(path)}`;
		if (!dates.has(name)) dates.set(name, date);
	};
	// Each commit: \0 its date, a blank line, then one line per file: status, path(s).
	for (const commit of log.split('\0').slice(1)) {
		const [date, ...lines] = commit.split('\n');
		for (const line of lines) {
			const [status, path, to] = line.split('\t');
			if (!status) continue;
			if (status.startsWith('R')) {
				renamed.set(path, current(to));
				// A move that changed nothing (the posts' folder move, 2026-11-18) isn't an update.
				if (status !== 'R100') touch(to, date);
			} else touch(path, date);
		}
	}
	return dates;
}
