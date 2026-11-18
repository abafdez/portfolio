// The text size picked in the theme menu (PalettePicker.svelte): a scale for the root
// font size, as --text-scale on <html> (global.css: font-size: calc(var(--text-scale) * 100%)).
// Every size on the site is in rem, so text, spacing and widths grow together, like the
// browser's own font size setting, and on top of it.
//
// Saved in localStorage['text-scale']; app.html puts it back before the first paint, so
// a bigger text size never flashes small. 1 (the default) is not saved.

export const scales = [0.875, 1, 1.125, 1.25, 1.375] as const;
export const defaultScale = 1;

const key = 'text-scale';

export function isScale(value: unknown): value is number {
	return typeof value === 'number' && (scales as readonly number[]).includes(value);
}

// What <html> has now (app.html set it from storage), or the default.
export function currentScale(): number {
	const value = Number(document.documentElement.style.getPropertyValue('--text-scale'));
	return isScale(value) ? value : defaultScale;
}

// The next size up (+1) or down (-1), staying inside the list.
export function step(scale: number, by: 1 | -1): number {
	const index = scales.indexOf(scale as (typeof scales)[number]);
	const next = Math.min(scales.length - 1, Math.max(0, (index < 0 ? 1 : index) + by));
	return scales[next];
}

export function applyScale(scale: number) {
	const root = document.documentElement;
	try {
		if (scale === defaultScale) {
			root.style.removeProperty('--text-scale');
			localStorage.removeItem(key);
		} else {
			root.style.setProperty('--text-scale', String(scale));
			localStorage.setItem(key, String(scale));
		}
	} catch {
		// Storage blocked (private mode): the size still applies for this visit.
		if (scale !== defaultScale) root.style.setProperty('--text-scale', String(scale));
	}
}
