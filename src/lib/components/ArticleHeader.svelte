<script lang="ts">
	// The top of a Bitácora entry or a blog post, from its frontmatter.
	interface Props {
		title: string;
		date: string;
		tags?: string[];
		description?: string;
		// Only in dev: drafts don't exist in a build (see content.ts).
		draft?: boolean;
	}

	let { title, date, tags, description, draft }: Props = $props();
</script>

<header>
	<time datetime={date}>{date}</time>
	{#if draft}
		<span class="draft">draft</span>
	{/if}
	<h1>{title}</h1>
	{#if description}
		<p class="description">{description}</p>
	{/if}
	{#if tags?.length}
		<ul class="tags" aria-label="Tags">
			{#each tags as tag (tag)}
				<li>#{tag}</li>
			{/each}
		</ul>
	{/if}
</header>

<style>
	header {
		margin-block-end: var(--size-6);
	}

	time,
	.draft,
	.tags {
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

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--size-1) var(--size-3);
		margin-block-start: var(--size-2);
		padding: 0;
		list-style: none;
	}
</style>
