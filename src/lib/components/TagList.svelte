<script lang="ts">
	import { m } from '#lib/i18n/index.ts';
	import type { ResolvedPathname } from '$app/types';

	// The tags of a post, a Devlog entry or an Awesome link (TeaserCard, ArticleHeader,
	// AwesomeList).
	interface Props {
		tags: string[];
		// Where a tag leads: its page (blogTag or devlogTag from links.ts), or this page
		// filtered by it ('?tag=css', an Awesome list). Without it the tags are plain text
		// (a project's tags: there's no page of projects by tag).
		tagHref?: (tag: string) => ResolvedPathname | `?${string}`;
		// Runs on click instead of following the link, e.g. to filter without a
		// navigation. The link still works when opened in a new tab.
		onTag?: (tag: string, event: MouseEvent) => void;
	}

	let { tags, tagHref, onTag }: Props = $props();
</script>

<!-- The space above comes from the parent: <TagList --tags-space="var(--size-3)" />. -->
<ul aria-label={m.tagsLabel()}>
	{#each tags as tag (tag)}
		<li>
			{#if tagHref}
				<a href={tagHref(tag)} onclick={onTag && ((event) => onTag(tag, event))}>#{tag}</a>
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
