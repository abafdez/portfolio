import { error } from '@sveltejs/kit';
import { allPosts, inLocale, isTranslated } from '#lib/content.ts';
import { coverOf } from '#lib/covers.server.ts';
import { localeOf } from '#lib/i18n/locales.ts';
import type { EntryGenerator, PageServerLoad } from './$types';

// One page per post. In a build allPosts has no drafts, so no draft page is made.
export const entries: EntryGenerator = () => allPosts.map(({ slug }) => ({ slug }));

// The post in the page's language, or in English when it isn't translated yet (the
// page then says so, and search engines are pointed at the English page).
export const load: PageServerLoad = async ({ params, url }) => {
	const original = allPosts.find(({ slug }) => slug === params.slug);
	if (!original) error(404, 'No post with that name');
	const locale = localeOf(url);
	const post = inLocale(original, locale);
	const cover = await coverOf(post.folder);
	return { post, cover, translated: isTranslated(post), crumb: post.title };
};
