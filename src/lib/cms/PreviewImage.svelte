<script lang="ts">
	// A markdown image in the CMS preview. The build turns ./files into imports
	// (enhanced-img); here they come from Sveltia (getAsset), which the preview hands down
	// as a context (mdsvex.svelte.ts).
	import { getContext } from 'svelte';

	let { src, alt, title }: { src: string; alt: string; title?: string } = $props();
	const asset = getContext<(path: string) => string>('preview-asset');
</script>

<img src={asset(src)} {alt} {title} loading="lazy" />
