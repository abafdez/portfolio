import { allLists } from '#lib/awesome/awesome.ts';
import type { PageServerLoad } from './$types';

// Only what the cards show: the links (and their many tags) stay on each list's page.
export const load: PageServerLoad = () => ({
	lists: allLists.map(({ slug, title, description, updated }) => ({
		slug,
		title,
		description,
		updated
	}))
});
