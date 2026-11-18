// Cover images: a cover.avif (or .png, .jpg, .webp) in a content folder, next to the
// markdown it belongs to. Its alt text is that file's `cover:` frontmatter, and
// checkCover() in content.ts fails the build if one comes without the other.
// Found by folder, so the same code serves blog posts today and Devlog entries,
// Awesome lists or a whole section later.
//
// One image, several jobs: the card's thumbnail (TeaserCard), the top of the page
// (ArticleHeader), and the link preview (og:image in Seo).
//
// On the server only: the load functions add each post's cover to the data they return
// (withCover()), so a page gets the covers it shows and nothing else. When the pages
// imported these globs themselves, every cover's file name, drafts' too, was in the
// browser's JavaScript.
//
// Lazy globs: a cover is only read when a page shows it. Every file a glob matches still
// goes into the build, so drafts are left out with '!/:drafts:' (drafts.ts).
import type { Picture } from '@sveltejs/enhanced-img';
import type { Cover } from './covers.ts';

type Load<T> = () => Promise<T>;

// The cover as it is: 16:9, for the top of a page and a card's picture when it sits
// on top of the text. enhanced: AVIF and WebP copies plus a fallback; w: the widths,
// so with `sizes` the browser picks the smallest sharp one. Covers should be 16:9, at
// least 1600 × 900, with what matters in the middle (see squares).
const pictures: Record<string, Load<Picture>> = import.meta.glob<Picture>(
	['/content/**/cover.{avif,png,jpg,jpeg,webp}', '!/:drafts:'],
	{ import: 'default', query: { enhanced: true, w: '1600;800;480' } }
);

// The same cover cropped square at build time (aspect 1:1 keeps the middle), for a
// card's thumbnail beside the text. Cropped here, not with CSS: a CSS crop of the 16:9
// file would need a much wider file to stay sharp at that height.
// A CMS could one day pick a focal point instead of the middle.
const squares: Record<string, Load<Picture>> = import.meta.glob<Picture>(
	['/content/**/cover.{avif,png,jpg,jpeg,webp}', '!/:drafts:'],
	{ import: 'default', query: { enhanced: true, w: '480;240', aspect: '1:1' } }
);

// For link previews: one JPEG, 1200 px wide, the size LinkedIn and Slack ask for.
// JPEG, not AVIF: not every service that reads og:image understands AVIF.
const previews: Record<string, Load<string>> = import.meta.glob<string>(
	['/content/**/cover.{avif,png,jpg,jpeg,webp}', '!/:drafts:'],
	{ import: 'default', query: { w: '1200', format: 'jpg' } }
);

// Every cover file, for content.ts to check each has its alt text.
export const coverFiles = Object.keys(pictures);

// '/content/blog/posts/<slug>/cover.png' -> '/content/blog/posts/<slug>'
const folderOf = (path: string) => path.slice(0, path.lastIndexOf('/'));

// The cover of the content in a folder (Entry.folder in content.ts), if it has one.
export async function coverOf(folder: string): Promise<Cover | undefined> {
	const path = coverFiles.find((file) => folderOf(file) === folder);
	if (!path) return undefined;
	const [picture, square, preview] = await Promise.all([
		pictures[path](),
		squares[path](),
		previews[path]()
	]);
	return { picture, square, preview };
}

// An entry with its cover as coverImage (cover is the alt text), for a load function.
export async function withCover<T extends { folder: string }>(
	item: T
): Promise<T & { coverImage?: Cover }> {
	return { ...item, coverImage: await coverOf(item.folder) };
}
