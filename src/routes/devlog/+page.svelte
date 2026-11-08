<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import { m, route } from '#lib/i18n/index.ts';
	import TeaserCard from '#lib/components/TeaserCard.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<Seo title={m.devlogTitle()} description={m.devlogDescription()} />

<h1>{m.devlogTitle()}</h1>
<p class="intro">{m.devlogDescription()}</p>

{#each data.phases as [phase, entries] (phase)}
	<section aria-labelledby="phase-{phase}">
		<h2 id="phase-{phase}">
			{phase === undefined ? m.devlogOther() : m.devlogPhase({ phase: String(phase) })}
		</h2>
		<!-- The timeline: a line down the side, a dot for each entry. -->
		<ol class="timeline">
			{#each entries as entry (entry.slug)}
				<li>
					<TeaserCard {...entry} href={route('/devlog/[slug]', { slug: entry.slug })} />
				</li>
			{/each}
		</ol>
	</section>
{/each}

<style>
	.intro {
		margin-block-start: var(--size-2);
		color: var(--text-2);
	}

	section {
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
