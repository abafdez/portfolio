// A project's cover and its alt text come together, like a post's (checkCover in
// content.ts): a screenshot nobody described, or alt text with no picture, fails.
import { existsSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { projects } from './projects.ts';

const coverOf = (slug: string) =>
	['avif', 'png', 'jpg', 'jpeg', 'webp'].find((ext) =>
		existsSync(`content/projects/${slug}/cover.${ext}`)
	);

describe('project covers', () => {
	test.each(projects.map(({ slug, cover }) => [slug, cover] as const))(
		'%s has a cover and its alt text, or neither',
		(slug, cover) => {
			expect(Boolean(coverOf(slug))).toBe(Boolean(cover?.en && cover.es));
		}
	);
});
