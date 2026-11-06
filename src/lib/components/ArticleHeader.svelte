<script lang="ts">
	import type { ResolvedPathname } from '$app/types';
	import type { Picture } from '@sveltejs/enhanced-img';
	import TagList from './TagList.svelte';

	// The top of a Bitácora entry or a blog post, from its frontmatter.
	interface Props {
		title: string;
		date: string;
		tags?: string[];
		description?: string;
		// Reading time, from content.ts.
		minutes?: number;
		// Only in dev: drafts don't exist in a build (see content.ts).
		draft?: boolean;
		// Links each tag to its page (see TagList).
		tagHref?: (tag: string) => ResolvedPathname;
		// A post's cover image (covers.ts) and its alt text, the frontmatter's cover:.
		coverImage?: Picture;
		cover?: string;
	}

	let { title, date, minutes, tags, description, draft, tagHref, coverImage, cover }: Props =
		$props();
</script>

<header>
	<time datetime={date}>{date}</time>
	{#if minutes}
		<span class="minutes">· {minutes} min read</span>
	{/if}
	{#if draft}
		<span class="draft">draft</span>
	{/if}
	<h1>{title}</h1>
	{#if description}
		<p class="description">{description}</p>
	{/if}
	{#if tags?.length}
		<TagList {tags} {tagHref} />
	{/if}
	{#if coverImage}
		<!-- Usually the biggest thing on the page (its LCP): fetchpriority high, never
		     lazy. sizes: the reading column (80ch, about 740px) or the screen's width. -->
		<enhanced:img
			class="cover"
			src={coverImage}
			alt={cover}
			sizes="(min-width: 800px) 740px, 100vw"
			fetchpriority="high"
		/>
	{/if}
</header>

<style>
	header {
		margin-block-end: var(--size-6);
	}

	time,
	.minutes,
	.draft {
		font-family: var(--font-label);
		font-size: var(--font-size-0);
		color: var(--text-2);
	}

	.draft {
		margin-inline-start: var(--size-2);
		padding-inline: var(--size-1);
		border: var(--border-size-1) solid currentColor;
		border-radius: var(--radius-2);
	}

	.cover {
		inline-size: 100%;
		block-size: auto;
		margin-block-start: var(--size-5);
		border: var(--border-size-1) solid var(--surface-3);
		border-radius: var(--radius-3);
	}

	.description {
		margin-block-start: var(--size-2);
		font-size: var(--font-size-3);
		color: var(--text-2);
	}
</style>
