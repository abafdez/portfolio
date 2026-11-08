import { projects } from '#lib/projects/projects.ts';
import { cvSkillsIn } from '#lib/projects/cv/skills.server.ts';
import { text } from '#lib/i18n/index.ts';
import { localeOf } from '#lib/i18n/locales.ts';
import type { PageServerLoad } from './$types';

// The CV builder has a route of its own, not /projects/[tool]: it needs data only the
// server can read (the skills), and here it gets them with their type. SvelteKit picks
// a fixed route over a [param] one, so /projects/cv lands here.
export const load: PageServerLoad = ({ url }) => {
	const project = projects.find(({ slug }) => slug === 'cv')!;
	return { project, skills: cvSkillsIn(localeOf(url)), crumb: text(project.title, localeOf(url)) };
};
