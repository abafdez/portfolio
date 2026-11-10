import type { Component } from 'svelte';
import { previewPath } from '#lib/preview.ts';
import type { PageLoad } from './$types';

// Every post as a component, one chunk each (like the Devlog's [slug] page).
// Vite makes a chunk for every file a glob matches, used or not, so the drafts glob
// is dev only: in a build the dead branch is removed and no draft ships.
const bodies = {
	...import.meta.glob<Component>('/content/blog/published/*/*.md', { import: 'default' }),
	...(import.meta.env.DEV
		? import.meta.glob<Component>('/content/blog/drafts/*/*.md', { import: 'default' })
		: {})
};

// data.post.path is the file the post's text is in: <slug>.md, or <slug>.es.md when the
// page is Spanish and the post is translated (+page.server.ts picked it). Translations
// match the globs too, so each is a chunk of its own.
// With ?preview in dev, the CMS's unsaved copy instead (see preview.ts): Vite updates it
// in place as it changes, so the page follows the typing without reloading.
const previews = import.meta.env.DEV
	? import.meta.glob<Component>('/content/blog/*/*/.preview*.md', { import: 'default' })
	: {};

export const load: PageLoad = async ({ data, url }) => {
	const preview =
		import.meta.env.DEV && url.searchParams.has('preview')
			? previews[previewPath(data.post.path)]
			: undefined;
	return { ...data, Body: await (preview ?? bodies[data.post.path])() };
};
