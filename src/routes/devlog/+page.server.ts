import { allLog, inLocale } from '#lib/content.ts';
import { localeOf } from '#lib/i18n/locales.ts';
import type { PageServerLoad } from './$types';

// The timeline: entries grouped by learning-path phase, newest phase first. Within a
// phase they stay newest first, as allLog sorts them. Map.groupBy keeps that order.
export const load: PageServerLoad = ({ url }) => ({
	phases: [
		...Map.groupBy(
			allLog.map((entry) => inLocale(entry, localeOf(url))),
			(entry) => entry.phase
		)
	].sort(([a], [b]) => (b ?? -1) - (a ?? -1))
});
