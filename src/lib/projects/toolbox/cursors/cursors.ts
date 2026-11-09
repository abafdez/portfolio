// The cursors tool's data and logic: every cursor keyword, and the SVG cursor builder.
// Descriptions are ours (MDN's prose is CC BY-SA; its reference pages are linked from
// the guide instead).
import type { Translated } from '#lib/i18n/index.ts';

export interface Keyword {
	value: string;
	when: Translated;
}

export interface KeywordGroup {
	name: Translated;
	keywords: Keyword[];
}

// The groups MDN's table uses, so they're easy to find again there.
export const keywordGroups: KeywordGroup[] = [
	{
		name: { en: 'General', es: 'Generales' },
		keywords: [
			{
				value: 'auto',
				when: {
					en: 'Let the browser choose (the default)',
					es: 'Que elija el navegador (por defecto)'
				}
			},
			{
				value: 'default',
				when: {
					en: 'The plain arrow, whatever is under it',
					es: 'La flecha normal, haya lo que haya debajo'
				}
			},
			{
				value: 'none',
				when: { en: 'No cursor: you draw your own', es: 'Sin cursor: dibujas el tuyo' }
			}
		]
	},
	{
		name: { en: 'Links and status', es: 'Enlaces y estado' },
		keywords: [
			{
				value: 'pointer',
				when: {
					en: 'A link: this takes you somewhere',
					es: 'Un enlace: esto te lleva a otro sitio'
				}
			},
			{ value: 'help', when: { en: 'Help is available here', es: 'Aquí hay ayuda' } },
			{
				value: 'context-menu',
				when: { en: 'A menu opens from here', es: 'Desde aquí se abre un menú' }
			},
			{
				value: 'progress',
				when: { en: 'Busy, but you can keep working', es: 'Ocupado, pero puedes seguir trabajando' }
			},
			{
				value: 'wait',
				when: { en: 'Busy: wait before doing anything', es: 'Ocupado: espera antes de hacer nada' }
			}
		]
	},
	{
		name: { en: 'Selection', es: 'Selección' },
		keywords: [
			{ value: 'text', when: { en: 'Text you can select', es: 'Texto que se puede seleccionar' } },
			{
				value: 'vertical-text',
				when: { en: 'Vertical text you can select', es: 'Texto vertical que se puede seleccionar' }
			},
			{
				value: 'crosshair',
				when: {
					en: 'Precise picking: a point, a colour',
					es: 'Elegir con precisión: un punto, un color'
				}
			},
			{
				value: 'cell',
				when: {
					en: 'Cells you can select, as in a spreadsheet',
					es: 'Celdas que se pueden seleccionar, como en una hoja de cálculo'
				}
			}
		]
	},
	{
		name: { en: 'Drag and drop', es: 'Arrastrar y soltar' },
		keywords: [
			{
				value: 'grab',
				when: { en: 'You can pick this up and drag it', es: 'Puedes coger esto y arrastrarlo' }
			},
			{
				value: 'grabbing',
				when: { en: 'You are dragging it now', es: 'Lo estás arrastrando ahora' }
			},
			{ value: 'move', when: { en: 'This can be moved', es: 'Esto se puede mover' } },
			{
				value: 'copy',
				when: { en: 'Dropping here makes a copy', es: 'Soltarlo aquí hace una copia' }
			},
			{
				value: 'alias',
				when: { en: 'Dropping here makes a shortcut', es: 'Soltarlo aquí crea un acceso directo' }
			},
			{ value: 'no-drop', when: { en: 'It can’t be dropped here', es: 'No se puede soltar aquí' } },
			{
				value: 'not-allowed',
				when: { en: 'This action isn’t available', es: 'Esta acción no está disponible' }
			}
		]
	},
	{
		name: { en: 'Resizing and scrolling', es: 'Redimensionar y desplazar' },
		keywords: [
			{
				value: 'col-resize',
				when: {
					en: 'Drag to make a column wider or narrower',
					es: 'Arrastra para ensanchar o estrechar una columna'
				}
			},
			{
				value: 'row-resize',
				when: {
					en: 'Drag to make a row taller or shorter',
					es: 'Arrastra para alargar o acortar una fila'
				}
			},
			{
				value: 'ew-resize',
				when: {
					en: 'An edge that moves left and right',
					es: 'Un borde que se mueve a izquierda y derecha'
				}
			},
			{
				value: 'ns-resize',
				when: { en: 'An edge that moves up and down', es: 'Un borde que se mueve arriba y abajo' }
			},
			{
				value: 'nesw-resize',
				when: {
					en: 'A corner, top right or bottom left',
					es: 'Una esquina, arriba a la derecha o abajo a la izquierda'
				}
			},
			{
				value: 'nwse-resize',
				when: {
					en: 'A corner, top left or bottom right',
					es: 'Una esquina, arriba a la izquierda o abajo a la derecha'
				}
			},
			{ value: 'n-resize', when: { en: 'The top edge', es: 'El borde de arriba' } },
			{ value: 'e-resize', when: { en: 'The right edge', es: 'El borde derecho' } },
			{ value: 's-resize', when: { en: 'The bottom edge', es: 'El borde de abajo' } },
			{ value: 'w-resize', when: { en: 'The left edge', es: 'El borde izquierdo' } },
			{
				value: 'ne-resize',
				when: { en: 'The top right corner', es: 'La esquina de arriba a la derecha' }
			},
			{
				value: 'nw-resize',
				when: { en: 'The top left corner', es: 'La esquina de arriba a la izquierda' }
			},
			{
				value: 'se-resize',
				when: { en: 'The bottom right corner', es: 'La esquina de abajo a la derecha' }
			},
			{
				value: 'sw-resize',
				when: { en: 'The bottom left corner', es: 'La esquina de abajo a la izquierda' }
			},
			{
				value: 'all-scroll',
				when: {
					en: 'Drag to pan in any direction',
					es: 'Arrastra para moverte en cualquier dirección'
				}
			}
		]
	},
	{
		name: { en: 'Zooming', es: 'Zoom' },
		keywords: [
			{ value: 'zoom-in', when: { en: 'Click to zoom in', es: 'Haz clic para ampliar' } },
			{ value: 'zoom-out', when: { en: 'Click to zoom out', es: 'Haz clic para reducir' } }
		]
	}
];

