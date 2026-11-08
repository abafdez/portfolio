import { error } from '@sveltejs/kit';
import { allLog, inLocale, isTranslated } from '#lib/content.ts';
import { localeOf } from '#lib/i18n/locales.ts';
import type { EntryGenerator, PageServerLoad } from './$types';

// The pages to prerender: one per file in content/bitacora. Without this, the build
// only finds the entries that some page links to.
export const entries: EntryGenerator = () => allLog.map(({ slug }) => ({ slug }));

// The frontmatter, from the same list the landing uses.
// The entry in the page's language, or in English when it isn't translated yet.
export const load: PageServerLoad = ({ params, url }) => {
	const original = allLog.find(({ slug }) => slug === params.slug);
	if (!original) error(404, 'No devlog entry with that name');
	const entry = inLocale(original, localeOf(url));
	return { entry, translated: isTranslated(entry), crumb: entry.title };
};
