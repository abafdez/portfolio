<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import { resolve } from '$app/paths';
	import TeaserCard from '#lib/components/TeaserCard.svelte';
	import { blogTag } from '#lib/links.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<Seo title="Blog" description="Longer articles about what I learn building this site." />

<h1>Blog</h1>
<p class="intro">Longer articles about what I learn building this site.</p>

{#if data.tags.length}
	<nav aria-label="Tags">
		<ul>
			{#each data.tags as { tag, count } (tag)}
				<li><a href={blogTag(tag)}>#{tag}</a> <span class="count">{count}</span></li>
			{/each}
		</ul>
	</nav>
{/if}

{#each data.years as [year, posts] (year)}
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
{:else}
	<p class="intro">No posts yet. The first ones are on their way.</p>
{/each}

<style>
	.intro {
		margin-block-start: var(--size-2);
		color: var(--text-2);
	}

	nav ul {
		display: flex;
		flex-wrap: wrap;
		gap: var(--size-1) var(--size-4);
		margin-block-start: var(--size-5);
		padding: 0;
		list-style: none;
		font-family: var(--font-label);
		font-size: var(--font-size-0);
		color: var(--text-2);
	}

	/* At least 24px tall, like the tags in TagList. */
	nav a {
		display: inline-block;
		padding-block: var(--size-1);
		text-decoration: none;

		&:is(:hover, :focus-visible) {
			text-decoration: underline;
		}
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
