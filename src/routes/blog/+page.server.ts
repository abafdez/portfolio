import { allPosts, inLocale, tagCloud } from '#lib/content.ts';
import { withCover } from '#lib/covers.server.ts';
import { localeOf } from '#lib/i18n/locales.ts';
import type { PageServerLoad } from './$types';

// years: posts grouped by year, newest first (allPosts is already sorted that way,
// and Map.groupBy keeps the order). tags: for the tag cloud (tagCloud() in content.ts).
// Drafts (and their tags) are only in these lists in dev.
// composition: this page isn't one column of text like the posts under it
// (/blog/+layout.ts says 'reading'): it has posts and the tags side by side.
// Each post comes with its cover (withCover() in covers.server.ts).
export const load: PageServerLoad = async ({ url }) => ({
	composition: 'default' as const,
	years: [
		...Map.groupBy(
			await Promise.all(allPosts.map((post) => withCover(inLocale(post, localeOf(url))))),
			(post) => post.date.slice(0, 4)
		)
	],
	tags: tagCloud(allPosts)
});
