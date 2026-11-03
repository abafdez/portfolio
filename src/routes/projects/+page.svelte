<script lang="ts">
	import { resolve } from '$app/paths';
	import TeaserCard from '#lib/components/TeaserCard.svelte';
	import { projects } from '#lib/projects/projects.ts';
</script>

<svelte:head><title>Projects · AB</title></svelte:head>

<h1>Projects</h1>
<p class="intro">Small tools, each one a self-contained app.</p>

<!-- Only the list is imported here: each tool's code loads on its own page.
     The cards' titles are h3s, so the section has an h2 (headings don't skip levels). -->
<section aria-labelledby="tools-title">
	<h2 id="tools-title">Tools</h2>
	<div class="grid">
		{#each projects as { slug, title, description, date, tags } (slug)}
			<TeaserCard
				{title}
				{description}
				{date}
				{tags}
				href={resolve('/projects/[tool]', { tool: slug })}
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
