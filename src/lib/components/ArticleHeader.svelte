<script lang="ts">
	import { getLocale, languageTags, m } from '#lib/i18n/index.ts';
	import type { ResolvedPathname } from '$app/types';
	import type { Picture } from '@sveltejs/enhanced-img';
	import TagList from './TagList.svelte';
	import PostStatus from './PostStatus.svelte';
	import TranslationStatus from './TranslationStatus.svelte';
	import type { Locale } from '#lib/i18n/locales.ts';

	// The top of a Devlog entry or a blog post, from its frontmatter.
	interface Props {
		title: string;
		date: string;
		tags?: string[];
		description?: string;
		// Reading time, from content.ts.
		minutes?: number;
		// Blog posts: a draft or published badge, shown in dev only (PostStatus).
		status?: 'draft' | 'published';
		// Links each tag to its page (see TagList).
		tagHref?: (tag: string) => ResolvedPathname;
		// A post's cover image (covers.ts) and its alt text, the frontmatter's cover:.
		coverImage?: Picture;
		cover?: string;
		// The text's language and whether a translation has been read (see TeaserCard).
		locale?: Locale;
		reviewed?: boolean;
	}

	let {
		title,
		date,
		minutes,
		tags,
		description,
		status,
		tagHref,
		coverImage,
		cover,
		locale,
		reviewed
	}: Props = $props();

	// The title, description and cover alt in another language than the page's say so.
	const lang = $derived(locale && locale !== getLocale() ? languageTags[locale] : undefined);
</script>

<!-- data-morph-*: where a card's parts land when it opens this page (morph.ts). -->
<header data-morph-page>
	<div data-morph="meta">
		<time datetime={date}>{date}</time>
		{#if minutes}
			<span class="minutes">· {m.minutesRead({ minutes })}</span>
		{/if}
		{#if status}
			<PostStatus {status} />
		{/if}
		<TranslationStatus {locale} {reviewed} />
	</div>
	<h1 {lang} data-morph="title">{title}</h1>
	{#if description}
		<p class="description" {lang} data-morph="description">{description}</p>
	{/if}
	{#if tags?.length}
		<div data-morph="tags"><TagList {tags} {tagHref} /></div>
	{/if}
	{#if coverImage}
		<!-- Usually the biggest thing on the page (its LCP): fetchpriority high, never
		     lazy. sizes: the reading column (80ch, about 740px) or the screen's width. -->
		<enhanced:img
			class="cover"
			data-morph="picture"
			src={coverImage}
			alt={cover}
			{lang}
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
	.minutes {
		font-family: var(--font-label);
		font-size: var(--font-size-0);
		color: var(--text-2);
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
