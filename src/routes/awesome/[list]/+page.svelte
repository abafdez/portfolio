<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import AwesomeList from '#lib/awesome/AwesomeList.svelte';
	import TranslationStatus from '#lib/components/TranslationStatus.svelte';
	import { getLocale, languageTags, m } from '#lib/i18n/index.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { list, translated } = $derived(data);
	// Not translated yet: the list's own text is English, on a page in another language.
	const lang = $derived(translated ? undefined : languageTags.en);
</script>

<Seo
	title={list.title}
	section={m.awesomeTitle()}
	description={list.description}
	translated={data.translated}
/>

<!-- data-morph-*: where the list's card lands when it opens this page (morph.ts). -->
<header class="sheet" data-morph-page>
	<h1 {lang} data-morph="title">{list.title}</h1>
	<p {lang} data-morph="description">{list.description}</p>
	<p class="meta" data-morph="meta">
		{m.awesomeLinkCount({ count: list.count })} · {m.awesomeUpdated()}
		<time datetime={list.updated}>{list.updated}</time>
		<TranslationStatus locale={translated ? getLocale() : 'en'} />
	</p>
</header>

<!-- {#key}: going from one list to another reuses this page, and the filter (search,
     tags) would carry over. A new key makes a fresh component, which reads its own URL. -->
{#key list.slug}
	<AwesomeList {list} {lang} />
{/key}

<style>
	p {
		max-inline-size: var(--reading-width);
		margin-block-start: var(--size-2);
		color: var(--text-2);
	}

	.meta {
		font-family: var(--font-label);
		font-size: var(--font-size-0);
	}
</style>
