import type { Component } from 'svelte';
import type { LucideIcon } from '@lucide/svelte';
import Binary from '@lucide/svelte/icons/binary';
import Omega from '@lucide/svelte/icons/omega';
import MousePointer2 from '@lucide/svelte/icons/mouse-pointer-2';
import type { Project } from '../projects.ts';

// The toolbox: small browser-only tools, on the dashboard (/projects/toolbox) and each
// at /projects/toolbox/<slug>. A tool is a project with an icon, so it has the same
// header (ProjectHeader) and the same fields; its folder here holds its component and
// logic, and only the tool's own page downloads them (the dynamic import()).
export interface Tool extends Project {
	// A Lucide icon for its window on the dashboard. Decoration: the name says it all.
	icon: LucideIcon;
	tool: () => Promise<{ default: Component }>;
}

// In the order the dashboard shows them.
export const tools: Tool[] = [
	{
		slug: 'base64',
		title: { en: 'Base64', es: 'Base64' },
		description: {
			en: 'Text to Base64 and back, as UTF-8, and any small file as a data URL.',
			es: 'Texto a Base64 y vuelta, en UTF-8, y cualquier archivo pequeño como data URL.'
		},
		date: '2026-11-09',
		tags: ['encoding', 'files'],
		icon: Binary,
		tool: () => import('./base64/Base64.svelte')
	},
	{
		slug: 'symbols',
		title: { en: 'HTML symbols', es: 'Símbolos HTML' },
		description: {
			en: 'Arrows, currency, maths, box drawing and more: every way to write each one in HTML, CSS and JavaScript.',
			es: 'Flechas, monedas, matemáticas, recuadros y más: todas las formas de escribir cada uno en HTML, CSS y JavaScript.'
		},
		date: '2026-11-09',
		tags: ['unicode', 'html', 'css'],
		icon: Omega,
		tool: () => import('./symbols/Symbols.svelte')
	},
	{
		slug: 'cursors',
		title: { en: 'Cursors and selection', es: 'Cursores y selección' },
		description: {
			en: 'A guide and a playground: every cursor, your own SVG cursor, animated ones, clicks that pass through, and what can be selected and how it looks.',
			es: 'Una guía y un banco de pruebas: todos los cursores, tu propio cursor en SVG, cursores animados, clics que atraviesan, y qué se puede seleccionar y cómo se ve.'
		},
		date: '2026-11-09',
		tags: ['css', 'ux', 'accessibility'],
		icon: MousePointer2,
		tool: () => import('./cursors/Cursors.svelte')
	}
];
