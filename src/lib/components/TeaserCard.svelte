<script module lang="ts">
	import type { ResolvedPathname } from '$app/types';
	import type { Cover } from '#lib/covers.ts';
	import TagList from './TagList.svelte';
	import PostStatus from './PostStatus.svelte';
	import TranslationStatus from './TranslationStatus.svelte';
	import type { Locale } from '#lib/i18n/locales.ts';

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
		// caller (resolve('/devlog/[slug]', { slug })), so the route and its params
		// are still type-checked there.
		href?: ResolvedPathname;
		// Links each tag to its page (see TagList).
		tagHref?: (tag: string) => ResolvedPathname;
		// A picture, for content with covers (thumbnailOf() in covers.ts): the cover, or
		// without one a tile with the label.
		thumbnail?: { cover?: Cover; label: string };
		// Blog posts: a draft or published badge, shown in dev only (PostStatus).
		status?: 'draft' | 'published';
		// The language of title and description (posts and entries: Entry.locale), when
		// it can differ from the page's, and whether a translation has been read.
		locale?: Locale;
		reviewed?: boolean;
		// The first card of a list, likely on screen as the page loads: its cover is the
		// page's largest picture (LCP), so it loads at once and first, not lazily.
		priority?: boolean;
	}
</script>

<script lang="ts">
	import { getLocale, languageTags, m } from '#lib/i18n/index.ts';
	let {
		title,
		description,
		date,
		minutes,
		tags,
		href,
		tagHref,
		thumbnail,
		status,
		locale,
		reviewed,
		priority = false
	}: Teaser = $props();

	// Text in another language than the page's says so, so screen readers read it with
	// the right voice (an English title on a Spanish page).
	const lang = $derived(locale && locale !== getLocale() ? languageTags[locale] : undefined);

	// The first card's cover: load it at once, and ahead of other images (an image's
	// default priority is low, so it waits behind fonts and scripts).
	const loading = $derived(priority ? 'eager' : 'lazy');
	const fetchpriority = $derived(priority ? 'high' : undefined);
</script>

<article class:linked={href}>
	<div class="layout" class:with-thumbnail={thumbnail}>
		{#if thumbnail}
			<!-- Decorative here (empty alt, hidden tile): the title next to it already
			     says what the post is, and a screen reader would hear it twice. -->
			<div class="thumbnail">
				{#if thumbnail.cover}
					<!-- Two crops: 16:9 on top of the text, square beside it. The container
					     query shows one; both are lazy, and a lazy image that isn't shown is
					     never downloaded (with priority, both load: the square is small).
					     sizes: the card's width (at most 34rem) on top,
					     12rem beside; the browser picks the smallest copy that's sharp. -->
					<div class="wide">
						<enhanced:img
							src={thumbnail.cover.picture}
							alt=""
							sizes="(min-width: 600px) 544px, 100vw"
							{loading}
							{fetchpriority}
						/>
					</div>
					<div class="square">
						<enhanced:img
							src={thumbnail.cover.square}
							alt=""
							sizes="192px"
							{loading}
							{fetchpriority}
						/>
					</div>
				{:else}
					<div class="tile" aria-hidden="true">{thumbnail.label}</div>
				{/if}
			</div>
		{/if}

		<div class="text">
			{#if date}
				<div class="meta">
					<time datetime={date}>{date}</time>
					{#if minutes}· {m.minutesRead({ minutes })}{/if}
					{#if status}<PostStatus {status} />{/if}
					<TranslationStatus {locale} {reviewed} />
				</div>
			{/if}
			<h3 {lang}>
				{#if href}
					<a {href}>{title}</a>
				{:else}
					{title}
				{/if}
			</h3>
			{#if description}
				<p {lang}>{description}</p>
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

	/* On top of the text: the 16:9 cover, or a short strip for a tile. */
	.thumbnail {
		aspect-ratio: 16 / 9;
		overflow: clip;
		border-radius: var(--radius-2);
		background: var(--surface-3);

		/* enhanced:img makes a <picture> around an <img>: all of them fill the box. */
		& > div,
		& :global(:is(picture, img)) {
			inline-size: 100%;
			block-size: 100%;
		}

		& :global(img) {
			object-fit: cover;
		}

		&:has(.tile) {
			aspect-ratio: 4 / 1;
		}
	}

	.square {
		display: none;
	}

	/* Wide enough: a square beside the text, centered on its height. The square is a
	   crop made at build time (covers.ts), and a tile is square too. */
	@container (min-width: 34rem) {
		.layout.with-thumbnail {
			grid-template-columns: 12rem 1fr;
			align-items: center;
		}

		.thumbnail,
		.thumbnail:has(.tile) {
			aspect-ratio: 1;
		}

		.wide {
			display: none;
		}

		.square {
			display: block;
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
