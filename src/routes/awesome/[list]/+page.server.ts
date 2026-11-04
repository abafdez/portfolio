import { error } from '@sveltejs/kit';
import { allLists } from '#lib/awesome/awesome.ts';
import type { EntryGenerator, PageServerLoad } from './$types';

// One page per YAML file in content/awesome/.
export const entries: EntryGenerator = () => allLists.map(({ slug }) => ({ list: slug }));

export const load: PageServerLoad = ({ params }) => {
	const list = allLists.find(({ slug }) => slug === params.list);
	if (!list) error(404, 'No list with that name');
	return { list, crumb: list.title };
};
