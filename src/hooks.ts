// Hooks that run on both the server (prerendering) and the client (navigating).
// https://svelte.dev/docs/kit/hooks#Universal-hooks-reroute
import type { Reroute } from '@sveltejs/kit/hooks';
import { delocalize } from '#lib/i18n/locales.ts';

// /portfolio/es/blog is the /blog route, in Spanish. reroute tells SvelteKit which
// route a URL is, without changing the URL: the address bar and page.url keep the /es
// (that's how the root layout knows the language), but the route and its id stay
// '/blog', so one set of routes serves both languages.
export const reroute: Reroute = ({ url }) => delocalize(url.pathname);
