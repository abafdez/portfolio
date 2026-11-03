import { projects } from '#lib/projects/projects.ts';
import { cvSkills } from '#lib/projects/cv/skills.server.ts';
import type { PageServerLoad } from './$types';

// The CV builder has a route of its own, not /projects/[tool]: it needs data only the
// server can read (the skills), and here it gets them with their type. SvelteKit picks
// a fixed route over a [param] one, so /projects/cv lands here.
export const load: PageServerLoad = () => ({
	project: projects.find(({ slug }) => slug === 'cv')!,
	skills: cvSkills
});
