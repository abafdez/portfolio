<script lang="ts">
	// ::yt: a YouTube video without YouTube on the page, as a link that opens it on
	// youtube.com in a new tab (why: blocks.ts). The text in brackets is `label`, the
	// title; the thumbnail comes from the page (context.ts).
	import type { Snippet } from 'svelte';
	import { watchOnYoutube, youtubeUrl } from './values.ts';
	import { fileLocale } from '#lib/i18n/locales.ts';
	import { markdownMedia } from '../context.ts';

	interface Props {
		src: string;
		label: Snippet; // the title, the link's text: what the reader is about to open
		thumbnail?: string; // a file next to the post: a picture from Google is a request to Google
		caption?: string;
		file: string;
	}

	let { src, label, thumbnail, caption, file }: Props = $props();
	const files = markdownMedia();
	const media = $derived(files());
	// A thumbnail the post names is always there (the build checks it); the one the build
	// fetches from YouTube may not be: then the card is just the row.
	const picture = $derived(thumbnail && media.has(file, thumbnail) ? thumbnail : undefined);
</script>

<!-- Compact: the picture (if any) beside the row on a wide column, above it on a narrow
     one; the row is the play sign, then the title and where it opens. -->
<figure class="yt">
	<a href={youtubeUrl(src)} target="_blank" rel="external noopener noreferrer">
		{#if picture}
			<!-- alt="": the title next to it is the link's name. -->
			<span class="yt-picture">
				<enhanced:img src={media.picture(file, picture)} alt="" loading="lazy" />
			</span>
		{/if}
		<span class="yt-row">
			<!-- A play sign (drawn here, not YouTube's logo, which is theirs). -->
			<svg class="yt-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6.5v11l9-5.5z" /></svg
			>
			<span class="yt-text">
				<span class="yt-title">{@render label()}</span>
				<span class="yt-where">{watchOnYoutube[fileLocale(file)]}</span>
			</span>
		</span>
	</a>
	{#if caption}<figcaption>{caption}</figcaption>{/if}
</figure>
