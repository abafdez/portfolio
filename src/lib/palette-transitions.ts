// What you see when the colour theme changes (PalettePicker.svelte) or the language
// does (the root layout's onNavigate): one of these effects, taking turns in the order
// they're listed in `effects`. The light/dark toggle keeps its circle.
//
// All of them are view transitions: the browser takes a picture of the page before the
// change and one after, and we animate between them with CSS (palette-transitions.css,
// under the "palette" type). The effect's name is a type too, so its CSS only runs then.
// Without view transition types, or with reduced motion, the colours just change.
//
// Each effect is one function here (it returns the custom properties its CSS reads)
// and one block in palette-transitions.css. To remove an effect: delete its function,
// its line in `effects`, and its CSS block (the CSS file says which ones share a rule).
import { canTransition } from '#lib/view-transitions.ts';
import './palette-transitions.css';

// The point the effect starts from (the radio that was picked), in viewport pixels.
type Origin = { x: number; y: number };
// Custom properties for <html>, e.g. { '--palette-duration': '450ms' }.
type Settings = Record<string, string>;

// The effects, in the order they take turns. Defined at the bottom of the file
// (function declarations are hoisted, so they can be listed here).
const effects = {
	ripple,
	glitch,
	scanline,
	rain
} satisfies Record<string, (origin: Origin) => Settings>;

type Effect = keyof typeof effects;
const order = Object.keys(effects) as Effect[];

// Whose turn it is. Counted per visit: a reload starts again from the first one.
let turn = 0;

// Which transition is the latest. Picking themes quickly (arrow keys in the menu) starts
// a new transition while one is running; the browser skips the old one, and its
// clean-up must not remove the properties the new one has just set.
let latest = 0;
// Every property any of them set, so the last one to finish removes them all.
const used = new Set<string>();

// change: what changes the page. It can be async: the browser waits for it before it
// takes the "after" picture (a language switch waits for the new page).
export function transitionPalette(
	change: () => void | Promise<void>,
	origin: Origin,
	effect?: Effect
) {
	if (!canTransition()) return change();
	effect ??= order[turn++ % order.length];

	const root = document.documentElement;
	for (const [name, value] of Object.entries(effects[effect](origin))) {
		root.style.setProperty(name, value);
		used.add(name);
	}

	const transition = document.startViewTransition({ update: change, types: ['palette', effect] });
	// Tidy up: the properties are only for this transition, unless a newer one is using them.
	// A skipped transition rejects its `ready` promise ("Transition was skipped"): expected
	// here, so it's caught instead of showing up as an error in the console.
	transition.ready.catch(() => {});
	const mine = ++latest;
	transition.finished.finally(() => {
		if (mine !== latest) return;
		for (const name of used) root.style.removeProperty(name);
		used.clear();
	});
}

// --- Shared helpers ---------------------------------------------------------------------

// --grid-size in pixels: it's in rem, so it follows the visitor's font size.
function gridSize(): number {
	const probe = document.createElement('div');
	probe.style.inlineSize = 'var(--grid-size)';
	document.body.append(probe);
	const size = probe.getBoundingClientRect().width;
	probe.remove();
	return size || 24;
}

