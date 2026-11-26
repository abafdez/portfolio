<script lang="ts">
	import TeaserCard, { type Teaser } from './TeaserCard.svelte';
	import { m, route } from '#lib/i18n/index.ts';
	import { devlogTag } from '#lib/links.ts';

	// Devlog entries as a timeline, one section per learning-path phase (/devlog and its
	// tag pages). They come grouped already, newest phase first.
	type Entry = Teaser & { slug: string };

	let { phases }: { phases: [number | undefined, Entry[]][] } = $props();
</script>

{#each phases as [phase, entries], i (phase)}
	<section aria-labelledby="phase-{phase}" class:first={i === 0}>
		<h2 id="phase-{phase}">
			{phase === undefined ? m.devlogOther() : m.devlogPhase({ phase: String(phase) })}
		</h2>
		<!-- The timeline: a line down the side, a dot for each entry. -->
		<ol class="timeline">
			{#each entries as entry (entry.slug)}
				<li>
					<TeaserCard
						{...entry}
						href={route('/devlog/[slug]', { slug: entry.slug })}
						tagHref={devlogTag}
					/>
				</li>
			{/each}
		</ol>
	</section>
{/each}

<style>
	section:not(.first) {
		margin-block-start: var(--size-7);
	}

	/* The timeline: a line down the side (::before), and over it a brand-coloured line
	   that fills as you read (::after, below). position: relative for both. */
	.timeline {
		position: relative;
		display: grid;
		gap: var(--size-4);
		margin-block-start: var(--size-3);
		padding: 0 0 0 var(--size-5);
		list-style: none;
	}

	.timeline::before,
	.timeline::after {
		content: '';
		position: absolute;
		inset-block: 0;
		inset-inline-start: 0;
		inline-size: var(--border-size-2);
		background-color: var(--surface-3);
	}

	/* Without scroll-driven animations it's just the grey line. */
	.timeline::after {
		display: none;
		background-color: var(--brand);
		transform-origin: top;
	}

	li {
		position: relative;
	}

	/* The dot, centered on the line: the list's padding plus half the line's width. */
	li::before {
		content: '';
		position: absolute;
		inset-block-start: var(--size-4);
		inset-inline-start: calc(-1 * var(--size-5) - var(--border-size-2) / 2 - var(--size-1));
		inline-size: var(--size-2);
		aspect-ratio: 1;
		border-radius: 50%;
		background-color: var(--brand);
	}

	/* Scroll-driven, so it follows your reading, not a clock:
	   - the brand line fills down the timeline as the middle of the screen passes it:
	     view(50% 50%) shrinks the viewport to a line at its middle, and "cover" runs
	     from the list's top reaching that line to its bottom leaving it;
	   - each entry is wiped in from the top and slides from the line as it enters the
	     screen (a wipe, not a fade: Lighthouse measures contrast on load, and text at
	     opacity 0 below the fold fails it);
	   - each dot pops as its entry arrives.
	   Content already on screen when the page loads is past its range, so it's shown. */
	@supports (animation-timeline: view()) {
		@media (prefers-reduced-motion: no-preference) {
			.timeline::after {
				display: block;
				animation: line-fill linear both;
				animation-timeline: view(50% 50%);
				animation-range: cover 0% cover 100%;
			}

			li {
				animation: entry-in linear both;
				animation-timeline: view();
				animation-range: entry 0% entry 70%;
			}

			li::before {
				animation: dot-pop linear both;
				animation-timeline: view();
				animation-range: entry 20% entry 80%;
			}
		}
	}

	@keyframes line-fill {
		from {
			scale: 1 0;
		}
		to {
			scale: 1 1;
		}
	}

	/* The clip reaches 4rem to the left, where the dot sits outside the entry, and 2rem
	   around everything else (the card's focus ring and border light). inset() at both
	   ends: inset() to none doesn't interpolate. */
	@keyframes entry-in {
		from {
			clip-path: inset(-2rem -2rem 100% -4rem);
			translate: calc(-1 * var(--size-4)) 0;
		}
		to {
			clip-path: inset(-2rem -2rem -2rem -4rem);
		}
	}

	@keyframes dot-pop {
		0% {
			scale: 0;
		}
		70% {
			scale: 1.6;
		}
		100% {
			scale: 1;
		}
	}
</style>
