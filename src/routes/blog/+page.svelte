<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import TagCloud from '#lib/components/TagCloud.svelte';
	import TeaserCard from '#lib/components/TeaserCard.svelte';
	import { thumbnailOf } from '#lib/covers.ts';
	import { blogTag } from '#lib/links.ts';
	import { m, route } from '#lib/i18n/index.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<Seo title={m.blogTitle()} description={m.blogDescription()} />

<h1>{m.blogTitle()}</h1>
<p class="intro">{m.blogDescription()}</p>

<!-- Two columns on wide screens: the posts, and the tags beside them. The tags come
     first in the HTML, so on a phone they're above the posts, folded to a few rows. -->
<div class="columns">
	{#if data.tags.length}
		<nav aria-labelledby="tags-title">
			<h2 id="tags-title">{m.blogTagsTitle()}</h2>
			<TagCloud tags={data.tags} href={blogTag} />
		</nav>
	{/if}

	<div class="years">
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
	</div>
</div>

<style>
	.intro {
		margin-block-start: var(--size-2);
		color: var(--text-2);
	}

	.columns {
		display: grid;
		gap: var(--size-7);
		margin-block-start: var(--size-7);
	}

	/* Side by side once there's room for a post card with its thumbnail beside it
	   (TeaserCard switches at 34rem) and the tags. The tags go to the second column
	   even though they come first in the HTML. */
	@media (width >= 60rem) {
		.columns {
			grid-template-columns: minmax(0, 1fr) 18rem;
			gap: var(--size-8);
		}

		/* The column is narrow but tall: more rows before the fade. */
		nav {
			--tag-rows: 9;
			grid-column: 2;
			grid-row: 1;
		}
	}

	/* A small label, not a big title: it names the sidebar. */
	nav h2 {
		margin-block-end: var(--size-3);
		font-family: var(--font-label);
		font-size: var(--font-size-0);
		font-weight: 600;
		letter-spacing: var(--font-letterspacing-3);
		text-transform: uppercase;
		color: var(--brand);
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
