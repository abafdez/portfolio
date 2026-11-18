# 6. Recipes

The techniques behind the effects, pulled out so you can use them anywhere. Each recipe says where it already runs on the site, gives the code to copy, and lists what to keep for accessibility. The snippets are trimmed from the real files; open those for the full, commented version.

In Svelte 5, an **attachment** is a function that receives an element when it's mounted and returns a clean-up: `<div {@attach spotlight}>`. Several recipes are attachments because that's the cleanest way to reuse element behaviour.

---

## 1. A light on a border that follows the pointer

**On the site:** skill rows on `/about`, tag chips, the footer panel's columns. **Files:** `src/lib/spotlight.ts`, `src/lib/skills/Skill.svelte`.

The attachment goes on the list and gives _every_ item the pointer's position relative to that item, so the light spills onto the neighbours' borders like one lamp moving over the list:

```ts
// spotlight.ts
export const spotlight: Attachment<HTMLElement> = (list) => {
	const move = (event: PointerEvent) => {
		for (const item of list.children as HTMLCollectionOf<HTMLElement>) {
			const box = item.getBoundingClientRect();
			item.style.setProperty('--x', `${event.clientX - box.left}px`);
			item.style.setProperty('--y', `${event.clientY - box.top}px`);
		}
	};
	list.addEventListener('pointermove', move);
	return () => list.removeEventListener('pointermove', move);
};
```

The CSS draws a radial gradient at that point and cuts it down to a 1 px ring with a mask (the whole box minus its content box):

```css
.item {
	position: relative;
}
.item::before {
	content: '';
	position: absolute;
	inset: -1px;
	padding: 1px;
	border-radius: inherit;
	background: radial-gradient(16rem circle at var(--x) var(--y), var(--brand), transparent 70%);
	mask:
		linear-gradient(#000 0 0) content-box exclude,
		linear-gradient(#000 0 0);
	pointer-events: none;
}
```

```svelte
<ul {@attach spotlight}>
	<li class="item">…</li>
</ul>
```

Change the light's colour with the gradient, its reach with `16rem`, the ring's thickness with `padding`/`inset`. Fill the box instead of the ring: drop the `mask`. It's decoration on a border, so it doesn't affect text contrast. For a light that only shows while hovered, add `opacity: 0` and `.list:hover .item::before { opacity: 1 }` (as `Skill.svelte` does).

## 2. A 3D tilt toward the pointer, and a magnetic button

**On the site:** the ID-card look and the open-to-work look in the footer panel. **File:** `src/lib/components/hire/tilt.ts`.

`tilt(max, reach)` writes the rotation (`--rx`, `--ry`), the pointer's place over the card for a light (`--px`, `--py`) and how much it's tilting (`--tilt`, 0 to 1). It does nothing on touch or with reduced motion:

```svelte
<script>
	import { tilt } from '#lib/components/hire/tilt.ts';
</script>

<div class="stage">
	<div class="card" {@attach tilt(14, 140)}>…</div>
</div>

<style>
	.stage {
		position: relative; /* the card's untilted offsetParent: tilt() measures against it */
		perspective: 50rem; /* the depth of the 3D space */
	}
	.card {
		transform: rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)); /* no transition */
	}
	.light {
		opacity: var(--tilt, 0);
	}
</style>
```

Three things make it feel right, and each fixed a real bug:

- **It anticipates.** It listens to the pointer on the whole page, not on the card, and starts leaning while the pointer is still `reach` px away (a smoothstep from 0 there to 1 at the edge). Listening on the card made the tilt jump the moment the pointer arrived.
- **It doesn't bounce at the edges.** It measures the card's untilted box: `offsetLeft`/`offsetTop`/`offsetWidth`/`offsetHeight` ignore transforms, taken against the offsetParent's box. Measuring the tilted card with `getBoundingClientRect()` moved its edge out from under the pointer, which reset the tilt, which brought the edge back, again and again. That's why the wrapper needs `position: relative` and mustn't be transformed itself.
- **It eases in script, not CSS.** Every frame moves the angles part of the way to their target (`now += (goal - now) * (1 - Math.exp(-dt * 8))`, about 90% in 300 ms at any frame rate), and frames stop once it settles. A CSS `transition` on `transform` would lag behind and switch speeds when the pointer enters.

Other notes:

