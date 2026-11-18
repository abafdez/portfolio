import { allLog, allPosts, inLocale } from '#lib/content.ts';
import { withCover } from '#lib/covers.server.ts';
import { localeOf } from '#lib/i18n/locales.ts';
import type { PageServerLoad } from './$types';

// Runs at build time (the page is prerendered); the result is saved with the page.
// Each entry in the page's language, or in English when it isn't translated yet.
// Posts come with their covers (withCover() in covers.server.ts).
export const load: PageServerLoad = async ({ url }) => ({
	// Drafts are only in the list in dev (see content.ts).
	posts: await Promise.all(
		allPosts.slice(0, 3).map((post) => withCover(inLocale(post, localeOf(url))))
	),
	log: allLog.slice(0, 4).map((entry) => inLocale(entry, localeOf(url)))
});
