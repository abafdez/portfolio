import { error } from '@sveltejs/kit';
import { projects } from '#lib/projects/projects.ts';
import { tools } from '#lib/projects/toolbox/tools.ts';
import { text } from '#lib/i18n/index.ts';
import { localeOf } from '#lib/i18n/locales.ts';
import type { EntryGenerator, PageLoad } from './$types';

// One page per tool. The dashboard links them all, but entries() builds each one even
// if a link goes missing.
export const entries: EntryGenerator = () => tools.map(({ slug }) => ({ tool: slug }));

// Universal, like /projects/[tool]: it returns the tool's component, which a server
// load couldn't send. The breadcrumbs get one more level: Projects / Toolbox / Base64.
export const load: PageLoad = async ({ params, url }) => {
	const tool = tools.find(({ slug }) => slug === params.tool);
	if (!tool) error(404, 'No tool with that name');
	const { default: Tool } = await tool.tool();
	const locale = localeOf(url);
	const toolbox = projects.find(({ slug }) => slug === 'toolbox')!;
	return {
		tool,
		Tool,
		crumb: text(tool.title, locale),
		crumbParent: { href: '/projects/toolbox' as const, label: text(toolbox.title, locale) }
	};
};