// --- Your own cursor: an SVG, inlined as a data URL ---

export type Shape = 'arrow' | 'block' | 'crosshair' | 'ring';

// Each shape is drawn on a 32 × 32 grid, then scaled to the cursor's size. The hotspot
// is the pixel that "clicks": an arrow's tip, a crosshair's centre.
export const shapes: Record<
	Shape,
	{ name: Translated; hotspot: [number, number]; draw: (fill: string, edge: string) => string }
> = {
	arrow: {
		name: { en: 'Arrow', es: 'Flecha' },
		hotspot: [4, 3],
		draw: (fill, edge) =>
			`<path d='M4 3v23l6-6 5 10 4-2-5-10h8z' fill='${fill}' stroke='${edge}' stroke-width='2' stroke-linejoin='round'/>`
	},
	block: {
		name: { en: 'Terminal block', es: 'Bloque de terminal' },
		hotspot: [10, 16],
		draw: (fill, edge) =>
			`<rect x='10' y='4' width='12' height='24' fill='${fill}' stroke='${edge}' stroke-width='2'/>`
	},
	crosshair: {
		name: { en: 'Crosshair', es: 'Mira' },
		hotspot: [16, 16],
		draw: (fill, edge) => {
			const lines = `<path d='M16 2v10M16 20v10M2 16h10M20 16h10'/>`;
			return (
				`<g stroke='${edge}' stroke-width='5' stroke-linecap='round'>${lines}</g>` +
				`<g stroke='${fill}' stroke-width='2' stroke-linecap='round'>${lines}</g>` +
				`<circle cx='16' cy='16' r='2' fill='${fill}' stroke='${edge}'/>`
			);
		}
	},
	ring: {
		name: { en: 'Ring', es: 'Anillo' },
		hotspot: [16, 16],
		draw: (fill, edge) =>
			`<circle cx='16' cy='16' r='11' fill='none' stroke='${edge}' stroke-width='5'/>` +
			`<circle cx='16' cy='16' r='11' fill='none' stroke='${fill}' stroke-width='2.5'/>` +
			`<circle cx='16' cy='16' r='2' fill='${fill}' stroke='${edge}'/>`
	}
};

export const sizes = [16, 24, 32] as const;
export const fallbacks = ['auto', 'default', 'pointer', 'crosshair', 'text'] as const;

export interface CursorOptions {
	shape: Shape;
	// #rrggbb, from an <input type="color">.
	color: string;
	size: (typeof sizes)[number];
	x: number;
	y: number;
	fallback: (typeof fallbacks)[number];
}

