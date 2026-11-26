// The body of a post or Devlog entry: its markdown file, compiled to a Svelte component
// by mdsvex (vite.config.ts). The [slug] pages show it.
// Each section's +page.ts makes its own lazy glob and passes it here: a page downloads
// the list of its own section's files only (every entry costs a few dozen bytes in it),
// and each body is its own chunk, loaded only by the page that shows it. The posts'
// glob ends with the drafts marker (drafts.ts), so a build leaves drafts out.
import type { Component } from 'svelte';
import type { Media } from '#lib/markdown/media.ts';

// plugin_data.blocks.files: the ./files the post's blocks name (markdown/blocks-plugin.ts).
export type Body = { default: Component; plugin_data?: { blocks?: { files?: string[] } } };
export type Bodies = Record<string, () => Promise<Body>>;

const missing = (file: string, src: string): never => {
	throw new Error(`${file}: ${src} isn't one of the files its blocks name`);
};
const noFiles: Media = { picture: missing, url: missing };

// bodies: a section's glob, made with base: folder, so its keys are short
// ('./<slug>/<slug>.md'). path: an entry's path (content.ts). The component, and the
// files its blocks need, loaded (media.ts, itself loaded only when there are some).
export async function bodyOf(bodies: Bodies, folder: string, path: string) {
	const load = bodies[`.${path.slice(folder.length)}`];
	if (!load) throw new Error(`${path}: no markdown file with that path`);
	const module = await load();
	const files = module.plugin_data?.blocks?.files ?? [];
	const media = files.length
		? (await import('#lib/markdown/media.ts')).mediaFor(path, files)
		: noFiles;
	return { component: module.default, media: await media };
}
