<script lang="ts">
	import Cv from '#lib/projects/cv/Cv.svelte';
	import ProjectHeader from '#lib/projects/ProjectHeader.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<ProjectHeader project={data.project} />
<Cv skills={data.skills} />
