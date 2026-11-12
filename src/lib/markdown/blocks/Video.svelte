<script lang="ts">
	// ```video: a short screen recording. No sound, no autoplay, the reader presses play;
	// why each attribute is in content/blog/published/README.md. The same markup as
	// blocks.ts's render(), which the CMS's editor components use.
	import { videoType } from '#lib/blocks.ts';
	import type { Media } from '../media.ts';

	interface Props {
		src: string; // MP4 plays everywhere
		webm?: string; // smaller; played first when the browser can
		poster?: string;
		width: number; // its space is kept before the file arrives: the page doesn't jump
		height: number;
		caption?: string; // a video has no alt text: say what it shows
		file: string;
		media: Media;
	}

	let { src, webm, poster, width, height, caption, file, media }: Props = $props();

	const sources = $derived([webm, src].filter((source) => source !== undefined));
</script>

{#snippet video()}
	<video
		{width}
		{height}
		controls
		muted
		playsinline
		preload="metadata"
		poster={poster && media.url(file, poster)}
	>
		{#each sources as source (source)}
			<source src={media.url(file, source)} type={videoType(source)} />
		{/each}
	</video>
{/snippet}

{#if caption}
	<figure>
		{@render video()}
		<figcaption>{caption}</figcaption>
	</figure>
{:else}
	{@render video()}
{/if}
