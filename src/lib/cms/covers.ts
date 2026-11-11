// The cover next to each entry, as a URL the dev server serves: for the focal-point field
// and the preview's header. Sveltia's getAsset() only finds files in a collection's media
// folder as it knows it, and it didn't find these. A glob of URLs is a list of strings,
// not the images.
const urls = import.meta.glob<string>('/content/**/cover.{avif,png,jpg,jpeg,webp}', {
	eager: true,
	import: 'default',
	query: '?url'
});

// 'content/blog/published/<slug>/<slug>.md' (Sveltia's path for the entry) → its cover.
export function coverOf(path: string): string | undefined {
	const folder = `/${path.replace(/\/[^/]*$/, '')}/cover.`;
	return Object.entries(urls).find(([file]) => file.startsWith(folder))?.[1];
}
