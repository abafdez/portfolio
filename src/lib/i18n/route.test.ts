import { globSync, readFileSync } from 'node:fs';
import { expect, test } from 'vitest';

// Links to pages go through route() (index.ts), which keeps the page's language. A
// resolve() from $app/paths would quietly send a Spanish reader to the English page,
// and nothing else would notice: the link works, it's just in the wrong language.
// Only these files may import it, each for a reason:
const allowed = [
	// route() and localize() are built on it.
	'src/lib/i18n/index.ts',
	// A file, not a page: the one logos.svg serves every language.
	'src/lib/skills/Icon.svelte',
	// An endpoint, not a page: it localizes each URL for each language itself.
	'src/routes/sitemap.xml/+server.ts'
];

test('only the allowed files import from $app/paths', () => {
	const importing = globSync('src/**/*.{ts,svelte}', { exclude: ['src/**/*.test.ts'] }).filter(
		(file) => readFileSync(file, 'utf8').includes("from '$app/paths'")
	);
	expect(importing.sort()).toEqual(allowed.sort());
});
