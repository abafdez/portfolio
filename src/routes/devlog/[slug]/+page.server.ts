import { error } from '@sveltejs/kit';
import { allLog, inLocale, isTranslated } from '#lib/content.ts';
import { localeOf } from '#lib/i18n/locales.ts';
import type { EntryGenerator, PageServerLoad } from './$types';

// The pages to prerender: one per file in content/bitacora. Without this, the build
// only finds the entries that some page links to.
// Prerendered in the build, like every page (root +layout.ts). Not in dev, where nothing is
// prerendered anyway: SvelteKit refuses url.searchParams on a prerendered page, and the
// CMS's live preview needs ?preview (see load below).
export const prerender = !import.meta.env.DEV;

export const entries: EntryGenerator = () => allLog.map(({ slug }) => ({ slug }));

// The frontmatter, from the same list the landing uses.
// The entry in the page's language, or in English when it isn't translated yet.
export const load: PageServerLoad = async ({ params, url }) => {
	const original = allLog.find(({ slug }) => slug === params.slug);
	if (!original) error(404, 'No devlog entry with that name');
	let entry = inLocale(original, localeOf(url));
	// The CMS's live preview (dev only, see preview.ts): the frontmatter as typed, unsaved.
	if (import.meta.env.DEV && url.searchParams.has('preview')) {
		const { previewMeta } = await import('#lib/preview.server.ts');
		entry = { ...entry, ...previewMeta(entry.path) };
	}
	return { entry, translated: isTranslated(entry), crumb: entry.title };
};
