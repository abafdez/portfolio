import { describe, expect, test } from 'vitest';
import { updatedDay } from './content-dates.ts';
import { allLog, allPosts, inLocale, lastChanged } from './content.ts';

describe('updated dates', () => {
	test('a change on a later day is an update; on the day itself, or none, is not', () => {
		expect(updatedDay({ date: '2026-11-09', updated: '2026-11-26T18:02:11.000Z' })).toBe(
			'2026-11-26'
		);
		expect(updatedDay({ date: '2026-11-09', updated: '2026-11-09T22:00:00.000Z' })).toBeUndefined();
		expect(updatedDay({ date: '2026-11-09' })).toBeUndefined();
	});

	test('committed posts and entries get their date from git (git-dates.server.ts)', () => {
		const post = allPosts.find((p) => p.slug === '2026-10-20-sveltekit-3-github-pages-workflow')!;
		expect(post.updated).toMatch(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d/);
		expect(
			allLog.every(
				(entry) => entry.updated === undefined || !Number.isNaN(Date.parse(entry.updated))
			)
		).toBe(true);
	});

	test("the sitemap's day is the latest of either language, never before the post's date", () => {
		for (const post of allPosts) {
			const day = lastChanged(post);
			expect(day >= post.date).toBe(true);
			for (const locale of post.locales) {
				const updated = inLocale(post, locale).updated?.slice(0, 10);
				if (updated && updated > post.date) expect(day >= updated).toBe(true);
			}
		}
	});
});
