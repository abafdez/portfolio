import type { Component } from 'svelte';
import type { PageLoad } from './$types';

// Every post as a component, one chunk each (like the Bitácora's [slug] page).
// Vite makes a chunk for every file a glob matches, used or not, so the drafts glob
// is dev only: in a build the dead branch is removed and no draft ships.
const bodies = {
	...import.meta.glob<Component>('/content/blog/*.md', { import: 'default' }),
	...(import.meta.env.DEV
		? import.meta.glob<Component>('/content/blog/drafts/*.md', { import: 'default' })
		: {})
};

export const load: PageLoad = async ({ data, params }) => {
	const folder = data.post.draft ? '/content/blog/drafts' : '/content/blog';
	return { ...data, Body: await bodies[`${folder}/${params.slug}.md`]() };
};
