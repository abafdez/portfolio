<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import { m, route } from '#lib/i18n/index.ts';
	import TeaserCard from '#lib/components/TeaserCard.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<Seo title={m.awesomeTitle()} description={m.awesomeDescription()} />

<!-- On a sheet: the intro is body text (the grid is for headings). -->
<header class="sheet">
	<h1>{m.awesomeTitle()}</h1>
	<p class="intro">{m.awesomeDescription()}</p>
</header>

<section aria-labelledby="lists-title">
	<h2 id="lists-title">{m.awesomeLists()}</h2>
	<div class="grid">
		{#each data.lists as { slug, title, description, updated, locale } (slug)}
			<TeaserCard
				{title}
				{description}
				{locale}
				date={updated}
				href={route('/awesome/[list]', { list: slug })}
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
