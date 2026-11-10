// Live preview from the CMS, dev only: while an entry is being edited, the CMS writes it,
// unsaved, to a hidden file next to it (cms/plugin.ts), and the entry's page renders that
// file instead when its URL has ?preview (the blog and Devlog [slug] pages).
// <slug>/<slug>.md → <slug>/.preview.md, <slug>/<slug>.es.md → <slug>/.preview.es.md:
// still Spanish to fileLocale(), its ./images still resolve, and a name starting with a dot
// matches none of the content globs (`*/*.md`), so it never becomes an entry.
export function previewPath(path: string) {
	return path.replace(/\/[^/]+?(\.[a-z]{2})?\.md$/, '/.preview$1.md');
}
