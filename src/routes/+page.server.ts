import { dev } from '$app/env';
import { allLog, allPosts } from '#lib/content.ts';
import type { PageServerLoad } from './$types';

// Runs at build time (the page is prerendered); the result is saved with the page.
export const load: PageServerLoad = () => ({
	// Every post is still a draft. Drafts only show in dev, so a build has no posts
	// until one is published (Phase 7).
	posts: allPosts.filter((post) => dev || !post.draft).slice(0, 3),
	log: allLog.slice(0, 4)
});
