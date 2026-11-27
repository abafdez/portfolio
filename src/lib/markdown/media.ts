// The files next to the posts and Devlog entries that our blocks name (::video's src,
// webm and poster, ::yt's thumbnail), for their components. The blocks plugin lists a
// post's files (blocks.ts); the [slug] pages' +page.ts loads them before the page shows,
// on the server while prerendering and in the browser on navigation.
// (A markdown image doesn't need this: mdsvex imports it from the post itself.)
// Lazy globs: each file is its own chunk, fetched only by a post that uses it, before
// rendering (a component can't wait). Every file a glob matches still goes into
// the build, used or not, so drafts' files are left out with '!/:drafts:' (drafts.ts).
// Covers are left out (covers.server.ts has them, at the sizes cards need). '!**/cover.*',
// not '!/content/**/cover.*': a negative pattern that starts with / and has ** in the
// middle excludes nothing.
import type { Picture } from '@sveltejs/enhanced-img';

// How a component finds a file written next to a post (./clip.mp4): as an interface, so
// the CMS preview can answer with Sveltia's getAsset() instead.
export interface Media {
	// An image, for <enhanced:img src={…}>: its AVIF/WebP copies and size. A plain URL
	// string works too (enhanced:img draws a plain <img> for it).
	picture(file: string, src: string): Picture | string;
	// Any file's URL (a video, a poster). Fails the build if the file isn't there.
	url(file: string, src: string): string;
}

type Load<T> = () => Promise<T>;

const pictures: Record<string, Load<Picture>> = import.meta.glob<Picture>(
	[
		'/content/blog/posts/*/*.{avif,png,jpg,jpeg,webp}',
		'/content/bitacora/*/*.{avif,png,jpg,jpeg,webp}',
		'!**/cover.*',
		'!/:drafts:'
	],
	// ?enhanced, as mdsvex writes it: an image a post also shows is the same module.
	{ import: 'default', query: '?enhanced' }
);

const files: Record<string, Load<string>> = import.meta.glob<string>(
	['/content/blog/posts/*/*.{mp4,webm,vtt}', '/content/bitacora/*/*.{mp4,webm,vtt}', '!/:drafts:'],
	{ import: 'default', query: '?url' }
);

// '/content/blog/posts/x/x.md' + './a.png' -> '/content/blog/posts/x/a.png'
const pathOf = (file: string, src: string) =>
	`${file.slice(0, file.lastIndexOf('/'))}/${src.replace(/^\.\//, '')}`;

const missing = (file: string, src: string): never => {
	throw new Error(`${file}: ${src} isn't next to the post`);
};

// The files a post's blocks use, loaded, as a Media its renderers can ask
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