// An SVG as a CSS image (for --palette-mask). SVG images run their own animations
// (<animate>, <set>), even as a CSS mask, so a mask like this animates itself: no JS
// runs while it plays.
function svgImage(svg: string): string {
	return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

const ms = (seconds: number) => `${Math.round(seconds * 1000)}ms`;

// --- Effect: grid ripple ----------------------------------------------------------------
// The blueprint grid's cells (Blueprint.svelte: --grid-size squares from the top-left
// corner of the screen) flip to the new colours one by one, in a wave from the origin.
// The new page is drawn through a mask: an SVG the size of the screen with one square
// per cell, each fading in after a delay that grows with its distance from the origin,
// plus a little randomness so the edge looks pixelated.

const wave = 0.6; // seconds for the wave to reach the farthest corner
const jitter = 0.12; // up to this much later, at random, per cell
const fade = 0.1; // each cell's own fade
const step = 0.03; // delays are rounded to this, so cells share a <path>

function ripple({ x, y }: Origin): Settings {
	const size = gridSize();
	const width = innerWidth;
	const height = innerHeight;
	const farthest = Math.hypot(Math.max(x, width - x), Math.max(y, height - y));

	// Cells grouped by delay: one <path> (all its squares) and one <animate> per group,
	// not one per cell. A big screen has thousands of cells but only ~30 delays.
	const groups = new Map<number, string[]>();
	for (let top = 0; top < height; top += size) {
		for (let left = 0; left < width; left += size) {
			const distance = Math.hypot(left + size / 2 - x, top + size / 2 - y);
			const delay = (distance / farthest) * wave + Math.random() * jitter;
			const key = Math.round(delay / step) * step;
			const squares = groups.get(key) ?? [];
			squares.push(`M${left} ${top}h${size}v${size}h${-size}z`);
			groups.set(key, squares);
		}
	}

	const paths = [...groups]
		.map(
			([delay, squares]) =>
				`<path d="${squares.join('')}" opacity="0">` +
				`<animate attributeName="opacity" to="1" begin="${delay.toFixed(2)}s" dur="${fade}s" fill="freeze"/>` +
				`</path>`
		)
		.join('');
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${paths}</svg>`;

	return {
		'--palette-mask': svgImage(svg),
		// The transition must last until the last cell has faded in.
		'--palette-duration': ms(wave + jitter + fade)
	};
}

// --- Effect: glitch ---------------------------------------------------------------------
// For a moment the new page shows only in random horizontal bands, shifted sideways
// and with its colour channels split (CSS keyframes; the filter is an SVG in
// PalettePicker.svelte), then it settles. The bands and shifts are random every time,
// so here they're made into custom properties the keyframes read:
// --glitch-bands-1…5, --glitch-shift-1…5.

const frames = 5;

function glitch(): Settings {
	const settings: Settings = { '--palette-duration': '450ms' };
	for (let frame = 1; frame <= frames; frame++) {
		// More of the new page in each frame: 20% of the screen, up to 80%.
		settings[`--glitch-bands-${frame}`] = bands(frame / (frames + 1));
		settings[`--glitch-shift-${frame}`] = `${Math.round((Math.random() - 0.5) * 60)}px`;
	}
	return settings;
}

// A mask of horizontal bands: black (the new page shows) or transparent (the old one),
// with hard edges, about `share` of the height black.
function bands(share: number): string {
	const stops: string[] = [];
	let at = 0;
	while (at < 100) {
		const height = 2 + Math.random() * 12;
		const colour = Math.random() < share ? '#000' : 'transparent';
		stops.push(`${colour} ${at.toFixed(1)}% ${Math.min(100, at + height).toFixed(1)}%`);
		at += height;
	}
	return `linear-gradient(${stops.join(', ')})`;
}

// --- Effect: scanline redraw ------------------------------------------------------------
// Like a terminal clearing and drawing again: a glowing line in the brand colour sweeps
// down the screen with the new page drawn above it, faint CRT scanlines on the new page
// while it's drawn, and a short flicker at the end. All CSS; only the duration is set here.

function scanline(): Settings {
	return { '--palette-duration': '800ms' };
}

// --- Effect: column rain ----------------------------------------------------------------
// The screen splits into the grid's columns, and each one drops the new page in from the
// top, starting at its own random moment and speeding up as it falls. Same kind of mask
// as the ripple: one rect per column whose height animates from 0 to the screen's.

const rainDelay = 0.3; // the last column starts up to this late
const rainFall = [0.3, 0.5]; // seconds a column takes to fall, at random in this range

function rain(): Settings {
	const size = gridSize();
	const width = innerWidth;
	const height = innerHeight;

	const columns: string[] = [];
	for (let left = 0; left < width; left += size) {
		const begin = Math.random() * rainDelay;
		const fall = rainFall[0] + Math.random() * (rainFall[1] - rainFall[0]);
		// keySplines: an ease-in curve, so the column speeds up like something falling.
		columns.push(
			`<rect x="${left}" width="${size}" height="0">` +
				`<animate attributeName="height" to="${height}" begin="${begin.toFixed(2)}s" dur="${fall.toFixed(2)}s"` +
				` fill="freeze" calcMode="spline" keyTimes="0;1" keySplines="0.5 0 0.9 0.6"/>` +
				`</rect>`
		);
	}
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${columns.join('')}</svg>`;

	return {
		'--palette-mask': svgImage(svg),
		'--palette-duration': ms(rainDelay + rainFall[1] + 0.05)
	};
}