// A dark or light edge around the shape, whichever stands out from its colour, so the
// cursor shows on any background.
export function edgeFor(hex: string) {
	const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
	return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? '#000' : '#fff';
}

// The SVG needs a width and height of its own (its "natural size"): browsers don't
// use an SVG cursor without one. Single quotes inside, so it fits in url("…").
export function cursorSvg({ shape, color, size }: Pick<CursorOptions, 'shape' | 'color' | 'size'>) {
	return (
		`<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 32 32'>` +
		shapes[shape].draw(color, edgeFor(color)) +
		'</svg>'
	);
}

// A shape's hotspot at a size: its point on the 32 grid, scaled.
export const hotspotAt = (shape: Shape, size: number): [number, number] =>
	shapes[shape].hotspot.map((n) => Math.round((n * size) / 32)) as [number, number];

// The SVG as a data URL: percent-encoded, which for SVG is smaller than Base64 and
// still readable.
export const dataUrl = (svg: string) => `data:image/svg+xml,${encodeURIComponent(svg)}`;

// The value of the cursor property: the image, its hotspot, and a keyword to fall back
// on (required, and last), used if the image can't be.
export const cursorValue = (options: CursorOptions) =>
	`url("${dataUrl(cursorSvg(options))}") ${options.x} ${options.y}, ${options.fallback}`;

// --- Animated cursors ---
// Browsers draw only a GIF's first frame as a cursor, so an animated cursor is a list
// of images swapped on the element's `cursor` from JavaScript, a few times a second.
// The technique is the one behind alienmelon's animatedWebCursors; these frames are
// our own, drawn here on the same 32 grid. Each frame carries its own hotspot (a shape
// that moves inside its 32px can keep clicking where it points).

export type Animation = 'spinner' | 'blink' | 'pulse';

interface Frame {
	body: string;
	hotspot: [number, number];
}

export const animations: Record<
	Animation,
	{ name: Translated; interval: number; frames: (fill: string, edge: string) => Frame[] }
> = {
	spinner: {
		name: { en: 'Spinner', es: 'Rueda' },
		interval: 80,
		// An arc with a gap, turned 45° a frame.
		frames: (fill, edge) =>
			Array.from({ length: 8 }, (_, i) => {
				const arc = (stroke: string, width: number) =>
					`<circle cx='16' cy='16' r='10' fill='none' stroke='${stroke}' stroke-width='${width}' stroke-dasharray='40 23' stroke-linecap='round'/>`;
				return {
					body: `<g transform='rotate(${i * 45} 16 16)'>${arc(edge, 6)}${arc(fill, 3)}</g>`,
					hotspot: [16, 16]
				};
			})
	},
	blink: {
		name: { en: 'Blinking block', es: 'Bloque que parpadea' },
		interval: 500,
		// A terminal's block cursor: full, then hollow.
		frames: (fill, edge) => [
			{
				body: `<rect x='10' y='4' width='12' height='24' fill='${fill}' stroke='${edge}' stroke-width='2'/>`,
				hotspot: [10, 16]
			},
			{
				body: `<rect x='10' y='4' width='12' height='24' fill='none' stroke='${edge}' stroke-width='4'/><rect x='10' y='4' width='12' height='24' fill='none' stroke='${fill}' stroke-width='2'/>`,
				hotspot: [10, 16]
			}
		]
	},
	pulse: {
		name: { en: 'Pulse', es: 'Latido' },
		interval: 90,
		// A crosshair whose centre grows and shrinks.
		frames: (fill, edge) =>
			[2, 4, 6, 8, 6, 4].map((r) => ({
				body:
					`<g stroke='${edge}' stroke-width='4' stroke-linecap='round'><path d='M16 1v6M16 25v6M1 16h6M25 16h6'/></g>` +
					`<g stroke='${fill}' stroke-width='2' stroke-linecap='round'><path d='M16 1v6M16 25v6M1 16h6M25 16h6'/></g>` +
					`<circle cx='16' cy='16' r='${r}' fill='${fill}' stroke='${edge}' stroke-width='1.5'/>`,
				hotspot: [16, 16]
			}))
	}
};

