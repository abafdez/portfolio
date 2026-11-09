import { projects } from '#lib/projects/projects.ts';
import { text } from '#lib/i18n/index.ts';
import { localeOf } from '#lib/i18n/locales.ts';
import type { PageLoad } from './$types';

// The toolbox has a route of its own, not /projects/[tool]: it's a dashboard of tools,
// each with its page below it (./[tool]). A fixed route beats a [param] one, so
// /projects/toolbox lands here, as /projects/cv does in cv/.
export const load: PageLoad = ({ url }) => {
	const project = projects.find(({ slug }) => slug === 'toolbox')!;
	return { project, crumb: text(project.title, localeOf(url)) };
};
