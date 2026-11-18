import { allLists } from '#lib/awesome/awesome.ts';
import { localeOf } from '#lib/i18n/locales.ts';
import type { PageServerLoad } from './$types';

// Only what the cards show: the links (and their many tags) stay on each list's page.
// In the page's language; a list that isn't translated yet is English, and says so.
export const load: PageServerLoad = ({ url }) => {
	const locale = localeOf(url);
	return {
		lists: allLists.map(({ slug, title, description, glyph, updated, translated }) => ({
			slug,
			title: title[locale],
			description: description[locale],
			glyph,
			updated,
			locale: translated ? locale : ('en' as const)
		}))
	};
};
