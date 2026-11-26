<script lang="ts">
	// A markdown image in the CMS preview. The build turns ./files into imports
	// (enhanced-img); here they come from Sveltia (getAsset), as the media the preview
	// hands down (mdsvex/context.ts).
	import { markdownMedia } from '#lib/mdsvex/context.ts';

	let { src, alt, title }: { src: string; alt: string; title?: string } = $props();
	const media = markdownMedia();
</script>

<img src={media().url('', src)} {alt} {title} loading="lazy" />
