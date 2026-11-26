import { allLog, allPosts, inLocale } from '#lib/content.ts';
import { coverOf, withCover } from '#lib/covers.server.ts';
import { projects } from '#lib/projects/projects.ts';
import { localeOf } from '#lib/i18n/locales.ts';
import type { PageServerLoad } from './$types';

// Runs at build time (the page is prerendered); the result is saved with the page.
// Each entry in the page's language, or in English when it isn't translated yet.
// Posts and projects come with their covers (covers.server.ts).
export const load: PageServerLoad = async ({ url }) => ({
	// Drafts are only in the list in dev (see content.ts).
	posts: await Promise.all(
		allPosts.slice(0, 3).map((post) => withCover(inLocale(post, localeOf(url))))
	),
	log: allLog.slice(0, 4).map((entry) => inLocale(entry, localeOf(url))),
	// The featured projects' covers (screenshots in content/projects/<slug>/), by slug.
	projectCovers: Object.fromEntries(
		await Promise.all(
			projects
				.slice(0, 3)
				.map(async ({ slug }) => [slug, await coverOf(`/content/projects/${slug}`)] as const)
		)
	)
});
