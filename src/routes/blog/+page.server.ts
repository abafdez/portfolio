import { allPosts, postsTagged, postTags } from '#lib/content.ts';
import { hueOf } from '#lib/hue.ts';
import type { PageServerLoad } from './$types';

// years: posts grouped by year, newest first (allPosts is already sorted that way,
// and Map.groupBy keeps the order). tags: every tag with how many posts use it and a
// hue for its colour, the most used first (A to Z when they tie). Drafts (and their
// tags) are only in these lists in dev.
// composition: this page isn't one column of text like the posts under it
// (/blog/+layout.ts says 'reading'): it has posts and the tags side by side.
export const load: PageServerLoad = () => ({
	composition: 'default' as const,
	years: [...Map.groupBy(allPosts, (post) => post.date.slice(0, 4))],
	tags: postTags
		.map((tag) => ({ tag, count: postsTagged(tag).length, hue: hueOf(tag) }))
		.sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
});
