import type { Component } from 'svelte';
import { previewPath } from '#lib/preview.ts';
import type { PageLoad } from './$types';

// Every entry as a Svelte component (mdsvex compiles the markdown, see vite.config.ts).
// Each one is content/devlog/<slug>/<slug>.md, next to its images.
// Not eager: each value is a function that imports one file, so the browser only
// downloads the entry it shows.
const bodies = import.meta.glob<Component>('/content/bitacora/*/*.md', { import: 'default' });

// Runs after +page.server.ts and receives its data. A component can't be serialized,
// so it has to be loaded here, not on the server.
// data.entry.path is the file in the page's language (see +page.server.ts).
// With ?preview in dev, the CMS's unsaved copy instead (see preview.ts and the blog's page).
const previews = import.meta.env.DEV
	? import.meta.glob<Component>('/content/bitacora/*/.preview*.md', { import: 'default' })
	: {};

export const load: PageLoad = async ({ data, url }) => {
	const preview =
		import.meta.env.DEV && url.searchParams.has('preview')
			? previews[previewPath(data.entry.path)]
			: undefined;
	return { ...data, Body: await (preview ?? bodies[data.entry.path])() };
};
