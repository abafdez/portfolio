import { error } from '@sveltejs/kit';
import { allLog } from '#lib/content.ts';
import type { EntryGenerator, PageServerLoad } from './$types';

// The pages to prerender: one per file in content/bitacora. Without this, the build
// only finds the entries that some page links to.
export const entries: EntryGenerator = () => allLog.map(({ slug }) => ({ slug }));

// The frontmatter, from the same list the landing uses.
export const load: PageServerLoad = ({ params }) => {
	const entry = allLog.find(({ slug }) => slug === params.slug);
	if (!entry) error(404, 'No Bitácora entry with that name');
	return { entry };
};
