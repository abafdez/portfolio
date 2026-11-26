<script lang="ts">
	// ```video, drawn by markdown/blocks/Video.svelte with the post's files from the page.
	import VideoBlock from '#lib/markdown/blocks/Video.svelte';
	import { markdownMedia } from '../context.ts';

	interface Props {
		src: string;
		webm?: string;
		poster?: string;
		width: string;
		height: string;
		caption?: string;
		file: string;
	}
	let { width, height, ...props }: Props = $props();
	const media = markdownMedia();
</script>

<VideoBlock {...props} width={Number(width)} height={Number(height)} media={media()} />
