import { allLog, allPosts } from '#lib/content.ts';
import type { PageServerLoad } from './$types';

// Runs at build time (the page is prerendered); the result is saved with the page.
export const load: PageServerLoad = () => ({
	// Drafts are only in the list in dev (see content.ts).
	posts: allPosts.slice(0, 3),
	log: allLog.slice(0, 4)
});
