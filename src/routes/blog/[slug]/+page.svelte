<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import ArticleHeader from '#lib/components/ArticleHeader.svelte';
	import { blogTag } from '#lib/links.ts';
	import { getLocale, languageTags, m } from '#lib/i18n/index.ts';
	import { coverOf } from '#lib/covers.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { post, Body } = $derived(data);
	const cover = $derived(coverOf(post.folder));
	// An English post on a Spanish page (not translated yet): the body says it's English.
	const lang = $derived(post.locale !== getLocale() ? languageTags[post.locale] : undefined);
</script>

<Seo
	title={post.title}
	section={m.navBlog()}
	description={post.description}
	published={post.date}
	translated={data.translated}
	image={cover && post.cover ? { src: cover.preview, alt: post.cover } : undefined}
/>

<!-- The whole article on a sheet: long text never runs over the grid. -->
<article class="sheet">
	<ArticleHeader
		{...post}
		coverImage={cover?.picture}
		status={post.draft ? 'draft' : 'published'}
		tagHref={blogTag}
	/>
	<div class="prose" {lang}><Body /></div>
</article>
