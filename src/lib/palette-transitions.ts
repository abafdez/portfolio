// What you see when the colour theme changes (PalettePicker.svelte): one of these
// effects, picked at random each time. The light/dark toggle keeps its circle.
//
// Both are view transitions: the browser takes a picture of the page before the change
// and one after, and we animate between them with CSS (PalettePicker.svelte's styles,
// under the "palette" type). The effect's name is a type too, so its CSS only runs then.
// Without view transition types, or with reduced motion, the colours just change.
import { canTransition } from '#lib/view-transitions.ts';

const effects = ['ripple', 'glitch'] as const;
type Effect = (typeof effects)[number];

// The point the effect starts from (the radio that was picked), in viewport pixels.
type Origin = { x: number; y: number };

// Which transition is the latest. Picking themes quickly (arrow keys in the menu) starts
// a new transition while one is running; the browser skips the old one, and its
// clean-up must not remove the properties the new one has just set.
let latest = 0;
// Every property any of them set, so the last one to finish removes them all.
const used = new Set<string>();

export function transitionPalette(change: () => void, origin: Origin, effect?: Effect) {
	if (!canTransition()) return change();
	effect ??= effects[Math.floor(Math.random() * effects.length)];

	const root = document.documentElement;
	const settings = effect === 'ripple' ? ripple(origin) : glitch();
	for (const [name, value] of Object.entries(settings)) {
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

// --- Grid ripple -----------------------------------------------------------------------
// The blueprint grid's cells (Blueprint.svelte: --grid-size squares from the top-left
// corner of the screen) flip to the new colours one by one, in a wave from the origin.
// The new page is drawn through a mask: an SVG the size of the screen with one square
// per cell, each fading in after a delay that grows with its distance from the origin,
// plus a little randomness so the edge looks pixelated. SVG images run their own
// animations (<animate>), even as a CSS mask, so the mask animates itself.

const wave = 0.6; // seconds for the wave to reach the farthest corner
const jitter = 0.12; // up to this much later, at random, per cell
const fade = 0.1; // each cell's own fade
const step = 0.03; // delays are rounded to this, so cells share a <path>

function ripple({ x, y }: Origin): Record<string, string> {
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
		'--palette-mask': `url("data:image/svg+xml,${encodeURIComponent(svg)}")`,
		// The transition must last until the last cell has faded in.
		'--palette-duration': `${Math.round((wave + jitter + fade) * 1000)}ms`
	};
}

// --grid-size in pixels: it's in rem, so it follows the visitor's font size.
function gridSize(): number {
	const probe = document.createElement('div');
	probe.style.inlineSize = 'var(--grid-size)';
	document.body.append(probe);
	const size = probe.getBoundingClientRect().width;
	probe.remove();
	return size || 24;
}

// --- Glitch ----------------------------------------------------------------------------
// For a moment the new page shows only in random horizontal bands, shifted sideways
// and with its colour channels split (CSS keyframes in PalettePicker.svelte), then it
// settles. The bands and shifts are random every time, so here they're made into
// custom properties the keyframes read: --glitch-bands-1…5, --glitch-shift-1…5.

const frames = 5;

function glitch(): Record<string, string> {
	const settings: Record<string, string> = { '--palette-duration': '450ms' };
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
