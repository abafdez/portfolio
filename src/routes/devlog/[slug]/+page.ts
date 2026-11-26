import { bodyOf } from '#lib/bodies.ts';
import type { PageLoad } from './$types';

// The body is a component (mdsvex compiles the markdown file, bodies.ts), and a server
// load can only return data, so it's added here, in a universal load: on the server
// while prerendering, in the browser when you navigate to the page.
// Its blocks' files (videos, thumbnails) come with it.
export const load: PageLoad = async ({ data }) => {
	const { component, media } = await bodyOf(data.entry.path);
	return { ...data, body: component, media };
};
