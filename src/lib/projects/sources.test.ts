// Every "source" link on a project page, and every file the 404 games list, points at
// something that exists in this repository: a renamed folder would leave a broken link.
import { existsSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { projects } from './projects.ts';
import { tools } from './toolbox/tools.ts';
import { shared, variants } from './not-found/variants.ts';

describe('source links', () => {
	test.each([...projects, ...tools].map(({ slug, source }) => [slug, source]))(
		'%s links its code',
		(_, source) => {
			expect(source).toBeDefined();
			expect(existsSync(source!)).toBe(true);
		}
	);

	test.each(variants.flatMap(({ files }) => files).concat(shared))('%s exists', (file) => {
		expect(existsSync(`src/lib/projects/not-found/${file}`)).toBe(true);
	});
});
