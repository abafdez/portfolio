// The cover next to each entry, as a URL the dev server serves: for the focal-point field
// and the preview's header. Sveltia's getAsset() only finds files in a collection's media
// folder as it knows it, and it didn't find these. A glob of URLs is a list of strings,
// not the images.
// No query: an image import without one is a plain asset URL. With '?url', imagetools
// (enhanced-img) reads the query as instructions and re-encodes every cover at full size
// before /admin can load: 57 big AVIFs, minutes of work, then a cache full of them.
const urls = import.meta.glob<string>('/content/**/cover.{avif,png,jpg,jpeg,webp}', {
	eager: true,
	import: 'default'
});

// 'content/blog/posts/<slug>/<slug>.md' (Sveltia's path for the entry) → its cover.
export function coverOf(path: string): string | undefined {
	const folder = `/${path.replace(/\/[^/]*$/, '')}/cover.`;
	return Object.entries(urls).find(([file]) => file.startsWith(folder))?.[1];
}
