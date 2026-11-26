// The body of a post or Devlog entry: its markdown file, compiled to a Svelte component
// by mdsvex (vite.config.ts). The [slug] pages show it.
// Lazy globs: each body is its own chunk, loaded only by the page that shows it (and by
// the prerender). The posts' glob ends with the drafts marker (drafts.ts), so a build
// leaves drafts out; the Devlog has no drafts.
import type { Component } from 'svelte';

type Body = { default: Component };

const bodies: Record<string, () => Promise<Body>> = {
	...import.meta.glob<Body>(['/content/blog/posts/*/*.md', '!/:drafts:']),
	...import.meta.glob<Body>('/content/bitacora/*/*.md')
};

// path: an entry's path (content.ts), the same key the globs use.
export async function bodyOf(path: string): Promise<Component> {
	const load = bodies[path];
	if (!load) throw new Error(`${path}: no markdown file with that path`);
	return (await load()).default;
}
