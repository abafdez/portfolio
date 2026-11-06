// The cover image of each blog post: a cover.png (or .jpg, .webp) in the post's folder,
// next to its markdown. Its alt text is the post's `cover:` frontmatter, and
// checkCover() in content.ts fails the build if one comes without the other.
// One image, three places: the thumbnail on the post's card (TeaserCard), the top of
// the post (ArticleHeader), and the link preview (og:image in Seo).
//
// The globs are eager, so what ships is one small object per cover (file names and
// sizes), not the images: the browser downloads only the ones a page shows.
import type { Picture } from '@sveltejs/enhanced-img';

// enhanced: AVIF and WebP copies plus a fallback, as a Picture for <enhanced:img>.
// w: the widths to make. With a `sizes` on the <enhanced:img>, the browser picks the
// smallest that's sharp enough: 480 for a card, 1600 for a wide post on a HiDPI screen.
// Covers should be 16:9, at least 1600 × 900.
const pictures = {
	...import.meta.glob<Picture>('/content/blog/published/*/cover.{png,jpg,jpeg,webp}', {
		eager: true,
		import: 'default',
		query: { enhanced: true, w: '1600;800;480' }
	}),
	// Drafts only exist in dev (see content.ts).
	...(import.meta.env.DEV
		? import.meta.glob<Picture>('/content/blog/drafts/*/cover.{png,jpg,jpeg,webp}', {
				eager: true,
				import: 'default',
				query: { enhanced: true, w: '1600;800;480' }
			})
		: {})
};

// For link previews: one JPEG, 1200 px wide, the size LinkedIn and Slack ask for.
// JPEG, not AVIF: not every service that reads og:image understands AVIF.
const previews = {
	...import.meta.glob<string>('/content/blog/published/*/cover.{png,jpg,jpeg,webp}', {
		eager: true,
		import: 'default',
		query: { w: '1200', format: 'jpg' }
	}),
	...(import.meta.env.DEV
		? import.meta.glob<string>('/content/blog/drafts/*/cover.{png,jpg,jpeg,webp}', {
				eager: true,
				import: 'default',
				query: { w: '1200', format: 'jpg' }
			})
		: {})
};

// '/content/blog/published/<slug>/cover.png' -> slug
const bySlug = <T>(files: Record<string, T>): Record<string, T> =>
	Object.fromEntries(
		Object.entries(files).map(([path, value]) => [path.split('/').at(-2)!, value])
	);

export const covers = bySlug(pictures);
export const coverPreviews = bySlug(previews);

// What a post's card shows next to its text: the cover, or without one a generated
// tile with its first tag (TeaserCard).
export const thumbnailOf = (post: { slug: string; tags?: string[] }) => ({
	cover: covers[post.slug],
	label: `#${post.tags?.[0] ?? 'post'}`
});
