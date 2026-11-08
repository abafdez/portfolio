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

	.timeline {
		display: grid;
		gap: var(--size-4);
		margin-block-start: var(--size-3);
		padding: 0 0 0 var(--size-5);
		border-inline-start: var(--border-size-2) solid var(--surface-3);
		list-style: none;
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
</style>
