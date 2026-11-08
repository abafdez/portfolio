import { allLog, byPhase, inLocale, tagCloud } from '#lib/content.ts';
import { localeOf } from '#lib/i18n/locales.ts';
import type { PageServerLoad } from './$types';

// The timeline: entries grouped by learning-path phase, newest phase first, and the tags
// beside it. composition: two columns, too wide for the Devlog's 'reading' layout.
export const load: PageServerLoad = ({ url }) => ({
	composition: 'default' as const,
	phases: byPhase(allLog.map((entry) => inLocale(entry, localeOf(url)))),
	tags: tagCloud(allLog)
});
