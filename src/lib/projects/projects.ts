import type { Component } from 'svelte';

// The projects feature: this list, and one folder per tool next to it
// (contrast/: its component and its logic). A tool only knows its own folder, so it
// can move or be removed without touching the rest of the site.
export interface Project {
	// Its page, /projects/[tool], and its folder here.
	slug: string;
	title: string;
	description: string;
	// 'YYYY-MM-DD', when it went live. The list is newest first.
	date: string;
	tags: string[];
	// The tool itself. A dynamic import() becomes its own chunk, downloaded only on the
	// tool's page, never on /projects or the landing. None for a tool with a route of
	// its own (src/routes/projects/cv): that route imports it.
	tool?: () => Promise<{ default: Component }>;
}

export const projects: Project[] = [
	{
		slug: 'cv',
		title: 'CV builder',
		description:
			'A CV for each kind of job I apply for: the skills come from this site, the rest is typed in and stays in your browser.',
		date: '2026-11-03',
		tags: ['forms', 'local-storage', 'svelte']
	},
	{
		slug: 'contrast',
		title: 'Contrast checker',
		description:
			"Every text color of this site on every background, in both themes, scored against WCAG. It reads the design tokens live, so it checks whatever theme they're in.",
		date: '2026-11-02',
		tags: ['accessibility', 'color', 'design-tokens'],
		tool: () => import('./contrast/Contrast.svelte')
	}
];
