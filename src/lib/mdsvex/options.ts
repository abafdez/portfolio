// The mdsvex options the build (vite.config.ts) and the CMS preview
// (cms/mdsvex.svelte.ts) share, so a post compiles the same way in both.
import { external_links } from '@mdsvex/plugin-external-links';
import { parsePlugins } from './plugins.ts';

export const compileOptions = {
	heading_ids: true,
	parse_plugins: parsePlugins,
	// rel="external" on every link that leaves the site, like the site's own links
	// (ProjectHeader, ToolCredits…). Full links to the site itself stay plain.
	plugins: [external_links({ rel: ['external'], internal_hosts: ['abafdez.github.io'] })]
	// No links option: Link.svelte adds the base and the page's language at run time.
};
