// What the 404 canvases share: the site's colours, a sharp drawing at any size, and a
// frame loop.

// A canvas can't read CSS custom properties. So each token is set as the `color` of a
// hidden probe, and the browser hands it back resolved (rgb() or oklch(), which a canvas
// understands), in the current theme and colour theme.
export function readColours<Name extends string>(
	host: HTMLElement,
	tokens: Record<Name, string>
): Record<Name, string> {
	const probe = document.createElement('span');
	probe.hidden = true;
	host.append(probe);
	const colours = {} as Record<Name, string>;
	for (const [name, token] of Object.entries(tokens) as [Name, string][]) {
		probe.style.color = `var(${token})`;
		colours[name] = getComputedStyle(probe).color;
	}
	probe.remove();
	return colours;
}

// Calls back whenever the colours may have changed: the light/dark toggle and the colour
// theme picker set attributes on <html>, and the OS can switch light/dark by itself.
export function onColoursChange(callback: () => void) {
	const observer = new MutationObserver(callback);
	observer.observe(document.documentElement, {
		attributes: true,
		attributeFilter: ['data-theme', 'data-palette']
	});
	const scheme = matchMedia('(prefers-color-scheme: dark)');
	scheme.addEventListener('change', callback);
	return () => {
		observer.disconnect();
		scheme.removeEventListener('change', callback);
	};
}

// Keeps a canvas sharp at whatever size CSS gives it: its pixels follow its size (times
// the screen's density), and the drawing is scaled so 1 unit is 1 / `units` of its
// width. The games use grid cells as units, so their code never thinks in pixels.
// Returns the scale (CSS pixels per unit) through `onResize`, and a clean-up.
export function fit(
	canvas: HTMLCanvasElement,
	units: number,
	onResize: (scale: number) => void = () => {}
) {
	const context = canvas.getContext('2d')!;
	const observer = new ResizeObserver(() => {
		const ratio = devicePixelRatio;
		canvas.width = Math.round(canvas.clientWidth * ratio);
		canvas.height = Math.round(canvas.clientHeight * ratio);
		const scale = canvas.clientWidth / units;
		context.setTransform(scale * ratio, 0, 0, scale * ratio, 0, 0);
		onResize(scale);
	});
	observer.observe(canvas);
	return () => observer.disconnect();
}

// Calls step(seconds since the last frame) on every frame until stopped. The time is
// capped: after a hidden tab comes back, the first frame would otherwise jump ahead.
export function loop(step: (seconds: number) => void) {
	let frame = 0;
	let last = performance.now();
	const tick = (now: number) => {
		step(Math.min((now - last) / 1000, 1 / 20));
		last = now;
		frame = requestAnimationFrame(tick);
	};
	frame = requestAnimationFrame(tick);
	return () => cancelAnimationFrame(frame);
}

// One line between every two cells, as a path to stroke (the games' faint grid).
export function grid(context: CanvasRenderingContext2D, columns: number, rows: number) {
	context.beginPath();
	for (let x = 1; x < columns; x++) {
		context.moveTo(x, 0);
		context.lineTo(x, rows);
	}
	for (let y = 1; y < rows; y++) {
		context.moveTo(0, y);
		context.lineTo(columns, y);
	}
}
