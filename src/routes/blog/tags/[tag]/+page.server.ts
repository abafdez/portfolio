import { error } from '@sveltejs/kit';
import { inLocale, postsTagged, postTags } from '#lib/content.ts';
import { localeOf } from '#lib/i18n/locales.ts';
import type { EntryGenerator, PageServerLoad } from './$types';

// One page per tag. In a build postTags has no draft-only tags, so none get a page.
export const entries: EntryGenerator = () => postTags.map((tag) => ({ tag }));

export const load: PageServerLoad = ({ params, url }) => {
	const posts = postsTagged(params.tag).map((post) => inLocale(post, localeOf(url)));
	if (!posts.length) error(404, 'No posts with that tag');
	// Grouped by year like /blog, which also gives the cards (h3) a heading (h2) above.
	return {
		tag: params.tag,
		crumb: `#${params.tag}`,
		count: posts.length,
		years: [...Map.groupBy(posts, (post) => post.date.slice(0, 4))]
	};
};
