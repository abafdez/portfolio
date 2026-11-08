import type { Component } from 'svelte';
import type { PageLoad } from './$types';

// Every entry as a Svelte component (mdsvex compiles the markdown, see vite.config.ts).
// Each one is content/bitacora/<slug>/<slug>.md, next to its images.
// Not eager: each value is a function that imports one file, so the browser only
// downloads the entry it shows.
const bodies = import.meta.glob<Component>('/content/bitacora/*/*.md', { import: 'default' });

// Runs after +page.server.ts and receives its data. A component can't be serialized,
// so it has to be loaded here, not on the server.
// data.entry.path is the file in the page's language (see +page.server.ts).
export const load: PageLoad = async ({ data }) => ({
	...data,
	Body: await bodies[data.entry.path]()
});