- **Depth:** give the card `transform-style: preserve-3d` and its children `transform: translateZ(2rem)`. Nothing between them may clip (`overflow: hidden` flattens the 3D).
- **Overflow:** a tilted box still counts as scrollable overflow. Give the container room (padding) or `overflow-x: hidden` on the scrolling parent, or it scrolls sideways.

`magnet(pull)` makes an element lean toward the pointer while it's near (reading moves over its parent): use `translate: var(--mx, 0) var(--my, 0)` with a springy `transition`.

## 3. A popover that animates in and out

**On the site:** the search box, the footer panel, the colour-theme menu. **Files:** `Search.svelte`, `Footer.svelte`, `PalettePicker.svelte`.

The Popover API does the behaviour with no JavaScript: Escape and a click outside close it, focus goes back to the button, and it sits in the top layer above everything.

```svelte
<button popovertarget="menu">Open</button><div id="menu" popover>…</div>
```

Animating it takes two newer CSS features. A closed popover is `display: none`, and `display` can't be animated, so:

```css
@media (prefers-reduced-motion: no-preference) {
	[popover] {
		opacity: 0;
		translate: 0 -0.5rem;
		transition:
			opacity 160ms var(--ease-out-2),
			translate 260ms var(--ease-spring-2),
			display 260ms allow-discrete,
			overlay 260ms allow-discrete;
	}
	[popover]:popover-open {
		opacity: 1;
		translate: 0;
		@starting-style {
			opacity: 0;
			translate: 0 -0.5rem;
		}
	}
}
```

- The `:popover-open` state is the end of the transition, `@starting-style` is where it starts when it appears, and the closed state is where it goes when it leaves.
- `allow-discrete` on `display` and `overlay` keeps it rendered and in the top layer until the other properties finish, so the closing animation is seen.
- The backdrop (`[popover]::backdrop`) can transition the same way.
- **Place it under its button** with anchor positioning: `anchor-name: --menu-button` on the button, `position-anchor: --menu-button; position-area: block-end span-inline-start; inset: auto;` on the popover, and an `@supports not (position-area: block-end)` fallback (see `PalettePicker.svelte`).
- To react when it opens (focus an input, load data): `ontoggle={(event) => event.newState === 'open' && …}`.

## 4. Animations driven by scrolling

**On the site:** the header lifting off (`Header.svelte`), the home sections wiping in (`+page.svelte`), the footer handle fading out (`Footer.svelte`). Reference and demos: scroll-driven-animations.style.

A scroll-driven animation is a normal `@keyframes` animation whose progress follows a scroll position instead of time:

```css
@supports (animation-timeline: scroll()) {
	@media (prefers-reduced-motion: no-preference) {
		/* 1. The page's scroll: over the first 5rem of scrolling */
		.bar {
			animation: lift linear both;
			animation-timeline: scroll();
			animation-range: 0 var(--size-10);
		}

		/* 2. The element crossing the screen: while it enters */
		.section {
			animation: reveal linear both;
			animation-timeline: view();
			animation-range: entry 0% entry 80%;
		}

		/* 3. Another element's progress: name it, then use the name */
		footer {
			view-timeline: --footer;
		}
		.hint {
			animation: fade-out linear both;
			animation-timeline: --footer;
			animation-range: entry 0% entry 60%;
		}
	}
}
```

- Use `linear` timing: the scroll is the easing.
- Write the end state as the element's normal style and only a `from` keyframe, so browsers without the feature show the end state.
- Prefer a `clip-path` wipe to `opacity: 0` for content below the fold: Lighthouse measures contrast on load and fails text that's invisible.
- An element can only run one `animation` declaration; if it already has a time-based entrance, put the scroll animation on a child.

## 5. Animating a value CSS can't animate: `@property`

**On the site:** the theme circle's radius (`ThemeToggle.svelte`), the turning ring (`hire/Spotlight.svelte`), the beam round the hire column (`Footer.svelte`), the scanline (`palette-transitions.css`).

A custom property is just text to the browser, so `--angle: 0deg` → `360deg` jumps. Registering it gives it a type, and typed values interpolate:

```css
@property --angle {
	syntax: '<angle>';
	inherits: false;
	initial-value: 0deg;
}

.ring {
	background: conic-gradient(
		from var(--angle),
		var(--brand),
		transparent 40%,
		var(--brand) 60%,
		transparent
	);
	animation: turn 4s linear infinite;
}

@keyframes turn {
	to {
		--angle: 360deg;
	}
}
```

