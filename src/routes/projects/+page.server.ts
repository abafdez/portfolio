import { coverOf } from '#lib/covers.server.ts';
import { projects } from '#lib/projects/projects.ts';
import type { PageServerLoad } from './$types';

// Each project's cover (a screenshot in content/projects/<slug>/), by slug: the list
// itself is imported by the page, and only the covers need the server.
export const load: PageServerLoad = async () => ({
	covers: Object.fromEntries(
		await Promise.all(
			projects.map(async ({ slug }) => [slug, await coverOf(`/content/projects/${slug}`)] as const)
		)
	)
});
