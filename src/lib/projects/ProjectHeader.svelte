<script lang="ts">
	// A tool page's title, description and tags, and its <title> and meta description.
	// Shared by /projects/[tool] and the tools with a route of their own (/projects/cv).
	import TagList from '#lib/components/TagList.svelte';
	import type { Project } from './projects.ts';

	let { project }: { project: Project } = $props();
</script>

<svelte:head>
	<title>{project.title} · Projects · AB</title>
	<meta name="description" content={project.description} />
</svelte:head>

<!-- The page owns the heading; the tool is only the app, so it could live elsewhere too
     (inside a blog post, say). -->
<header>
	<h1>{project.title}</h1>
	<p>{project.description}</p>
	<TagList tags={project.tags} />
</header>

<style>
	p {
		max-inline-size: var(--reading-width);
		margin-block-start: var(--size-2);
		color: var(--text-2);
	}
</style>
