<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import ArticleHeader from '#lib/components/ArticleHeader.svelte';
	import { blogTag } from '#lib/links.ts';
	import { getLocale, languageTags, m } from '#lib/i18n/index.ts';
	import { copyCode } from '#lib/markdown/copy.ts';
	import { setMarkdownLocale } from '#lib/mdsvex/locale.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	// Links in the body go to pages in this page's language (mdsvex/Link.svelte).
	setMarkdownLocale(getLocale);
	let { post, body: Body, cover } = $derived(data);
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
<!-- data-pagefind-*: what search indexes, and its label (search.ts). -->
<article class="sheet" data-pagefind-body data-pagefind-meta="section:{m.navBlog()}">
	<ArticleHeader
		{...post}
		coverImage={cover?.picture}
		status={post.draft ? 'draft' : 'published'}
		tagHref={blogTag}
	/>
	<!-- The body, a component (+page.ts). {#key}: a new post is a new body, and copyCode
	     shows its copy buttons again. -->
	{#key post.path}
		<div class="prose" {lang} {@attach copyCode}><Body /></div>
	{/key}
</article>
