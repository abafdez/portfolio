<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import ArticleHeader from '#lib/components/ArticleHeader.svelte';
	import { blogTag } from '#lib/links.ts';
	import { coverPreviews, covers } from '#lib/covers.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { post, Body } = $derived(data);
	const preview = $derived(coverPreviews[post.slug]);
</script>

<Seo
	title={post.title}
	section="Blog"
	description={post.description}
	published={post.date}
	image={preview && post.cover ? { src: preview, alt: post.cover } : undefined}
/>

<article>
	<ArticleHeader {...post} coverImage={covers[post.slug]} tagHref={blogTag} />
	<div class="prose"><Body /></div>
</article>
