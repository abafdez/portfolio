<script lang="ts">
	import ProjectHeader from '#lib/projects/ProjectHeader.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { tool, Tool } = $derived(data);
</script>

<ProjectHeader project={tool} />
<Tool />
