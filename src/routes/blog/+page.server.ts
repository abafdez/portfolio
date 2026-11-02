import { allPosts } from '#lib/content.ts';
import type { PageServerLoad } from './$types';

// Posts grouped by year, newest first (allPosts is already sorted that way, and
// Map.groupBy keeps the order). Drafts are only in the list in dev.
export const load: PageServerLoad = () => ({
	years: [...Map.groupBy(allPosts, (post) => post.date.slice(0, 4))]
});
