<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ResolvedPathname } from '$app/types';
	import TagCloud from './TagCloud.svelte';
	import { m } from '#lib/i18n/index.ts';

	// A section's list (the blog's posts, the Devlog's timeline) with its tags beside it:
	// two columns on wide screens. The tags come first in the HTML, so on a phone they're
	// above the list, folded to a few rows.
	// The page needs the 'default' composition: 'reading' is too narrow for two columns.
	interface Props {
		tags: { tag: string; count: number; hue: number }[];
		href: (tag: string) => ResolvedPathname;
		countLabel: (count: number) => string;
		children: Snippet;
	}

	let { tags, href, countLabel, children }: Props = $props();
	const id = $props.id();
</script>

<div class="columns">
	{#if tags.length}
		<nav class="sheet" aria-labelledby="{id}-title">
			<h2 id="{id}-title">{m.tagsBrowse()}</h2>
			<TagCloud {tags} {href} {countLabel} />
		</nav>
	{/if}

	<div>{@render children()}</div>
</div>

<style>
	.columns {
		display: grid;
		gap: var(--size-7);
		margin-block-start: var(--size-7);
		height: auto;
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
			align-self: start;
		}
	}

	/* A small label, not a big title: it names the sidebar. */
	h2 {
		margin-block-end: var(--size-3);
		font-family: var(--font-label);
		font-size: var(--font-size-0);
		font-weight: 600;
		letter-spacing: var(--font-letterspacing-3);
		text-transform: uppercase;
		color: var(--brand);
	}
</style>
