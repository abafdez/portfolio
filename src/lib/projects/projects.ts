import type { Component } from 'svelte';
import type { Translated } from '#lib/i18n/index.ts';

// The projects feature: this list, and one folder per tool next to it
// (contrast/: its component and its logic). A tool only knows its own folder, so it
// can move or be removed without touching the rest of the site.
export interface Project {
	// Its page, /projects/[tool], and its folder here.
	slug: string;
	// In both languages: text() picks the page's.
	title: Translated;
	description: Translated;
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
		title: { en: 'CV builder', es: 'Generador de CV' },
		description: {
			en: 'A CV for each kind of job I apply for: the skills come from this site, the rest is typed in and stays in your browser.',
			es: 'Un CV para cada tipo de empleo al que me presento: las habilidades salen de este sitio y el resto se escribe a mano y se queda en tu navegador.'
		},
		date: '2026-11-03',
		tags: ['forms', 'local-storage', 'svelte']
	},
	{
		slug: 'contrast',
		title: { en: 'Contrast checker', es: 'Comprobador de contraste' },
		description: {
			en: "Every text color of this site on every background, in both themes, scored against WCAG. It reads the design tokens live, so it checks whatever theme they're in.",
			es: 'Cada color de texto de este sitio sobre cada fondo, en los dos temas, puntuado según las WCAG. Lee los design tokens en directo, así que comprueba el tema que tengan.'
		},
		date: '2026-11-02',
		tags: ['accessibility', 'color', 'design-tokens'],
		tool: () => import('./contrast/Contrast.svelte')
	}
];
