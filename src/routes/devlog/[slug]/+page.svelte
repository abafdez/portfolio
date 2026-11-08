<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import ArticleHeader from '#lib/components/ArticleHeader.svelte';
	import { getLocale, languageTags, m } from '#lib/i18n/index.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { entry, Body } = $derived(data);
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

<article>
	<ArticleHeader {...entry} />
	<div class="prose" {lang}><Body /></div>
</article>
