<script lang="ts">
	import type { ResolvedPathname } from '$app/types';

	// The tags of a post or a Bitácora entry (TeaserCard, ArticleHeader).
	interface Props {
		tags: string[];
		// A tag's page, e.g. blogTag from links.ts. Without it the tags are plain text:
		// Bitácora tags have no pages.
		tagHref?: (tag: string) => ResolvedPathname;
	}

	let { tags, tagHref }: Props = $props();
</script>

<!-- The space above comes from the parent: <TagList --tags-space="var(--size-3)" />. -->
<ul aria-label="Tags">
	{#each tags as tag (tag)}
		<li>
			{#if tagHref}
				<a href={tagHref(tag)}>#{tag}</a>
			{:else}
				#{tag}
			{/if}
		</li>
	{/each}
</ul>

<style>
	ul {
		display: flex;
		flex-wrap: wrap;
		gap: var(--size-1) var(--size-3);
		margin-block-start: var(--tags-space, var(--size-2));
		padding: 0;
		list-style: none;
		font-family: var(--font-label);
		font-size: var(--font-size-0);
		color: var(--text-2);
	}

	/* At least 24px tall (WCAG's target size): small links in a list, not in a sentence,
	   so they need the room. */
	a {
		display: inline-block;
		padding-block: var(--size-1);
		text-decoration: none;

		&:is(:hover, :focus-visible) {
			text-decoration: underline;
		}
	}
</style>
