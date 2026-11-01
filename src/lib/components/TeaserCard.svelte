<script module lang="ts">
	import type { ResolvedPathname } from '$app/types';

	// Exported so pages can type their lists: const posts: Teaser[] = [...]
	export interface Teaser {
		title: string;
		description?: string;
		// 'YYYY-MM-DD', shown as is: it fits the terminal look and needs no formatting.
		date?: string;
		tags?: string[];
		// Optional: a card can exist before its page does. Already resolved by the
		// caller (resolve('/bitacora/[slug]', { slug })), so the route and its params
		// are still type-checked there.
		href?: ResolvedPathname;
	}
</script>

<script lang="ts">
	let { title, description, date, tags, href }: Teaser = $props();
</script>

<article>
	{#if date}
		<time datetime={date}>{date}</time>
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
		<ul class="tags" aria-label="Tags">
			{#each tags as tag (tag)}
				<li>#{tag}</li>
			{/each}
		</ul>
	{/if}
</article>

<style>
	article {
		padding: var(--size-4);
		border: var(--border-size-1) solid var(--surface-3);
		border-radius: var(--radius-3);
		background: var(--surface-2);
	}

	time,
	.tags {
		font-family: var(--font-label);
		font-size: var(--font-size-0);
		color: var(--text-2);
	}

	h3 {
		font-size: var(--font-size-3);
	}

	time + h3 {
		margin-block-start: var(--size-1);
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--size-1) var(--size-3);
		margin-block-start: var(--size-3);
		padding: 0;
		list-style: none;
	}

	p {
		margin-block-start: var(--size-2);
		color: var(--text-2);
	}
</style>
