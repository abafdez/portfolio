import { error } from '@sveltejs/kit';
import { allPosts, inLocale, isTranslated } from '#lib/content.ts';
import { localeOf } from '#lib/i18n/locales.ts';
import type { EntryGenerator, PageServerLoad } from './$types';

// One page per post. In a build allPosts has no drafts, so no draft page is made.
// Prerendered in the build, like every page (root +layout.ts). Not in dev, where nothing is
// prerendered anyway: SvelteKit refuses url.searchParams on a prerendered page, and the
// CMS's live preview needs ?preview (see load below).
export const prerender = !import.meta.env.DEV;

export const entries: EntryGenerator = () => allPosts.map(({ slug }) => ({ slug }));

// The post in the page's language, or in English when it isn't translated yet (the
// page then says so, and search engines are pointed at the English page).
export const load: PageServerLoad = async ({ params, url }) => {
	const original = allPosts.find(({ slug }) => slug === params.slug);
	if (!original) error(404, 'No post with that name');
	let post = inLocale(original, localeOf(url));
	// The CMS's live preview (dev only, see preview.ts): the frontmatter as typed, unsaved.
	if (import.meta.env.DEV && url.searchParams.has('preview')) {
		const { previewMeta } = await import('#lib/preview.server.ts');
		post = { ...post, ...previewMeta(post.path) };
	}
	return { post, translated: isTranslated(post), crumb: post.title };
};
