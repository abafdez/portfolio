<script lang="ts">
	import { resolve } from '$app/paths';
	import TeaserCard from '#lib/components/TeaserCard.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head><title>Awesome · AB</title></svelte:head>

<h1>Awesome</h1>
<p class="intro">Curated lists of links I keep going back to, each one searchable by tag.</p>

<section aria-labelledby="lists-title">
	<h2 id="lists-title">Lists</h2>
	<div class="grid">
		{#each data.lists as { slug, title, description, updated } (slug)}
			<TeaserCard
				{title}
				{description}
				date={updated}
				href={resolve('/awesome/[list]', { list: slug })}
			/>
		{/each}
	</div>
</section>

<style>
	.intro {
		margin-block-start: var(--size-2);
		color: var(--text-2);
	}

	section {
		margin-block-start: var(--size-7);
	}

	/* Same grid as /projects: as many 16rem columns as fit. */
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
		gap: var(--size-4);
		margin-block-start: var(--size-3);
	}
</style>
