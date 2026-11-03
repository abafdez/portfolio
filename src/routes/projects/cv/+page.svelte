<script lang="ts">
	import Cv from '#lib/projects/cv/Cv.svelte';
	import ProjectHeader from '#lib/projects/ProjectHeader.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<!-- Not on paper: only the CV prints. -->
<div class="screen-only"><ProjectHeader project={data.project} /></div>
<Cv skills={data.skills} />

<style>
	@media print {
		.screen-only {
			display: none;
		}
	}
</style>
