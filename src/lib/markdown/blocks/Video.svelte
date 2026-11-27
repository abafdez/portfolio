<script lang="ts">
	// ::video: a short screen recording. No sound, no autoplay, the reader presses play;
	// why each attribute is in content/blog/posts/README.md. The blocks plugin
	// (../blocks-plugin.ts) gives the arguments as props, all strings, and the text in
	// brackets as `label`, the caption; the files come from the page (context.ts).
	import type { Snippet } from 'svelte';
	import { videoType } from './values.ts';
	import { markdownMedia } from '../context.ts';

	interface Props {
		src: string; // MP4 plays everywhere
		webm?: string; // smaller; played first when the browser can
		poster?: string;
		width: string; // its space is kept before the file arrives: the page doesn't jump
		height: string;
		label?: Snippet; // the caption: a video has no alt text, so say what it shows
		file: string;
	}

	let { src, webm, poster, width, height, label, file }: Props = $props();
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

{#if label}
	<figure>
		{@render video()}
		<figcaption>{@render label()}</figcaption>
	</figure>
{:else}
	{@render video()}
{/if}
