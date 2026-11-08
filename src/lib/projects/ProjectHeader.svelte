<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	// A tool page's title, description and tags, and its <title> and meta description.
	// Shared by /projects/[tool] and the tools with a route of their own (/projects/cv).
	import TagList from '#lib/components/TagList.svelte';
	import type { Project } from './projects.ts';
	import { m, text } from '#lib/i18n/index.ts';

	let { project }: { project: Project } = $props();
</script>

<Seo
	title={text(project.title)}
	section={m.projectsTitle()}
	description={text(project.description)}
/>

<!-- The page owns the heading; the tool is only the app, so it could live elsewhere too
     (inside a blog post, say). -->
<header>
	<h1>{text(project.title)}</h1>
	<p>{text(project.description)}</p>
	<TagList tags={project.tags} />
</header>

<style>
	p {
		max-inline-size: var(--reading-width);
		margin-block-start: var(--size-2);
		color: var(--text-2);
	}
</style>
