<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import ArticleHeader from '#lib/components/ArticleHeader.svelte';
	import { getLocale, languageTags, m } from '#lib/i18n/index.ts';
	import { devlogTag } from '#lib/links.ts';
	import { copyCode } from '#lib/markdown/copy.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { entry, html } = $derived(data);
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
<article class="sheet">
	<ArticleHeader {...entry} tagHref={devlogTag} />
	<!-- The body as HTML, made on the server (+page.server.ts). {#key}: new HTML, and
	     copyCode shows its copy buttons again. -->
	{#key html}
		<div class="prose" {lang} {@attach copyCode}>{@html html}</div>
	{/key}
</article>
