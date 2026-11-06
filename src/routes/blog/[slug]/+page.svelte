<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import ArticleHeader from '#lib/components/ArticleHeader.svelte';
	import { blogTag } from '#lib/links.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { post, Body } = $derived(data);
</script>

<Seo title={post.title} section="Blog" description={post.description} published={post.date} />

<article>
	<ArticleHeader {...post} tagHref={blogTag} />
	<div class="prose"><Body /></div>
</article>
