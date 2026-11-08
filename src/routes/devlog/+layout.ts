import type { LayoutLoad } from './$types';

// Long-form text: the reading composition (a narrow column), for this route and
// everything under it. `satisfies` checks the value against App.PageData and keeps
// 'reading' as that exact string instead of widening it to any string.
export const load: LayoutLoad = () => ({ composition: 'reading' }) satisfies App.PageData;
