<script lang="ts">
	import { onMount, flushSync } from 'svelte';

	type Theme = 'light' | 'dark';

	interface Props {
		// How long the circle takes to cover the screen, in milliseconds.
		duration?: number;
		// How soft the circle's edge is, in pixels. 0 is a sharp edge.
		blur?: number;
	}

	let { duration = 600, blur = 0 }: Props = $props();

	// Unknown until mounted: the prerendered HTML can't know the visitor's theme.
	let theme = $state<Theme>();

	const systemTheme = (): Theme =>
		matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

	onMount(() => {
		// app.html may already have set data-theme from localStorage; otherwise follow the OS.
		const sync = () => {
			const saved = document.documentElement.dataset.theme;
			theme = saved === 'light' || saved === 'dark' ? saved : systemTheme();
		};
		sync();

		// Keep the button right if the OS theme changes while the page is open.
		const query = matchMedia('(prefers-color-scheme: dark)');
		query.addEventListener('change', sync);
		return () => query.removeEventListener('change', sync);
	});

	// Two states: the system theme and its opposite (Lea Verou's model).
	// Going back to the system theme removes the override, so the site follows the OS again.
	function flip() {
		theme = theme === 'dark' ? 'light' : 'dark';
		const root = document.documentElement;
		try {
			if (theme === systemTheme()) {
				delete root.dataset.theme;
				localStorage.removeItem('theme');
			} else {
				root.dataset.theme = theme;
				localStorage.setItem('theme', theme);
			}
		} catch {
			// Storage blocked (private mode): the theme still applies for this visit.
		}
	}

	// The new theme grows out of the button in a circle (a view transition).
	// Without view transition types, or with reduced motion, it just flips.
	function toggle(event: MouseEvent) {
		const canReveal = typeof ViewTransition !== 'undefined' && 'types' in ViewTransition.prototype;
		if (!canReveal || matchMedia('(prefers-reduced-motion: reduce)').matches) return flip();

		// The circle starts at the button's center and must end past the farthest corner.
		const { left, top, width, height } = (
			event.currentTarget as HTMLElement
		).getBoundingClientRect();
		const x = left + width / 2;
		const y = top + height / 2;
		const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

		const root = document.documentElement;
		root.style.setProperty('--reveal-x', `${x}px`);
		root.style.setProperty('--reveal-y', `${y}px`);
		root.style.setProperty('--reveal-r', `${radius}px`);
		// The props go on :root too: the transition's pseudo-elements hang off :root,
		// outside this component, so it's the only place their CSS can read them.
		root.style.setProperty('--reveal-duration', `${duration}ms`);
		root.style.setProperty('--reveal-blur', `${blur}px`);

		// flushSync: the browser takes its "after" picture when update() returns, so Svelte
		// must apply aria-pressed now instead of in its next batch.
		document.startViewTransition({ update: () => flushSync(flip), types: ['theme'] });
	}
</script>

<!-- Icon-only, so the label is aria-label (and title, for a tooltip on hover). -->
<button
	type="button"
	onclick={toggle}
	aria-label="Dark theme"
	title="Dark theme"
	aria-pressed={theme ? theme === 'dark' : undefined}
	disabled={!theme}
>
	<!-- A sun with rays. In dark, the sun grows, the rays fade out, and a hidden
	     circle in the mask slides over the sun to bite out a crescent moon. -->
	<svg aria-hidden="true" viewBox="0 0 24 24">
		<mask id="moon-mask">
			<rect width="24" height="24" fill="white" />
			<circle class="bite" cx="24" cy="10" r="6" fill="black" />
		</mask>
		<circle class="sun" cx="12" cy="12" r="6" mask="url(#moon-mask)" fill="currentColor" />
		<g class="rays" stroke="currentColor">
			<line x1="12" y1="1" x2="12" y2="3" />
			<line x1="12" y1="21" x2="12" y2="23" />
			<line x1="1" y1="12" x2="3" y2="12" />
			<line x1="21" y1="12" x2="23" y2="12" />
			<line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
			<line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
			<line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
			<line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
		</g>
	</svg>
</button>

<style>
	button {
		display: grid;
		place-items: center;
		inline-size: var(--size-8);
		block-size: var(--size-8);
		padding: var(--size-2);
		color: var(--text-2);
		background: none;
		border: none;
		border-radius: var(--radius-round);
		cursor: pointer;
		touch-action: manipulation;

		&:is(:hover, :focus-visible) {
			color: var(--text-1);
		}
	}

	svg {
		inline-size: 100%;
		block-size: 100%;
		stroke-linecap: round;
	}

	/* The icon reads --dark (tokens.css), not aria-pressed, so it's already right in
	   the prerendered HTML, before JS runs. Same idea as the no-flash colors. */
	.sun,
	.rays {
		transform-origin: center;
	}

	.sun {
		transform: scale(calc(1 + 0.75 * var(--dark)));
		transition: transform 0.5s var(--ease-elastic-out-3);
	}

	.rays {
		stroke-width: 2px;
		opacity: calc(1 - var(--dark));
		transform: rotate(calc(-25deg * var(--dark)));
		transition:
			transform 0.5s var(--ease-elastic-out-3),
			opacity 0.5s var(--ease-3);
	}

	.bite {
		transform: translateX(calc(-7px * var(--dark)));
		transition: transform 0.25s var(--ease-out-5);
	}

	/* The circular reveal. During a "theme" view transition the browser shows two
	   screenshots: the old page (::view-transition-old) under the new one. The old one
	   stays still; the new one is masked to a circle that grows from the button.
	   mix-blend-mode: by default the two are blended for a cross-fade, which would
	   brighten the inside of the circle. */
	:global(:root:active-view-transition-type(theme)::view-transition-old(root)) {
		animation: none;
		mix-blend-mode: normal;
	}

	/* The circle is a radial-gradient mask, not a clip-path, because a gradient can
	   have a soft edge: solid up to radius - blur, then fading out until radius.
	   forwards: the transition outlives the animation by a frame or so. Without it,
	   the radius drops back to 0px in that gap, the mask hides the new picture, and
	   the old theme flashes through. */
	:global(:root:active-view-transition-type(theme)::view-transition-new(root)) {
		animation: theme-reveal var(--reveal-duration) var(--ease-in-out-3) forwards;
		mix-blend-mode: normal;
		mask-image: radial-gradient(
			circle at var(--reveal-x) var(--reveal-y),
			#000 calc(var(--reveal-radius) - var(--reveal-blur)),
			transparent var(--reveal-radius)
		);
	}

	/* A custom property is untyped text, so the browser can't animate it between two
	   values. Registering it as a <length> lets the keyframes below tween it. */
	@property --reveal-radius {
		syntax: '<length>';
		inherits: false;
		initial-value: 0px;
	}

	/* It ends a blur past the farthest corner, so the soft edge leaves the screen too. */
	@keyframes -global-theme-reveal {
		from {
			--reveal-radius: 0px;
		}
		to {
			--reveal-radius: calc(var(--reveal-r) + var(--reveal-blur));
		}
	}
</style>
