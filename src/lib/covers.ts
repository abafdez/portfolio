// Cover images: a cover.avif (or .png, .jpg, .webp) in a content folder, next to the
// markdown it belongs to. Its alt text is that file's `cover:` frontmatter, and
// checkCover() in content.ts fails the build if one comes without the other.
// Found by folder, so the same code serves blog posts today and Devlog entries,
// Awesome lists or a whole section later.
//
// One image, several jobs: the card's thumbnail (TeaserCard), the top of the page
// (ArticleHeader), and the link preview (og:image in Seo).
//
// The globs are eager, so what ships is one small object per cover (file names and
// sizes), not the images: the browser downloads only the ones a page shows.
// Drafts' covers only exist in dev, like the drafts (content.ts).
import type { Picture } from '@sveltejs/enhanced-img';

// The cover as it is: 16:9, for the top of a page and a card's picture when it sits
// on top of the text. enhanced: AVIF and WebP copies plus a fallback; w: the widths,
// so with `sizes` the browser picks the smallest sharp one. Covers should be 16:9, at
// least 1600 × 900, with what matters in the middle (see squares).
const pictures = {
	...import.meta.glob<Picture>(
		['/content/**/cover.{avif,png,jpg,jpeg,webp}', '!/content/blog/drafts/**'],
		{ eager: true, import: 'default', query: { enhanced: true, w: '1600;800;480' } }
	),
	...(import.meta.env.DEV
		? import.meta.glob<Picture>('/content/blog/drafts/*/cover.{avif,png,jpg,jpeg,webp}', {
				eager: true,
				import: 'default',
				query: { enhanced: true, w: '1600;800;480' }
			})
		: {})
};

// The same cover cropped square at build time (aspect 1:1 keeps the middle), for a
// card's thumbnail beside the text. Cropped here, not with CSS: a CSS crop of the 16:9
// file would need a much wider file to stay sharp at that height.
// A CMS could one day pick a focal point instead of the middle.
const squares = {
	...import.meta.glob<Picture>(
		['/content/**/cover.{avif,png,jpg,jpeg,webp}', '!/content/blog/drafts/**'],
		{ eager: true, import: 'default', query: { enhanced: true, w: '480;240', aspect: '1:1' } }
	),
	...(import.meta.env.DEV
		? import.meta.glob<Picture>('/content/blog/drafts/*/cover.{avif,png,jpg,jpeg,webp}', {
				eager: true,
				import: 'default',
				query: { enhanced: true, w: '480;240', aspect: '1:1' }
			})
		: {})
};

// For link previews: one JPEG, 1200 px wide, the size LinkedIn and Slack ask for.
// JPEG, not AVIF: not every service that reads og:image understands AVIF.
const previews = {
	...import.meta.glob<string>(
		['/content/**/cover.{avif,png,jpg,jpeg,webp}', '!/content/blog/drafts/**'],
		{ eager: true, import: 'default', query: { w: '1200', format: 'jpg' } }
	),
	...(import.meta.env.DEV
		? import.meta.glob<string>('/content/blog/drafts/*/cover.{avif,png,jpg,jpeg,webp}', {
				eager: true,
				import: 'default',
				query: { w: '1200', format: 'jpg' }
			})
		: {})
};

export interface Cover {
	picture: Picture;
	square: Picture;
	preview: string;
}

// '/content/blog/published/<slug>/cover.png' -> '/content/blog/published/<slug>'
const folderOf = (path: string) => path.slice(0, path.lastIndexOf('/'));

const covers = new Map<string, Cover>(
	Object.entries(pictures).map(([path, picture]) => [
		folderOf(path),
		{ picture, square: squares[path], preview: previews[path] }
	])
);

// The cover of the content in a folder (Entry.folder in content.ts), if it has one.
export const coverOf = (folder: string): Cover | undefined => covers.get(folder);

// What a card shows next to its text: the cover, or without one a generated tile
// with the first tag (TeaserCard).
export const thumbnailOf = (item: { folder: string; tags?: string[] }) => ({
	cover: coverOf(item.folder),
	label: `#${item.tags?.[0] ?? 'post'}`
});
