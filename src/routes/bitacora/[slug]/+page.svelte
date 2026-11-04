<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import ArticleHeader from '#lib/components/ArticleHeader.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { entry, Body } = $derived(data);
</script>

<Seo
	title={entry.title}
	section="Bitácora"
	description={entry.description}
	published={entry.date}
/>

<article>
	<ArticleHeader {...entry} />
	<div class="prose"><Body /></div>
</article>
