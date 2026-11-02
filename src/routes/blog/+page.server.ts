import { allPosts, postsTagged, postTags } from '#lib/content.ts';
import type { PageServerLoad } from './$types';

// years: posts grouped by year, newest first (allPosts is already sorted that way,
// and Map.groupBy keeps the order). tags: every tag, A to Z, with how many posts use
// it. Drafts (and their tags) are only in these lists in dev.
export const load: PageServerLoad = () => ({
	years: [...Map.groupBy(allPosts, (post) => post.date.slice(0, 4))],
	tags: postTags.map((tag) => ({ tag, count: postsTagged(tag).length }))
});
