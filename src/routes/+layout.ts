import { localeOf } from '#lib/i18n/locales.ts';
import type { LayoutLoad } from './$types';

export const prerender = true;

// Every page's language, from its URL (reroute in src/hooks.ts leaves the /es in it).
// It's in page.data on every page; components read it with getLocale() from #lib/i18n.
export const load: LayoutLoad = ({ url }) => ({ locale: localeOf(url) });
