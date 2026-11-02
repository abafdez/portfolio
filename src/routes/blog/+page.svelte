<script lang="ts">
	import { resolve } from '$app/paths';
	import TeaserCard from '#lib/components/TeaserCard.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head><title>Blog · AB</title></svelte:head>

<h1>Blog</h1>
<p class="intro">Longer articles about what I learn building this site.</p>

{#each data.years as [year, posts] (year)}
	<section aria-labelledby="year-{year}">
		<h2 id="year-{year}">{year}</h2>
		<div class="posts">
			{#each posts as post (post.slug)}
				<TeaserCard {...post} href={resolve('/blog/[slug]', { slug: post.slug })} />
			{/each}
		</div>
	</section>
{:else}
	<p class="intro">No posts yet. The first ones are on their way.</p>
{/each}

<style>
	.intro {
		margin-block-start: var(--size-2);
		color: var(--text-2);
	}

	section {
		margin-block-start: var(--size-7);
	}

	.posts {
		display: grid;
		gap: var(--size-4);
		margin-block-start: var(--size-3);
	}
</style>
