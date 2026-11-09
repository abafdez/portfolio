<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import TagColumns from '#lib/components/TagColumns.svelte';
	import TeaserCard from '#lib/components/TeaserCard.svelte';
	import { thumbnailOf } from '#lib/covers.ts';
	import { blogTag } from '#lib/links.ts';
	import { m, route } from '#lib/i18n/index.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<Seo title={m.blogTitle()} description={m.blogDescription()} />

<!-- On a sheet: the intro is body text (the grid is for headings). -->
<header class="sheet">
	<h1>{m.blogTitle()}</h1>
	<p class="intro">{m.blogDescription()}</p>
</header>

<TagColumns tags={data.tags} href={blogTag} countLabel={(count) => m.tagPostCount({ count })}>
	{#each data.years as [year, posts], y (year)}
		<section aria-labelledby="year-{year}">
			<h2 id="year-{year}">{year}</h2>
			<div class="posts">
				{#each posts as post, i (post.slug)}
					<TeaserCard
						{...post}
						href={route('/blog/[slug]', { slug: post.slug })}
						thumbnail={thumbnailOf(post)}
						status={post.draft ? 'draft' : 'published'}
						tagHref={blogTag}
						priority={y === 0 && i === 0}
					/>
				{/each}
			</div>
		</section>
	{:else}
		<p class="intro">{m.blogEmpty()}</p>
	{/each}
</TagColumns>

<style>
	.intro {
		margin-block-start: var(--size-2);
		color: var(--text-2);
	}

	section + section {
		margin-block-start: var(--size-7);
	}

	.posts {
		display: grid;
		gap: var(--size-4);
		margin-block-start: var(--size-3);
	}
</style>
