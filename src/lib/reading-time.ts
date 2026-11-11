// Minutes to read a file (its text without the frontmatter), rounded up. 200 words a
// minute: a bit under the usual ~238 for non-fiction, because the posts are technical
// and full of code. Code counts as words too.
// Its own file so the CMS preview can use it without content.ts, which imports every
// post's text.
const frontmatter = /^---\r?\n[\s\S]*?\r?\n---/;

export function readingTime(text: string): number {
	const words = text.replace(frontmatter, '').match(/\S+/g)?.length ?? 0;
	return Math.max(1, Math.ceil(words / 200));
}
