<script lang="ts">
	// ```video: a short screen recording. No sound, no autoplay, the reader presses play;
	// why each attribute is in content/blog/posts/README.md. The same markup as
	// blocks.ts's render(), which the CMS's editor components use. The blocks plugin
	// (../blocks-plugin.ts) gives the fields as props, all strings; the files come from the
	// page (context.ts).
	import { videoType } from '#lib/blocks.ts';
	import { markdownMedia } from '../context.ts';

	interface Props {
		src: string; // MP4 plays everywhere
		webm?: string; // smaller; played first when the browser can
		poster?: string;
		width: string; // its space is kept before the file arrives: the page doesn't jump
		height: string;
		caption?: string; // a video has no alt text: say what it shows
		file: string;
	}

	let { src, webm, poster, width, height, caption, file }: Props = $props();
	const files = markdownMedia();
	const media = $derived(files());

	const sources = $derived([webm, src].filter((source) => source !== undefined));
</script>

{#snippet video()}
	<video
		width={Number(width)}
		height={Number(height)}
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