Use it for gradient angles, gradient stops (a radius for a growing circle mask), percentages that position a line. Pair a conic gradient with the masked ring from recipe 1 and you get a beam running round a border.

## 6. Animating to `height: auto`

**On the site:** the skill windows on `/about` (`SkillWindow.svelte`).

A one-row grid can animate between `1fr` (the content's height) and `0fr` (nothing):

```css
.reveal {
	display: grid;
	grid-template-rows: 1fr;
	transition: grid-template-rows 300ms var(--ease-out-3);
}
.reveal.closed {
	grid-template-rows: 0fr;
}
.reveal > * {
	min-block-size: 0; /* or the row can't shrink below its content */
	overflow: clip;
}
```

Then make closed content findable: after the close transition ends, set `hidden="until-found"` on it. Find in page (Ctrl+F) can still search it and fires `beforematch` just before showing a match, so you can open it. Never `display: none`, which hides it from find in page. Only collapse with JavaScript (`@media (scripting: enabled)`), since only script can open it again.

## 7. Do something once, when an element is on screen

**On the site:** the skill bars filling up (`src/lib/skills/fill.ts`).

One shared `IntersectionObserver` for all elements (not one each), marking each one and stopping watching it:

```ts
let observer: IntersectionObserver | undefined;

export const onView: Attachment<HTMLElement> = (element) => {
	observer ??= new IntersectionObserver(
		(entries) => {
			entries
				.filter((entry) => entry.isIntersecting)
				.forEach((entry, i) => {
					const target = entry.target as HTMLElement;
					target.style.setProperty('--delay', `${i * 70}ms`); // a cascade
					target.dataset.seen = '';
					observer?.unobserve(target);
				});
		},
		{ threshold: 1 }
	);
	observer.observe(element);
	return () => observer?.unobserve(element);
};
```

CSS starts the animation from `[data-seen]` with `animation-delay: var(--delay)`. Watch the element that's fully visible, not a clipped child: an empty fill clipped to nothing never counts as visible.

## 8. A value from the pointer, once a frame

**On the site:** the footer handle growing as the pointer nears the bottom (`Footer.svelte`).

Pointer events can fire more often than the screen redraws. Keep the latest position and update at most once a frame, writing straight to the element's style; Svelte state would re-render on every move for nothing:

```ts
onMount(() => {
	if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
	let frame = 0;
	let y = 0;
	const update = () => {
		frame = 0;
		const near = Math.min(1, Math.max(0, 1 - (innerHeight - y) / reach));
		element.style.setProperty('--near', near.toFixed(3));
	};
	const onMove = (event: PointerEvent) => {
		y = event.clientY;
		frame ||= requestAnimationFrame(update);
	};
	addEventListener('pointermove', onMove, { passive: true });
	return () => {
		removeEventListener('pointermove', onMove);
		cancelAnimationFrame(frame);
	};
});
```

Then the CSS does the design from one number: `opacity: calc(0.35 + var(--near) * 0.65)`, `translate: 0 calc((1 - var(--near)) * 1.4rem)`, `inline-size: calc(2rem + var(--near) * 2rem)`. A `transition` on those properties smooths the steps.

## 9. A canvas that follows the theme

**On the site:** the 404 games. **File:** `src/lib/projects/not-found/canvas.ts`.

A canvas can't read CSS custom properties, and it's blurry unless its pixels match the screen. The helpers:

```ts
import { readColours, onColoursChange, fit, loop } from '#lib/projects/not-found/canvas.ts';

let colours = readColours(host, { ink: '--text-1', accent: '--brand' }); // via a hidden probe
const stopWatching = onColoursChange(() => (colours = readColours(host, { … })));
const stopFitting = fit(canvas, 23, (scale) => {}); // 1 unit = 1/23 of the width, sharp at any DPR
const stopLoop = loop((seconds) => {
	step(game, seconds); // your rules, in plain TS
	draw(context, game, colours);
});
```

- `readColours` sets each token as the `color` of a hidden element and reads back the resolved colour, in the current theme and colour theme.
- `onColoursChange` re-reads when `data-theme` or `data-palette` change on `<html>` (a `MutationObserver`) or the OS switches light/dark.
- `fit` uses a `ResizeObserver` and `devicePixelRatio`, so your drawing code thinks in grid cells, not pixels.
- `loop` caps the frame time at 1/20 s, so a tab coming back from the background doesn't jump.
- Keep the rules in plain functions with unit tests and no canvas (`breakout.ts`, `snake.ts`); keep fast-changing state in a plain object and copy only what the page shows as text into `$state`.
- Accessibility: `role="application"` on a game canvas so screen readers pass keys through, a `role="status"` line, a text score, on-screen buttons for touch.

## 10. Counting up and typing out, accessibly

**On the site:** the spotlight look's counters, the terminal look (`src/lib/components/hire/`).

```svelte
<script>
	let progress = $state(0);
	onMount(() => {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return void (progress = 1);
		const start = performance.now();
		let frame = requestAnimationFrame(function step(now) {
			const t = Math.min(1, (now - start) / 1200);
			progress = 1 - (1 - t) ** 3; // ease out
			if (t < 1) frame = requestAnimationFrame(step);
		});
		return () => cancelAnimationFrame(frame);
	});
</script>

<span aria-hidden="true">{Math.round(15 * progress)}+</span>
<span class="visually-hidden">15+</span>
```

The moving version is `aria-hidden`, and a `.visually-hidden` copy gives screen readers the final value once. Typing works the same way: a `setTimeout` chain adds a character at a time to an `aria-hidden` element, with the full text visually hidden next to it.

## 11. Passing an animation into a component

**On the site:** the home page animating `Hero` (`+page.svelte`, `Hero.svelte`).

A component can expose animation hooks as CSS custom properties with no default effect:

```css
/* Hero.svelte */
.photo {
	animation: var(--photo-animation, none);
}
```

```svelte
<!-- +page.svelte -->
<Hero --photo-animation="home-enter 600ms ease-out 0ms both" />

<style>
	@keyframes -global-home-enter {
		from {
			opacity: 0;
			translate: 0 var(--size-3);
		}
	}
</style>
```

Svelte renames keyframes per component; the `-global-` prefix keeps the name as written so another component can use it. Give it a name unique on the site.

## 12. A mask that animates itself

**On the site:** the ripple and rain colour-theme effects (`palette-transitions.ts`).

An SVG used as a CSS image runs its own SMIL animations (`<animate>`, `<set>`), even as a `mask-image`. Build the SVG as a string, put it in a custom property as a data URL, and the effect plays with no JavaScript running:

```ts
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
	<rect width="100" height="100" fill="#000" opacity="0">
		<animate attributeName="opacity" to="1" begin="0.2s" dur="0.3s" fill="freeze"/>
	</rect>
</svg>`;
root.style.setProperty('--mask', `url("data:image/svg+xml,${encodeURIComponent(svg)}")`);
```

```css
.thing {
	mask-image: var(--mask);
}
```

Group shapes that share a timing into one `<path>`: hundreds of separate `<animate>` elements get slow.

## 13. Pointer effects for any area

**On the site:** the cursors tool. **File:** `src/lib/projects/toolbox/cursors/effects.ts`.

`pointerEffect(() => effect)` is an attachment for an area with a `<canvas>` inside: trail, sparkles, ghost, dot and ring, ripple, burst (drawn on the canvas, which has `pointer-events: none`), spotlight, flashlight, invert, parallax (it sets `--x --y --dx --dy` and your CSS uses them), magnetic and tilt (it moves `[data-magnetic]` and `[data-tilt]` children). It draws only while something moves and does nothing under reduced motion. Read `Cursors.svelte` for the markup and CSS each effect expects.

## 14. Enhancement patterns used everywhere

- **Hidden only with script:** `@media (scripting: enabled) { .folded { … } }` and the matching `@media (scripting: none)` note. The no-JS page shows everything.
- **Disabled until mounted:** controls that do nothing without script get `disabled={!ready}`, with `ready = true` in `onMount`.
- **No layout shift:** reserve space for things that appear later (`visibility: hidden` until ready, a `min-block-size` while a component loads) instead of inserting them with `{#if}`.
- **Decoration hidden from screen readers:** `aria-hidden="true"` on duplicates and pure decoration (the marquee, the handle), with the real control reachable elsewhere.
- **Read settings once mounted:** the theme, palette, text size and URL parameters are read in `onMount`, never while prerendering, since the build can't know the visitor.
- **A random pick in the browser only:** `onMount`, never during render, or the server's pick and the browser's won't match.
