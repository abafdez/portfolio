// The 404's variants: the error page shows one at random, and "Another 404" goes on to
// the next. Each one loads only when it's shown, so a 404 downloads one game, not four.
// The project page (/projects/404, Gallery.svelte) shows them all, each with how it's
// made and links to its files on GitHub.
// A new variant is a component in this folder and an entry here.
import type { Component } from 'svelte';
import type { Translated } from '#lib/i18n/locales.ts';

export interface Variant {
	id: string;
	name: Translated;
	// How it's made, for the project page.
	about: Translated;
	// Its own files in this folder (variants.test.ts checks they exist).
	files: string[];
	load: () => Promise<{ default: Component }>;
}

// The files every variant uses: the 404's cells, the canvas helpers and this list.
export const shared = ['digits.ts', 'canvas.ts', 'variants.ts'];

export const variants: Variant[] = [
	{
		id: 'breakout',
		name: { en: 'Breakout', es: 'Breakout' },
		about: {
			en: 'The rules are plain functions in breakout.ts, tested without a canvas. The ball moves in small steps, so it never jumps over a brick, and the spot where it hits the paddle sets its angle. Breakout.svelte only draws each frame and listens to the keys, the pointer and touch.',
			es: 'Las reglas son funciones normales en breakout.ts, probadas sin canvas. La pelota avanza a pasos cortos, así que nunca se salta un ladrillo, y el punto donde toca la pala decide su ángulo. Breakout.svelte solo dibuja cada fotograma y escucha el teclado, el puntero y los toques.'
		},
		files: ['breakout.ts', 'breakout.test.ts', 'Breakout.svelte', 'Arcade.svelte'],
		load: () => import('./Breakout.svelte')
	},
	{
		id: 'snake',
		name: { en: 'Snake', es: 'Snake' },
		about: {
			en: 'snake.ts moves the snake one cell per tick, a little faster after every bite, and keeps up to two turns in a queue so quick key presses are not lost. Snake.svelte draws every frame and turns swipes into directions.',
			es: 'snake.ts mueve la serpiente una casilla por tic, un poco más rápido tras cada bocado, y guarda hasta dos giros en cola para no perder pulsaciones rápidas. Snake.svelte dibuja cada fotograma y convierte los deslizamientos en direcciones.'
		},
		files: ['snake.ts', 'snake.test.ts', 'Snake.svelte', 'Arcade.svelte'],
		load: () => import('./Snake.svelte')
	},
	{
		id: 'ascii',
		name: { en: 'ASCII wave', es: 'Onda ASCII' },
		about: {
			en: 'ascii.ts builds each frame as one string: every cell of the 404 picks a character by its brightness, the pointer scrambles the ones near it, and a click sends a ring out. Ascii.svelte puts that string in a pre element about 30 times a second.',
			es: 'ascii.ts construye cada fotograma como una sola cadena: cada casilla del 404 elige un carácter según su brillo, el puntero revuelve las cercanas y un clic lanza un anillo. Ascii.svelte pone esa cadena en un elemento pre unas 30 veces por segundo.'
		},
		files: ['ascii.ts', 'ascii.test.ts', 'Ascii.svelte'],
		load: () => import('./Ascii.svelte')
	},
	{
		id: 'dots',
		name: { en: 'Loose dots', es: 'Puntos sueltos' },
		about: {
			en: 'Every dot hangs from a spring that pulls it back to its place in the 404; the pointer pushes dots away and a click throws them. Particles.svelte stops drawing once every dot has settled.',
			es: 'Cada punto cuelga de un muelle que lo devuelve a su sitio en el 404; el puntero aparta los puntos y un clic los lanza. Particles.svelte deja de dibujar cuando todos los puntos se han quedado quietos.'
		},
		files: ['Particles.svelte'],
		load: () => import('./Particles.svelte')
	}
];
