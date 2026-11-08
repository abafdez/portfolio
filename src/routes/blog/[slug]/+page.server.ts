import { error } from '@sveltejs/kit';
import { allPosts, inLocale, isTranslated } from '#lib/content.ts';
import { localeOf } from '#lib/i18n/locales.ts';
import type { EntryGenerator, PageServerLoad } from './$types';

// One page per post. In a build allPosts has no drafts, so no draft page is made.
export const entries: EntryGenerator = () => allPosts.map(({ slug }) => ({ slug }));

// The post in the page's language, or in English when it isn't translated yet (the
// page then says so, and search engines are pointed at the English page).
export const load: PageServerLoad = ({ params, url }) => {
	const original = allPosts.find(({ slug }) => slug === params.slug);
	if (!original) error(404, 'No post with that name');
	const post = inLocale(original, localeOf(url));
	return { post, translated: isTranslated(post), crumb: post.title };
};
