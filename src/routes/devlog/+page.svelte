<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import TagColumns from '#lib/components/TagColumns.svelte';
	import Timeline from '#lib/components/Timeline.svelte';
	import { devlogTag } from '#lib/links.ts';
	import { m } from '#lib/i18n/index.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<Seo title={m.devlogTitle()} description={m.devlogDescription()} />

<h1>{m.devlogTitle()}</h1>
<p class="intro">{m.devlogDescription()}</p>

<TagColumns tags={data.tags} href={devlogTag} countLabel={(count) => m.tagEntryCount({ count })}>
	<Timeline phases={data.phases} />
</TagColumns>

<style>
	.intro {
		margin-block-start: var(--size-2);
		color: var(--text-2);
	}
</style>
