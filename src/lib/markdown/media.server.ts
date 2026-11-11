// The files next to the posts and Devlog entries, for the renderers (media.ts), on the server only:
// what a page gets is the HTML that points at the files, not this list.
// Lazy globs: each file is imported only when a post uses it, before rendering (a
// renderer can't wait, like Shiki's languages). Lazy for a second reason: drafts must
// not reach a build. An eager glob becomes imports at the top of the module, which
// imagetools processes (and writes into the build) even inside a DEV-only branch; a lazy
// one stays inside the branch, which the build removes.
// Covers are left out (covers.ts has them, at the sizes cards need). '!**/cover.*', not
// '!/content/**/cover.*': a negative pattern that starts with / and has ** in the middle
// excludes nothing.
import type { Picture } from '@sveltejs/enhanced-img';
import type { Media } from './media.ts';

type Load<T> = () => Promise<T>;

const pictures: Record<string, Load<Picture>> = {
	...import.meta.glob<Picture>(
		[
			'/content/blog/published/*/*.{avif,png,jpg,jpeg,webp}',
			'/content/bitacora/*/*.{avif,png,jpg,jpeg,webp}',
			'!**/cover.*'
		],
		{ import: 'default', query: { enhanced: true } }
	),
	...(import.meta.env.DEV
		? import.meta.glob<Picture>(
				['/content/blog/drafts/*/*.{avif,png,jpg,jpeg,webp}', '!**/cover.*'],
				{ import: 'default', query: { enhanced: true } }
			)
		: {})
};

const files: Record<string, Load<string>> = {
	...import.meta.glob<string>(
		['/content/blog/published/*/*.{mp4,webm,vtt}', '/content/bitacora/*/*.{mp4,webm,vtt}'],
		{
			import: 'default',
			query: '?url'
		}
	),
	...(import.meta.env.DEV
		? import.meta.glob<string>('/content/blog/drafts/*/*.{mp4,webm,vtt}', {
				import: 'default',
				query: '?url'
			})
		: {})
};

// '/content/blog/published/x/x.md' + './a.png' -> '/content/blog/published/x/a.png'
const pathOf = (file: string, src: string) =>
	`${file.slice(0, file.lastIndexOf('/'))}/${src.replace(/^\.\//, '')}`;

const missing = (file: string, src: string): never => {
	throw new Error(`${file}: ${src} isn't next to the post`);
};

// The files a post uses (parse.ts lists them), loaded, as a Media its renderers can ask
// without waiting. A missing file fails the build here, naming the post.
export async function mediaFor(file: string, sources: Iterable<string>): Promise<Media> {
	const found = new Map<string, Picture | string>();
	for (const src of sources) {
		const path = pathOf(file, src);
		const load = pictures[path] ?? files[path] ?? missing(file, src);
		found.set(src, await load());
	}
	const get = (src: string) => found.get(src) ?? missing(file, src);
	return {
		picture: (_file, src) => get(src),
		// An image (a poster) is the fallback copy enhanced-img made: no second copy of it.
		url: (_file, src) => {
			const value = get(src);
			return typeof value === 'string' ? value : value.img.src;
		}
	};
}
