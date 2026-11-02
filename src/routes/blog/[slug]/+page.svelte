<script lang="ts">
	import ArticleHeader from '#lib/components/ArticleHeader.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { post, Body } = $derived(data);
</script>

<svelte:head>
	<title>{post.title} · Blog · AB</title>
	<meta name="description" content={post.description} />
</svelte:head>

<article>
	<ArticleHeader {...post} />
	<div class="prose"><Body /></div>
</article>
