// The site's colour themes. In code they're "palettes", because "theme" already means
// light or dark (data-theme, ThemeToggle); the UI calls them colour themes.
//
// A palette is a CSS file in src/lib/styles/themes/ that overrides the semantic tokens
// (tokens.css) under [data-palette='<id>'], for both light and dark. The picker
// (PalettePicker.svelte) sets data-palette on <html> and saves it; app.html puts it
// back before the first paint, so it never flashes.

export type Palette = {
	id: string;
	name: string;
	// Who made it, when it's someone else's: shown in the picker.
	credit?: { by: string; url: string };
};

// The first one is the site's own and needs no CSS: no data-palette means these colours.
export const palettes = [
	{ id: 'phosphor', name: 'Phosphor' },
	{
		id: 'tokyo-night',
		name: 'Tokyo Night',
		credit: { by: 'Enkia', url: 'https://github.com/enkia/tokyo-night-vscode-theme' }
	}
] as const satisfies readonly Palette[];

export type PaletteId = (typeof palettes)[number]['id'];
export const defaultPalette: PaletteId = palettes[0].id;

export function isPalette(id: unknown): id is PaletteId {
	return palettes.some((palette) => palette.id === id);
}
