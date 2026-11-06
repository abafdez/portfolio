<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import AwesomeList from '#lib/awesome/AwesomeList.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { list } = $derived(data);
</script>

<Seo title={list.title} section="Awesome" description={list.description} />

<header>
	<h1>{list.title}</h1>
	<p>{list.description}</p>
	<p class="meta">
		{list.count} links · updated <time datetime={list.updated}>{list.updated}</time>
	</p>
</header>

<!-- {#key}: going from one list to another reuses this page, and the filter (search,
     tags) would carry over. A new key makes a fresh component, which reads its own URL. -->
{#key list.slug}
	<AwesomeList {list} />
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
