<script lang="ts">
	import { m } from '#lib/i18n/index.ts';
	import ProjectHeader from '#lib/projects/ProjectHeader.svelte';
	import ToolWindow from '#lib/projects/toolbox/ToolWindow.svelte';
	import { tools } from '#lib/projects/toolbox/tools.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<ProjectHeader project={data.project} />

<!-- Only the list loads here: each tool's code downloads on its own page. The windows'
     titles are h3s, so the section has an h2 (headings don't skip levels). -->
<section aria-labelledby="tools-title">
	<h2 id="tools-title" class="visually-hidden">{m.projectsTools()}</h2>
	<div class="grid">
		{#each tools as tool (tool.slug)}
			<ToolWindow {tool} />
		{/each}
	</div>
</section>

<style>
	section {
		margin-block-start: var(--size-7);
	}

	/* As many 18rem columns as fit. */
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 18rem), 1fr));
		gap: var(--size-4);
	}
</style>
