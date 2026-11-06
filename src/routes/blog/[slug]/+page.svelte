<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import ArticleHeader from '#lib/components/ArticleHeader.svelte';
	import { blogTag } from '#lib/links.ts';
	import { coverOf } from '#lib/covers.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { post, Body } = $derived(data);
	const cover = $derived(coverOf(post.folder));
</script>

<Seo
	title={post.title}
	section="Blog"
	description={post.description}
	published={post.date}
	image={cover && post.cover ? { src: cover.preview, alt: post.cover } : undefined}
/>

<article>
	<ArticleHeader {...post} coverImage={cover?.picture} tagHref={blogTag} />
	<div class="prose"><Body /></div>
</article>
