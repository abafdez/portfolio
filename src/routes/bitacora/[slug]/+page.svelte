<script lang="ts">
	import ArticleHeader from '#lib/components/ArticleHeader.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { entry, Body } = $derived(data);
</script>

<svelte:head><title>{entry.title} · Bitácora · AB</title></svelte:head>

<article>
	<ArticleHeader {...entry} />
	<div class="prose"><Body /></div>
</article>
