import { allLog } from '#lib/content.ts';
import type { PageServerLoad } from './$types';

// The timeline: entries grouped by learning-path phase, newest phase first. Within a
// phase they stay newest first, as allLog sorts them. Map.groupBy keeps that order.
export const load: PageServerLoad = () => ({
	phases: [...Map.groupBy(allLog, (entry) => entry.phase)].sort(([a], [b]) => (b ?? -1) - (a ?? -1))
});
