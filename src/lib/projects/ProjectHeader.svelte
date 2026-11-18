<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	// A tool page's title, description and tags, and its <title> and meta description.
	// Shared by /projects/[tool] and the tools with a route of their own (/projects/cv).
	import TagList from '#lib/components/TagList.svelte';
	import type { Project } from './projects.ts';
	import { m, text } from '#lib/i18n/index.ts';
	import { sourceUrl } from '#lib/links.ts';

	let { project }: { project: Project } = $props();
</script>

<Seo
	title={text(project.title)}
	section={m.projectsTitle()}
	description={text(project.description)}
/>

<!-- The page owns the heading; the tool is only the app, so it could live elsewhere too
     (inside a blog post, say). -->
<!-- data-morph-*: where a project's card lands when it opens this page (morph.ts). -->
<!-- data-pagefind-*: search indexes the header, not the tool (search.ts). -->
<header
	class="sheet"
	data-morph-page
	data-pagefind-body
	data-pagefind-meta="section:{m.projectsTitle()}"
>
	<h1 data-morph="title">{text(project.title)}</h1>
	<p data-morph="description">{text(project.description)}</p>
	<div data-morph="tags"><TagList tags={project.tags} /></div>
	{#if project.source}
		<p class="source"><a href={sourceUrl(project.source)} rel="external">{m.projectSource()}</a></p>
	{/if}
</header>

<style>
	p {
		max-inline-size: var(--reading-width);
		margin-block-start: var(--size-2);
		color: var(--text-2);
	}

	.source {
		margin-block-start: var(--size-3);
		font-size: var(--font-size-0);
	}
</style>
