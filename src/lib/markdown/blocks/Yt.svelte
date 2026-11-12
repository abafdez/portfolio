<script lang="ts">
	// ```yt: a YouTube video without YouTube on the page, as a link that opens it on
	// youtube.com in a new tab (why: blocks.ts). The same markup as blocks.ts's render().
	import { watchOnYoutube, youtubeUrl } from '#lib/blocks.ts';
	import { fileLocale } from '#lib/i18n/locales.ts';
	import type { Media } from '../media.ts';

	interface Props {
		src: string;
		title: string; // the link's text: what the reader is about to open
		thumbnail?: string; // a file next to the post: a picture from Google is a request to Google
		caption?: string;
		file: string;
		media: Media;
	}

	let { src, title, thumbnail, caption, file, media }: Props = $props();
</script>

<figure class="yt">
	<a href={youtubeUrl(src)} target="_blank" rel="external noopener noreferrer">
		<span class="yt-picture">
			<!-- alt="": the title next to it is the link's name. -->
			{#if thumbnail}
				<enhanced:img src={media.picture(file, thumbnail)} alt="" loading="lazy" />
			{/if}
			<!-- A play sign (drawn here, not YouTube's logo, which is theirs). -->
			<svg class="yt-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6.5v11l9-5.5z" /></svg
			>
		</span>
		<span class="yt-title">{title}</span>
		<span class="yt-where">{watchOnYoutube[fileLocale(file)]}</span>
	</a>
	{#if caption}<figcaption>{caption}</figcaption>{/if}
</figure>
