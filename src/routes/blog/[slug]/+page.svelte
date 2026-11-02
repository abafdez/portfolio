<script lang="ts">
	import ArticleHeader from '#lib/components/ArticleHeader.svelte';
	import { blogTag } from '#lib/links.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { post, Body } = $derived(data);
</script>

<svelte:head>
	<title>{post.title} · Blog · AB</title>
	<meta name="description" content={post.description} />
</svelte:head>

<article>
	<ArticleHeader {...post} tagHref={blogTag} />
	<div class="prose"><Body /></div>
</article>
