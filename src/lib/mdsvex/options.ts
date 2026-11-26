// The mdsvex options the build (vite.config.ts) and the CMS preview
// (cms/mdsvex.svelte.ts) share, so a post compiles the same way in both.
import { parsePlugins } from './plugins.ts';

export const compileOptions = { heading_ids: true, parse_plugins: parsePlugins };
