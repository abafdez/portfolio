<script module lang="ts">
	import type { ResolvedPathname } from '$app/types';
	import TagList from './TagList.svelte';

	// Exported so pages can type their lists: const posts: Teaser[] = [...]
	export interface Teaser {
		title: string;
		description?: string;
		// 'YYYY-MM-DD', shown as is: it fits the terminal look and needs no formatting.
		date?: string;
		// Reading time, shown next to the date.
		minutes?: number;
		tags?: string[];
		// Optional: a card can exist before its page does. Already resolved by the
		// caller (resolve('/bitacora/[slug]', { slug })), so the route and its params
		// are still type-checked there.
		href?: ResolvedPathname;
		// Links each tag to its page (see TagList).
		tagHref?: (tag: string) => ResolvedPathname;
	}
</script>

<script lang="ts">
	let { title, description, date, minutes, tags, href, tagHref }: Teaser = $props();
</script>

<article>
	{#if date}
		<div class="meta">
			<time datetime={date}>{date}</time>
			{#if minutes}· {minutes} min read{/if}
		</div>
	{/if}
	<h3>
		{#if href}
			<a {href}>{title}</a>
		{:else}
			{title}
		{/if}
	</h3>
	{#if description}
		<p>{description}</p>
	{/if}
	{#if tags?.length}
		<TagList {tags} {tagHref} --tags-space="var(--size-3)" />
	{/if}
</article>

<style>
	article {
		padding: var(--size-4);
		border: var(--border-size-1) solid var(--surface-3);
		border-radius: var(--radius-3);
		background: var(--surface-2);
	}

	.meta {
		font-family: var(--font-label);
		font-size: var(--font-size-0);
		color: var(--text-2);
	}

	h3 {
		font-size: var(--font-size-3);
	}

	.meta + h3 {
		margin-block-start: var(--size-1);
	}

	p {
		margin-block-start: var(--size-2);
		color: var(--text-2);
	}
</style>
