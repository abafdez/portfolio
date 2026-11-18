// covers.ts for the CMS on the live site (vite.config.ts in this folder swaps it in).
// There, covers.ts's glob would copy every original cover into build/admin (23 MB), just
// so the preview can show the one being edited. Instead, the build writes down where each
// cover is in the repo (__CMS_COVERS__), and the preview loads it from GitHub. A cover
// added in the CMS and not merged yet isn't on GitHub's main branch, but the preview
// finds that one through Sveltia's getAsset() first (preview.ts).
declare const __CMS_COVERS__: Record<string, string>;

// 'content/blog/posts/<slug>/<slug>.md' (Sveltia's path for the entry) → its cover.
export function coverOf(path: string): string | undefined {
	const folder = `/${path.replace(/\/[^/]*$/, '')}/cover.`;
	return Object.entries(__CMS_COVERS__).find(([file]) => file.startsWith(folder))?.[1];
}
