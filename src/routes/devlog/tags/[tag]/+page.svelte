<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import Timeline from '#lib/components/Timeline.svelte';
	import { m, route } from '#lib/i18n/index.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { tag, count, phases } = $derived(data);
</script>

<Seo title="#{tag}" section={m.navDevlog()} description={m.devlogTagDescription({ tag })} />

<a class="back" href={route('/devlog')}>{m.devlogAllEntries()}</a>
<h1>#{tag}</h1>
<p class="intro">{m.devlogTagIntro({ count })}</p>

<div class="entries"><Timeline {phases} /></div>

<style>
	.back {
		font-family: var(--font-label);
		font-size: var(--font-size-0);
	}

	h1 {
		margin-block-start: var(--size-3);
	}

	.intro {
		margin-block-start: var(--size-2);
		color: var(--text-2);
	}

	.entries {
		margin-block-start: var(--size-7);
	}
</style>
