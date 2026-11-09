<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import { m, route, text } from '#lib/i18n/index.ts';
	import TeaserCard from '#lib/components/TeaserCard.svelte';
	import { projects } from '#lib/projects/projects.ts';
</script>

<Seo title={m.projectsTitle()} description={m.projectsDescription()} />

<!-- On a sheet: the intro is body text (the grid is for headings). -->
<header class="sheet">
	<h1>{m.projectsTitle()}</h1>
	<p class="intro">{m.projectsDescription()}</p>
</header>

<!-- Only the list is imported here: each tool's code loads on its own page.
     The cards' titles are h3s, so the section has an h2 (headings don't skip levels). -->
<section aria-labelledby="tools-title">
	<h2 id="tools-title">{m.projectsTools()}</h2>
	<div class="grid">
		{#each projects as { slug, title, description, date, tags } (slug)}
			<TeaserCard
				title={text(title)}
				description={text(description)}
				{date}
				{tags}
				href={route('/projects/[tool]', { tool: slug })}
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

	/* Same grid as the landing's: as many 16rem columns as fit. */
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
		gap: var(--size-4);
		margin-block-start: var(--size-3);
	}
</style>
