import { error } from '@sveltejs/kit';
import { allLists, listIn } from '#lib/awesome/awesome.ts';
import { localeOf } from '#lib/i18n/locales.ts';
import type { EntryGenerator, PageServerLoad } from './$types';

// One page per YAML file in content/awesome/.
export const entries: EntryGenerator = () => allLists.map(({ slug }) => ({ list: slug }));

// The list in the page's language. translated: whether it has one (if not, the
// Spanish page shows the English list and says so, see Seo.svelte).
export const load: PageServerLoad = ({ params, url }) => {
	const data = allLists.find(({ slug }) => slug === params.list);
	if (!data) error(404, 'No list with that name');
	const list = listIn(data, localeOf(url));
	return { list, translated: data.translated, crumb: list.title };
};
