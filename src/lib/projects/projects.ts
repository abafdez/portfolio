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
	// Its code in this repository (a folder or a file), linked from its page as "Source
	// code on GitHub" (ProjectHeader, sourceUrl() in links.ts).
	source?: string;
	// Alt text for its cover, a screenshot at content/projects/<slug>/cover.avif (found by
	// folder in covers.server.ts, like a post's). projects.test.ts checks they come
	// together.
	cover?: Translated;
	// The tool itself. A dynamic import() becomes its own chunk, downloaded only on the
	// tool's page, never on /projects or the landing. None for a tool with a route of
	// its own (src/routes/projects/cv): that route imports it.
	tool?: () => Promise<{ default: Component }>;
}

export const projects: Project[] = [
	{
		// The games and animations of the 404 page (src/routes/+error.svelte shows one at
		// random), all on one page. The variants are listed in not-found/variants.ts.
		slug: '404',
		cover: {
			en: 'The Breakout game: the number 404 made of green bricks, with the paddle and the ball below',
			es: 'El juego Breakout: el número 404 hecho de ladrillos verdes, con la pala y la pelota debajo'
		},
		title: { en: '404 games', es: 'Juegos del 404' },
		description: {
			en: "The games and animations of this site's 404 page, all four in one place: break the 404, eat it, scramble it or scatter it.",
			es: 'Los juegos y animaciones de la página 404 de este sitio, los cuatro juntos: rompe el 404, cómetelo, revuélvelo o dispérsalo.'
		},
		date: '2026-11-18',
		tags: ['canvas', 'games', 'svelte'],
		source: 'src/lib/projects/not-found',
		tool: () => import('./not-found/Gallery.svelte')
	},
	{
		// A dashboard of small tools with routes of its own (src/routes/projects/toolbox),
		// listed in toolbox/tools.ts.
		slug: 'toolbox',
		cover: {
			en: 'The toolbox: three terminal windows, for Base64, HTML symbols and cursors',
			es: 'La caja de herramientas: tres ventanas de terminal, para Base64, símbolos HTML y cursores'
		},
		title: { en: 'Toolbox', es: 'Caja de herramientas' },
		description: {
			en: 'Small tools for everyday front-end work, all in the browser: nothing you type or drop here leaves it.',
			es: 'Pequeñas herramientas para el día a día del front-end, todas en el navegador: nada de lo que escribas o sueltes aquí sale de él.'
		},
		date: '2026-11-09',
		tags: ['browser-apis', 'svelte', 'tools'],
		source: 'src/lib/projects/toolbox'
	},
	{
		slug: 'cv',
		cover: {
			en: 'The CV builder: a form for your details next to a live preview of the CV',
			es: 'El generador de CV: un formulario para tus datos junto a una vista previa del CV en directo'
		},
		title: { en: 'CV builder', es: 'Generador de CV' },
		description: {
			en: 'A CV for each kind of job I apply for: the skills come from this site, the rest is typed in and stays in your browser.',
			es: 'Un CV para cada tipo de empleo al que me presento: las habilidades salen de este sitio y el resto se escribe a mano y se queda en tu navegador.'
		},
		date: '2026-11-03',
		tags: ['forms', 'local-storage', 'svelte'],
		source: 'src/lib/projects/cv'
	},
	{
		slug: 'contrast',
		cover: {
			en: 'The contrast checker: a sentence in the dark and light themes with their ratios, above a table of every colour pair',
			es: 'El comprobador de contraste: una frase en los temas oscuro y claro con su contraste, sobre una tabla con cada par de colores'
		},
		title: { en: 'Contrast checker', es: 'Comprobador de contraste' },
		description: {
			en: "Every text color of this site on every background, in both themes, scored against WCAG. It reads the design tokens live, so it checks whatever theme they're in.",
			es: 'Cada color de texto de este sitio sobre cada fondo, en los dos temas, puntuado según las WCAG. Lee los design tokens en directo, así que comprueba el tema que tengan.'
		},
		date: '2026-11-02',
		tags: ['accessibility', 'color', 'design-tokens'],
		source: 'src/lib/projects/contrast',
		tool: () => import('./contrast/Contrast.svelte')
	}
];
