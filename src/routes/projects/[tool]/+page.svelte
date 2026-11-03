<script lang="ts">
	import TagList from '#lib/components/TagList.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { project, Tool } = $derived(data);
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
<Tool />

<style>
	p {
		max-inline-size: var(--reading-width);
		margin-block-start: var(--size-2);
		color: var(--text-2);
	}
</style>
