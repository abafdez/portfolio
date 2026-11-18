// A cover image, as the load functions hand it to the pages (covers.server.ts finds and
// loads it). One image, several jobs: the card's thumbnail (TeaserCard), the top of the
// page (ArticleHeader), and the link preview (og:image in Seo).
import type { Picture } from '@sveltejs/enhanced-img';

export interface Cover {
	// 16:9, at 1600, 800 and 480 px wide.
	picture: Picture;
	// Cropped square from the middle, at 480 and 240 px.
	square: Picture;
	// A 1200 px JPEG for og:image.
	preview: string;
}

// What a card shows next to its text: the cover, or without one a generated tile
// with the first tag (TeaserCard).
export const thumbnailOf = (item: { coverImage?: Cover; tags?: string[] }) => ({
	cover: item.coverImage,
	label: `#${item.tags?.[0] ?? 'post'}`
});
