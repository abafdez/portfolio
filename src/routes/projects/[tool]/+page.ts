import { error } from '@sveltejs/kit';
import { projects } from '#lib/projects/projects.ts';
import type { EntryGenerator, PageLoad } from './$types';

// One page per project. /projects links to all of them, but entries() makes sure each
// one is built even if a link goes missing.
// Not the tools with a route of their own (no tool here): two routes can't build the
// same page.
export const entries: EntryGenerator = () =>
	projects.filter(({ tool }) => tool).map(({ slug }) => ({ tool: slug }));

// A universal load (+page.ts), not a server one: it returns a component, which can't be
// serialized. It runs at build time, then in the browser on client-side navigation.
export const load: PageLoad = async ({ params }) => {
	const project = projects.find(({ slug }) => slug === params.tool);
	if (!project?.tool) error(404, 'No project with that name');
	const { default: Tool } = await project.tool();
	return { project, Tool, crumb: project.title };
};
