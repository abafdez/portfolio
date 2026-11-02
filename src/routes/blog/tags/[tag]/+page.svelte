<script lang="ts">
	import { resolve } from '$app/paths';
	import TeaserCard from '#lib/components/TeaserCard.svelte';
	import { blogTag } from '#lib/links.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { tag, count, years } = $derived(data);
</script>

<svelte:head><title>#{tag} · Blog · AB</title></svelte:head>

<a class="back" href={resolve('/blog')}>← All posts</a>
<h1>#{tag}</h1>
<p class="intro">{count} {count === 1 ? 'post' : 'posts'} with this tag.</p>

{#each years as [year, posts] (year)}
	<section aria-labelledby="year-{year}">
		<h2 id="year-{year}">{year}</h2>
		<div class="posts">
			{#each posts as post (post.slug)}
				<TeaserCard
					{...post}
					href={resolve('/blog/[slug]', { slug: post.slug })}
					tagHref={blogTag}
				/>
			{/each}
		</div>
	</section>
{/each}

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

	section {
		margin-block-start: var(--size-7);
	}

	.posts {
		display: grid;
		gap: var(--size-4);
		margin-block-start: var(--size-3);
	}
</style>
