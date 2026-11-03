// A brand's color (Simple Icons gives it as hex, like 'FF3E00') as an OKLCH hue and
// chroma. The icon keeps the brand's hue but takes its lightness from the theme
// (--icon-tone in tokens.css), so a black logo still shows on the dark theme and
// every icon has the same contrast as the rest of the page.
// The math is OKLab's (https://bottosson.github.io/posts/oklab/): sRGB → linear
// light (the same step as the contrast checker's luminance), → the cone responses of
// the eye (LMS), → a, b (green–red, blue–yellow). Hue is the angle of (a, b), chroma
// its distance from gray.

const linear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

export function hueAndChroma(hex: string): { hue: number; chroma: number } {
	const [r, g, b] = [0, 2, 4].map((i) => linear(parseInt(hex.slice(i, i + 2), 16) / 255));

	const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
	const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
	const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

	const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
	const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

	return {
		hue: ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360,
		// Capped: very saturated brands (a pure red) would leave the screen's gamut at
		// the theme's lightness and the browser would clip them unevenly.
		chroma: Math.min(Math.hypot(A, B), 0.17)
	};
}
