<script lang="ts">
	// ![What it shows](./diagram.png): an image next to the post, as <picture> with AVIF and
	// WebP copies at its size (enhanced-img). parse.ts has already checked it has alt text
	// and is next to the post.
	// A title (the caption) on an image alone in its paragraph makes a figure (parse.ts);
	// anywhere else it stays a title.
	import type { Media } from './media.ts';

	interface Props {
		href?: string;
		title?: string | null;
		text?: string;
		file: string;
		media: Media;
	}

	let { href = '', title, text = '', file, media }: Props = $props();
</script>

<enhanced:img
	src={media.picture(file, href)}
	alt={text}
	title={title ?? undefined}
	loading="lazy"
/>
