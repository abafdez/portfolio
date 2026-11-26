<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import ArticleHeader from '#lib/components/ArticleHeader.svelte';
	import { getLocale, languageTags, m } from '#lib/i18n/index.ts';
	import { devlogTag } from '#lib/links.ts';
	import { copyCode } from '#lib/markdown/copy.ts';
	import { setMarkdownLocale } from '#lib/mdsvex/locale.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	// Links in the body go to pages in this page's language (mdsvex/Link.svelte).
	setMarkdownLocale(getLocale);
	let { entry, body: Body } = $derived(data);
	// An English entry on a Spanish page (not translated yet): the body says it's English.
	const lang = $derived(entry.locale !== getLocale() ? languageTags[entry.locale] : undefined);
</script>

<Seo
	title={entry.title}
	section={m.devlogTitle()}
	description={entry.description}
	published={entry.date}
	translated={data.translated}
/>

<!-- The whole article on a sheet: long text never runs over the grid. -->
<!-- data-pagefind-*: what search indexes, and its label (search.ts). -->
<article class="sheet" data-pagefind-body data-pagefind-meta="section:{m.navDevlog()}">
	<ArticleHeader {...entry} tagHref={devlogTag} />
	<!-- The body, a component (+page.ts). {#key}: a new entry is a new body, and copyCode
	     shows its copy buttons again. -->
	{#key entry.path}
		<div class="prose" {lang} {@attach copyCode}><Body /></div>
	{/key}
</article>
