<script lang="ts">
	import type { ResolvedPathname } from '$app/types';
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
	}

	let { title, date, minutes, tags, description, draft, tagHref }: Props = $props();
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

	.description {
		margin-block-start: var(--size-2);
		font-size: var(--font-size-3);
		color: var(--text-2);
	}
</style>
