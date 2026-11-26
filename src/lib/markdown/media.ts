// How a renderer finds a file written next to a post (./diagram.png, ./clip.mp4).
// An interface, not globs, so the same renderers can run where the files come from
// somewhere else: the site uses mdsvex/media.ts (Vite's globs); the CMS preview
// answers with Sveltia's getAsset().
import type { Picture } from '@sveltejs/enhanced-img';

export interface Media {
	// An image, for <enhanced:img src={…}>: its AVIF/WebP copies and size. A plain URL
	// string works too (enhanced:img draws a plain <img> for it).
	picture(file: string, src: string): Picture | string;
	// Any file's URL (a video, a poster). Fails the build if the file isn't there.
	url(file: string, src: string): string;
}
