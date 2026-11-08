import { error } from '@sveltejs/kit';
import { byPhase, inLocale, logTagged, logTags } from '#lib/content.ts';
import { localeOf } from '#lib/i18n/locales.ts';
import type { EntryGenerator, PageServerLoad } from './$types';

// One page per Devlog tag, like the blog's /blog/tags/[tag].
export const entries: EntryGenerator = () => logTags.map((tag) => ({ tag }));

export const load: PageServerLoad = ({ params, url }) => {
	const entries = logTagged(params.tag).map((entry) => inLocale(entry, localeOf(url)));
	if (!entries.length) error(404, 'No Devlog entries with that tag');
	// Grouped by phase like /devlog, which also gives the cards (h3) a heading (h2) above.
	return {
		tag: params.tag,
		crumb: `#${params.tag}`,
		count: entries.length,
		phases: byPhase(entries)
	};
};
