import { error } from '@sveltejs/kit';
import { allPosts } from '#lib/content.ts';
import type { EntryGenerator, PageServerLoad } from './$types';

// One page per post. In a build allPosts has no drafts, so no draft page is made.
export const entries: EntryGenerator = () => allPosts.map(({ slug }) => ({ slug }));

export const load: PageServerLoad = ({ params }) => {
	const post = allPosts.find(({ slug }) => slug === params.slug);
	if (!post) error(404, 'No post with that name');
	return { post, crumb: post.title };
};
