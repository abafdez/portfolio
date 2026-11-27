// The mdsvex options the build (vite.config.ts) and the CMS preview
// (cms/mdsvex.svelte.ts) share, so a post compiles the same way in both.
import { external_links } from '@mdsvex/plugin-external-links';
import { steps } from '@mdsvex/plugin-steps';
import { tabs } from '@mdsvex/plugin-tabs';
import { toc } from '@mdsvex/plugin-toc';
import { blocksPlugin } from './blocks-plugin.ts';
import { directivesPlugin } from './directives-plugin.ts';
import { parsePlugins } from './plugins.ts';

export const compileOptions = {
	heading_ids: true,
	parse_plugins: parsePlugins,
	plugins: [
		// rel="external" on every link that leaves the site, like the site's own links
		// (ProjectHeader, ToolCredits…). Full links to the site itself stay plain.
		external_links({ rel: ['external'], internal_hosts: ['abafdez.github.io'] }),
		// ```video and ```yt (blocks.ts).
		blocksPlugin,
		// :kbd, :::details, :::compare (directives/).
		directivesPlugin,
		// :::tabs, :::steps and ::toc, mdsvex's own. Unstyled: global.css draws them in the
		// site's tokens, next to the callouts.
		tabs({ css: false }),
		steps({ css: false }),
		toc()
	]
	// No links option: Link.svelte adds the base and the page's language at run time.
};
