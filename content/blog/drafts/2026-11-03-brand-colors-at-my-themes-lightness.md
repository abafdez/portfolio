---
title: "Brand-colored icons at my theme's lightness"
date: 2026-11-03
tags: [css, oklch, icons, design-tokens]
description: Every logo on my about page keeps its brand's hue but takes its lightness from the theme, with a little OKLab math and CSS relative colors.
---

My about page lists what I work with, and each skill has its logo: Svelte, Laravel, PostgreSQL, GitHub. Logos in their brand colors look great, until you switch themes. GitHub's logo is black, so it disappears on my dark theme. JavaScript's is yellow, so it's barely there on the light one. Brand colors were picked for the brand's own background, not mine.

What I wanted: each logo keeps its brand's _hue_ (Svelte stays orange, Tailwind stays cyan), but its _lightness_ comes from my theme, like the text does. Then every icon has the same contrast as the text around it, in both themes.

<!-- TODO: a screenshot of the icons in their raw brand colors on the dark theme, next to the final version -->

## Two icon libraries

- **[Lucide](https://lucide.dev)** for generic icons (a globe, a database, a bot). `@lucide/svelte` gives each icon as a Svelte component. Import them one file each, `@lucide/svelte/icons/globe`: importing from the package's index loads all 2,000 icons in dev.
- **[Simple Icons](https://simpleicons.org)** for brand logos. Each logo is data, not a component: a title, a brand color in hex and one SVG path on a 24×24 grid. So I draw it myself:

```svelte
<script lang="ts">
	import type { SimpleIcon } from 'simple-icons';

	let { icon, size = '1em' }: { icon: SimpleIcon; size?: string } = $props();
</script>

<svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
	<path d={icon.path} />
</svg>
```

`fill="currentColor"` is the important part: the logo takes the text color, which CSS controls. It's `aria-hidden` because the skill's name is always written next to it.

Some brands are missing. LinkedIn, VS Code, Adobe and IBM asked Simple Icons to remove them. LinkedIn gets a generic message icon on my page.

## The brand's hue and chroma, from its hex

OKLCH describes a color as lightness, chroma (how colorful) and hue (which color). I want the brand's chroma and hue, so I convert its hex to OKLab first. The math is [Björn Ottosson's](https://bottosson.github.io/posts/oklab/), and it's shorter than it looks:

```ts
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
		chroma: Math.min(Math.hypot(A, B), 0.17)
	};
}
```

Step by step:

1. **sRGB to linear light.** Screen values aren't proportional to light; `linear()` undoes that curve. It's the same step [my contrast checker](./2026-11-02-a-contrast-checker-for-my-own-tokens) uses for luminance.
2. **Linear light to l, m, s,** roughly how the three kinds of cones in the eye respond, then a cube root.
3. **l, m, s to a and b:** green to red, and blue to yellow. A gray has a = b = 0.
4. **Hue** is the angle of the point (a, b), and **chroma** its distance from gray.

Chroma is capped at 0.17. A very saturated brand (a pure red) at my theme's lightness would fall outside what the screen can show, and the browser would clip it, some colors more than others.

## CSS takes it from there

This runs at build time, when my skills file is read, so the browser only gets two numbers per logo. The component puts them on the skill's row, and CSS builds the color with relative color syntax:

```svelte
<li class="skill" style:--hue={color?.hue} style:--chroma={color?.chroma}>
```

```css
.skill {
	--glow: oklch(from var(--icon-tone) l var(--chroma, c) var(--hue, h));
}

.icon {
	color: var(--glow);
}
```

It's a custom property on the row because the icon isn't the only thing that uses it: the row's border lights up in the same color when you point at it.

`oklch(from X l c h)` starts from the color X and lets you replace any channel. Here `l` stays the theme's (`--icon-tone`, which is my brand green in each theme), and chroma and hue come from the brand. A Lucide icon has no brand, so `--hue` isn't set, and the fallbacks `c` and `h` keep the theme color's own: those icons are simply green.

`--icon-tone` lives in `tokens.css` with the other semantic tokens, so a future theme can change how light the icons are without touching the component.

<!-- TODO: open DevTools, change --icon-tone on :root to another color, and describe what happens to the logos -->

## The result

Every logo is as readable as the text next to it, in both themes, and still looks like itself. GitHub's black logo becomes a light gray on dark (black has almost no chroma, so whatever its hue, it stays gray), and JavaScript's yellow turns a dark gold on light.

<!-- TODO: which logo surprised me most after the change -->
