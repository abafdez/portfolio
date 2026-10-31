<script lang="ts">
	import { profiles } from '#lib/links.ts';
</script>

<footer id="footer">
	<!-- A visual hint that there's more below, for mouse and touch users. Hidden from
	     screen readers and the tab order: the footer itself is always reachable. -->
	<a class="hint" href="#footer" aria-hidden="true" tabindex="-1">
		<svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" /></svg>
	</a>
	<div class="inner">
		<p><small>&copy; {new Date().getFullYear()} Alfonso Baeza. All rights reserved.</small></p>
		<ul>
			{#each profiles as profile (profile.label)}
				<li><a href={profile.url}>{profile.label}</a></li>
			{/each}
		</ul>
	</div>
</footer>

<style>
	footer {
		border-block-start: var(--border-size-1) solid var(--surface-3);
		font-family: var(--font-label);
		color: var(--text-2);
	}

	.inner {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: center;
		gap: var(--size-2) var(--size-4);
		max-inline-size: var(--content-width);
		margin-inline: auto;
		padding: var(--size-4) var(--size-3);
	}

	ul {
		display: flex;
		gap: var(--size-4);
		padding: 0;
		list-style: none;
	}

	/* Only shown where it can fade out by itself (below). */
	.hint {
		display: none;
		position: fixed;
		inset-block-end: var(--size-3);
		inset-inline-start: 50%;
		translate: -50% 0;
		z-index: 1;
		padding: var(--size-1) var(--size-3);
		border-radius: var(--radius-round);
		background: var(--brand);
		color: var(--surface-1);
		box-shadow: var(--shadow-float);
	}

	.hint svg {
		inline-size: var(--size-5);
		fill: none;
		stroke: currentColor;
		stroke-width: 3;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	/* Two scroll-driven animations, both on a view timeline: progress follows the
	   footer itself crossing into the viewport, not the whole page.
	   view-timeline names it here, so the hint (a child) can use it too.
	   - the footer content slides up and fades in as the footer enters;
	   - the hint fades out over the same range, so it's gone when the footer is in.
	   On a short page the footer is already in view, so the hint never shows. */
	@supports (animation-timeline: view()) {
		@media (prefers-reduced-motion: no-preference) {
			footer {
				view-timeline: --footer;
			}

			.inner {
				animation: footer-in linear both;
				animation-timeline: --footer;
				animation-range: entry 0% entry 100%;
			}

			.hint {
				display: block;
				animation: hint-out linear both;
				animation-timeline: --footer;
				animation-range: entry 0% entry 50%;
			}

			/* A normal time-based loop, on the svg so it doesn't clash with the fade. */
			.hint svg {
				animation: hint-bob 1.6s ease-in-out infinite;
			}
		}
	}

	@keyframes footer-in {
		from {
			opacity: 0;
			translate: 0 var(--size-5);
		}
	}

	@keyframes hint-out {
		to {
			opacity: 0;
			visibility: hidden;
		}
	}

	@keyframes hint-bob {
		50% {
			translate: 0 3px;
		}
	}
</style>