// Every frame as a value for `cursor`, ready to swap in: image, hotspot, fallback.
export function animatedCursor(animation: Animation, color: string, fallback = 'auto') {
	return animations[animation]
		.frames(color, edgeFor(color))
		.map(
			({ body, hotspot: [x, y] }) =>
				`url("${dataUrl(
					`<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'>${body}</svg>`
				)}") ${x} ${y}, ${fallback}`
		);
}

// The same technique, written out for the guide.
export const animationCode = `const frames = [
	'url(frame-1.svg) 16 16, auto',
	'url(frame-2.svg) 16 16, auto'
	// …one per frame, each with its own hotspot
];
let timer;
let frame = 0;

element.addEventListener('pointerenter', () => {
	timer = setInterval(() => {
		element.style.cursor = frames[frame++ % frames.length];
	}, 100);
});
element.addEventListener('pointerleave', () => clearInterval(timer));`;

// --- Effects around the pointer (effects.ts draws them; none of them is the cursor) ---
// Grouped by what they do. `how` says how to try each one.
export type Effect =
	| 'trail'
	| 'sparkles'
	| 'ghost'
	| 'ring'
	| 'ripple'
	| 'burst'
	| 'spotlight'
	| 'flashlight'
	| 'invert'
	| 'magnetic'
	| 'tilt'
	| 'parallax';

export interface EffectInfo {
	name: Translated;
	how: Translated;
}

const move = { en: 'Move the pointer over the area.', es: 'Mueve el puntero por la zona.' };
const click = { en: 'Click anywhere in the area.', es: 'Haz clic en cualquier parte de la zona.' };

export const effectGroups: { name: Translated; effects: Partial<Record<Effect, EffectInfo>> }[] = [
	{
		name: { en: 'Follow the pointer', es: 'Siguen al puntero' },
		effects: {
			trail: { name: { en: 'Trail', es: 'Estela' }, how: move },
			sparkles: { name: { en: 'Sparkles', es: 'Chispas' }, how: move },
			ghost: { name: { en: 'Ghost', es: 'Fantasma' }, how: move },
			ring: {
				name: { en: 'Dot and ring', es: 'Punto y anillo' },
				how: {
					en: 'Move the pointer over the area: the real cursor hides, a dot takes its place and a ring follows.',
					es: 'Mueve el puntero por la zona: el cursor real se oculta, un punto ocupa su sitio y un anillo lo sigue.'
				}
			}
		}
	},
	{
		name: { en: 'On a click', es: 'Al hacer clic' },
		effects: {
			ripple: { name: { en: 'Ripple', es: 'Onda' }, how: click },
			burst: { name: { en: 'Burst', es: 'Explosión' }, how: click }
		}
	},
	{
		name: { en: 'Light', es: 'Luz' },
		effects: {
			spotlight: { name: { en: 'Spotlight', es: 'Foco' }, how: move },
			flashlight: { name: { en: 'Flashlight', es: 'Linterna' }, how: move },
			invert: { name: { en: 'Invert', es: 'Invertir' }, how: move }
		}
	},
	{
		name: { en: 'Move things', es: 'Mueven cosas' },
		effects: {
			magnetic: {
				name: { en: 'Magnetic', es: 'Imán' },
				how: { en: 'Bring the pointer near the button.', es: 'Acerca el puntero al botón.' }
			},
			tilt: {
				name: { en: 'Tilt', es: 'Inclinación' },
				how: { en: 'Move the pointer over the card.', es: 'Mueve el puntero por la tarjeta.' }
			},
			parallax: {
				name: { en: 'Parallax', es: 'Paralaje' },
				how: {
					en: 'Move the pointer across the area: the shapes behind move by different amounts.',
					es: 'Mueve el puntero por la zona: las formas del fondo se mueven en distinta medida.'
				}
			}
		}
	}
];

export const effects = Object.assign({}, ...effectGroups.map((group) => group.effects)) as Record<
	Effect,
	EffectInfo
>;

// The same idea in CSS alone: `cursor` can be animated with @keyframes, one keyframe
// per frame (it's a discrete property: it jumps from one value to the next). Checked
// in Chromium: the computed cursor steps through the frames.
export const keyframesCode = `@keyframes spinner {
	0% { cursor: url(frame-1.svg) 16 16, auto; }
	12.5% { cursor: url(frame-2.svg) 16 16, auto; }
	/* …one keyframe per frame */
}

.element:hover {
	animation: spinner 640ms steps(1, end) infinite;
}

@media (prefers-reduced-motion: reduce) {
	.element:hover {
		animation: none;
	}
}`;
