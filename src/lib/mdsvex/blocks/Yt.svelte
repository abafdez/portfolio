<script lang="ts">
	// ```yt, drawn by markdown/blocks/Yt.svelte with the post's files from the page.
	import YtBlock from '#lib/markdown/blocks/Yt.svelte';
	import { markdownMedia } from '../context.ts';

	interface Props {
		src: string;
		title: string;
		thumbnail?: string;
		caption?: string;
		file: string;
	}
	let props: Props = $props();
	const media = markdownMedia();
</script>

<YtBlock {...props} media={media()} />
