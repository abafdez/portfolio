// The contrast checker's logic, apart from its UI (Contrast.svelte). The math is plain
// TypeScript; only readColors() needs a browser.

// The tokens it checks, without the leading --. Aliases are left out (--code-string is
// --brand, --code-comment is --text-2).
export const texts = [
	'text-1',
	'text-2',
	'brand',
	'code-keyword',
	'code-function',
	'code-constant',
	'code-type',
	'code-tag'
] as const;
export const surfaces = ['surface-1', 'surface-2', 'surface-3'] as const;
// Dark first, like the site.
export const schemes = ['dark', 'light'] as const;

export type Text = (typeof texts)[number];
export type Surface = (typeof surfaces)[number];
export type Scheme = (typeof schemes)[number];
type Token = Text | Surface;
// Red, green, blue, each 0–255.
type RGB = [number, number, number];
export type Colors = Record<Scheme, Record<Token, RGB>>;

// Every token's color in both schemes, as the browser draws it. Two Web APIs:
// 1. CSS resolves var() and light-dark() for us. A hidden probe with data-theme="light"
//    gets the tokens declared again in the light theme (tokens.css), whatever theme the
//    page is in. (color-scheme alone isn't enough: the tokens it inherits from :root
//    are already resolved there.)
// 2. getComputedStyle() gives that color back as CSS (oklch(…) here), and a 1×1 canvas
//    turns any CSS color into sRGB pixels: paint it, then read the pixel back.
// Runs in the browser only (document, canvas), so call it from onMount.
export function readColors(): Colors {
	const probe = document.createElement('div');
	probe.hidden = true;
	document.body.append(probe);
	// willReadFrequently: we read pixels back, so the canvas stays on the CPU.
	const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!;

	const read = (token: Token, scheme: Scheme): RGB => {
		probe.dataset.theme = scheme;
		probe.style.color = `var(--${token})`;
		ctx.fillStyle = getComputedStyle(probe).color;
		ctx.fillRect(0, 0, 1, 1);
		const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
		return [r, g, b];
	};

	const tokens = [...texts, ...surfaces];
	const colors = Object.fromEntries(
		schemes.map((scheme) => [
			scheme,
			Object.fromEntries(tokens.map((token) => [token, read(token, scheme)]))
		])
	) as Colors;
	probe.remove();
	return colors;
}

// WCAG 2 relative luminance: how bright a color looks, 0 (black) to 1 (white).
// sRGB values are gamma-encoded; each channel is turned back into linear light first.
// https://www.w3.org/TR/WCAG22/#dfn-relative-luminance
function luminance([r, g, b]: RGB): number {
	const linear = (c: number) => {
		const s = c / 255;
		return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
	};
	return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

// From 1 (same color) to 21 (black on white). The order of a and b doesn't matter.
// https://www.w3.org/TR/WCAG22/#dfn-contrast-ratio
export function contrast(a: RGB, b: RGB): number {
	const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (light + 0.05) / (dark + 0.05);
}

// What a ratio passes for text. "large" is AA for large text only (24px, or 18.66px bold).
// https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum
export function level(ratio: number): 'AAA' | 'AA' | 'large' | 'fail' {
	if (ratio >= 7) return 'AAA';
	if (ratio >= 4.5) return 'AA';
	if (ratio >= 3) return 'large';
	return 'fail';
}
