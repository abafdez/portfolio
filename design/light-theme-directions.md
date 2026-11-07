# Light theme directions (2026-11-07)

The light theme feels dull: it was adapted from the dark one, with the same cold blue-grey neutrals at low chroma, a dark forest green (`46% 0.13 148`) used only for text, cards barely different from the page, a grey grid you can hardly see, and a heavy header shadow.

Three directions were previewed by overriding only the light half of the tokens in the browser (screenshots in `.playwright-mcp/theme/`, not committed). All text passed 4.5:1 on all three surfaces. On hold since named themes came first; each could become a palette (`src/lib/styles/themes/`) or replace the default light half. Before using one: re-measure the grid lines under text and the spotlight (tokens.css), and keep `color-mix(…, transparent)` in oklab.

- **A — Blueprint paper:** pale blue drafting paper, a visible blue grid, white cards, navy ink. The most "technical drawing"; green on blue is the least harmonious.
- **B — Engineering pad:** warm cream paper with a green grid (like green squared engineering pads), white cards, warm near-black ink. The grid matches the brand; the warmest.
- **C — Crisp white:** pure white page, mint-tinted cards and buttons, a faint green grid. The closest to "the dark theme with the lights on".

The overrides as they were previewed (light half only; the dark half repeats tokens.css):

### A-blueprint

```css
:root,
[data-theme] {
	--surface-1: light-dark(oklch(96.5% 0.016 245), var(--ink-8));
	--surface-2: light-dark(oklch(99% 0.004 245), var(--ink-7));
	--surface-3: light-dark(oklch(89% 0.03 245), var(--ink-6));
	--text-1: light-dark(oklch(26% 0.06 260), var(--ink-2));
	--text-2: light-dark(oklch(45% 0.05 255), var(--ink-4));
	--brand: light-dark(oklch(47% 0.14 150), var(--green-bright));
	--grid-line: light-dark(
		color-mix(in oklab, oklch(55% 0.13 245) 9%, transparent),
		color-mix(in oklab, var(--ink-2) 3%, transparent)
	);
	--grid-line-major: light-dark(
		color-mix(in oklab, oklch(55% 0.13 245) 16%, transparent),
		color-mix(in oklab, var(--ink-2) 6%, transparent)
	);
	--grid-mark: light-dark(
		color-mix(in oklab, oklch(55% 0.13 245) 35%, transparent),
		color-mix(in oklab, var(--ink-2) 18%, transparent)
	);
	--shadow-float: 0 var(--size-2) var(--size-6)
		light-dark(
			color-mix(in oklab, oklch(40% 0.08 250) 14%, transparent),
			color-mix(in oklab, var(--ink-8) 35%, transparent)
		);
}
```

### B-engineering-pad

```css
:root,
[data-theme] {
	--surface-1: light-dark(oklch(97% 0.02 95), var(--ink-8));
	--surface-2: light-dark(oklch(99.5% 0.006 95), var(--ink-7));
	--surface-3: light-dark(oklch(90% 0.03 95), var(--ink-6));
	--text-1: light-dark(oklch(24% 0.02 60), var(--ink-2));
	--text-2: light-dark(oklch(45% 0.03 60), var(--ink-4));
	--brand: light-dark(oklch(46% 0.14 150), var(--green-bright));
	--grid-line: light-dark(
		color-mix(in oklab, oklch(60% 0.12 150) 12%, transparent),
		color-mix(in oklab, var(--ink-2) 3%, transparent)
	);
	--grid-line-major: light-dark(
		color-mix(in oklab, oklch(60% 0.12 150) 20%, transparent),
		color-mix(in oklab, var(--ink-2) 6%, transparent)
	);
	--grid-mark: light-dark(
		color-mix(in oklab, oklch(60% 0.12 150) 40%, transparent),
		color-mix(in oklab, var(--ink-2) 18%, transparent)
	);
	--shadow-float: 0 var(--size-2) var(--size-6)
		light-dark(
			color-mix(in oklab, oklch(40% 0.03 70) 14%, transparent),
			color-mix(in oklab, var(--ink-8) 35%, transparent)
		);
}
```

### C-crisp-white

```css
:root,
[data-theme] {
	--surface-1: light-dark(oklch(100% 0 0), var(--ink-8));
	--surface-2: light-dark(oklch(96.5% 0.02 150), var(--ink-7));
	--surface-3: light-dark(oklch(90% 0.045 150), var(--ink-6));
	--text-1: light-dark(oklch(22% 0.03 165), var(--ink-2));
	--text-2: light-dark(oklch(44% 0.04 160), var(--ink-4));
	--brand: light-dark(oklch(45% 0.15 150), var(--green-bright));
	--grid-line: light-dark(
		color-mix(in oklab, oklch(55% 0.12 150) 8%, transparent),
		color-mix(in oklab, var(--ink-2) 3%, transparent)
	);
	--grid-line-major: light-dark(
		color-mix(in oklab, oklch(55% 0.12 150) 14%, transparent),
		color-mix(in oklab, var(--ink-2) 6%, transparent)
	);
	--grid-mark: light-dark(
		color-mix(in oklab, oklch(55% 0.12 150) 30%, transparent),
		color-mix(in oklab, var(--ink-2) 18%, transparent)
	);
	--shadow-float: 0 var(--size-2) var(--size-6)
		light-dark(
			color-mix(in oklab, oklch(40% 0.04 160) 14%, transparent),
			color-mix(in oklab, var(--ink-8) 35%, transparent)
		);
}
```
