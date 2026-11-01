<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { entry, Body } = $derived(data);
</script>

<svelte:head><title>{entry.title} · Bitácora · AB</title></svelte:head>

<article>
	<header>
		<time datetime={entry.date}>{entry.date}</time>
		<h1>{entry.title}</h1>
		{#if entry.tags?.length}
			<ul class="tags" aria-label="Tags">
				{#each entry.tags as tag (tag)}
					<li>#{tag}</li>
				{/each}
			</ul>
		{/if}
	</header>
	<div class="prose"><Body /></div>
</article>

<style>
	header {
		margin-block-end: var(--size-6);
	}

	time,
	.tags {
		font-family: var(--font-label);
		font-size: var(--font-size-0);
		color: var(--text-2);
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--size-1) var(--size-3);
		margin-block-start: var(--size-2);
		padding: 0;
		list-style: none;
	}
</style>
