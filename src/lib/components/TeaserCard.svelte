<script module lang="ts">
	import type { ResolvedPathname } from '$app/types';
	import type { Picture } from '@sveltejs/enhanced-img';
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
		// A picture column, for blog posts (thumbnailOf() in covers.ts): the cover, or
		// without one a tile with the label.
		thumbnail?: { cover?: Picture; label: string };
	}
</script>

<script lang="ts">
	let { title, description, date, minutes, tags, href, tagHref, thumbnail }: Teaser = $props();
</script>

<article class:linked={href}>
	<div class="layout" class:with-thumbnail={thumbnail}>
		{#if thumbnail}
			<!-- Decorative here (empty alt, hidden tile): the title next to it already
			     says what the post is, and a screen reader would hear it twice. -->
			<div class="thumbnail">
				{#if thumbnail.cover}
					<!-- sizes: about 240px wide beside the text, the card's width on top of it
					     (see the container query). The browser picks the smallest copy. -->
					<enhanced:img
						src={thumbnail.cover}
						alt=""
						sizes="(min-width: 640px) 240px, 100vw"
						loading="lazy"
					/>
				{:else}
					<div class="tile" aria-hidden="true">{thumbnail.label}</div>
				{/if}
			</div>
		{/if}

		<div class="text">
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
		</div>
	</div>
</article>

<style>
	article {
		position: relative;
		/* The layout below asks how wide the card is, not the window: the same card
		   sits in one wide column on /blog and in a narrow grid on the home page. */
		container-type: inline-size;
		padding: var(--size-4);
		border: var(--border-size-1) solid var(--surface-3);
		border-radius: var(--radius-3);
		background: var(--surface-2);
		transition: border-color 0.2s;
	}

	/* The whole card is a link: the title's link stretches over it with ::after. One
	   link, so a screen reader still hears one title, and keyboard users tab once. */
	.linked h3 a::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
	}

	/* The tag links sit above the stretched link, so they stay clickable. */
	.linked :global([aria-label='Tags'] a) {
		position: relative;
		z-index: 1;
	}

	.linked:has(h3 a:hover) {
		border-color: var(--brand);
	}

	/* The focus ring goes around the card, which is what the link covers. */
	.linked:has(h3 a:focus-visible) {
		outline: var(--border-size-2) solid var(--brand);
		outline-offset: var(--border-size-2);

		& h3 a {
			outline: none;
		}
	}

	.layout.with-thumbnail {
		display: grid;
		gap: var(--size-3) var(--size-4);
	}

	.thumbnail {
		aspect-ratio: 16 / 9;
		overflow: clip;
		border-radius: var(--radius-2);
		background: var(--surface-3);

		/* enhanced:img makes a <picture> around an <img>: both fill the box, and the
		   image is cropped to 16:9 if it isn't. */
		& :global(:is(picture, img)) {
			inline-size: 100%;
			block-size: 100%;
		}

		& :global(img) {
			object-fit: cover;
		}
	}

	/* Above the text, a tile only needs to be a strip: it says no more than its tag. */
	.thumbnail:has(.tile) {
		aspect-ratio: 4 / 1;
	}

	/* Wide enough: the picture beside the text instead of above it, always 16:9. */
	@container (min-width: 34rem) {
		.layout.with-thumbnail {
			grid-template-columns: 15rem 1fr;
			align-items: start;
		}

		.thumbnail:has(.tile) {
			aspect-ratio: 16 / 9;
		}
	}

	@media (prefers-reduced-motion: no-preference) {
		.thumbnail :global(img) {
			transition: scale 0.3s var(--ease-out-3);
		}

		.linked:has(h3 a:hover) .thumbnail :global(img) {
			scale: 1.04;
		}
	}

	/* No cover yet: the blueprint grid with the post's first tag. */
	.tile {
		display: grid;
		place-items: center;
		block-size: 100%;
		padding: var(--size-3);
		background-image:
			linear-gradient(var(--grid-line-major) 1px, transparent 1px),
			linear-gradient(90deg, var(--grid-line-major) 1px, transparent 1px);
		background-size: var(--grid-size) var(--grid-size);
		background-position: center;
		font-family: var(--font-label);
		font-size: var(--font-size-3);
		color: var(--brand);
		text-align: center;
		overflow-wrap: anywhere;
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
