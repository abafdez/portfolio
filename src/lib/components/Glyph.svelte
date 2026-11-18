<script lang="ts">
	// Draws a Glyph (glyph.ts): a Lucide icon with Lucide's stroke style, or a filled
	// brand logo. Decoration: whatever it stands for is written next to it.
	import type { Glyph } from '#lib/glyph.ts';

	let { glyph, size = '1em' }: { glyph: Glyph; size?: string } = $props();
</script>

{#if 'path' in glyph}
	<svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
		<path d={glyph.path} />
	</svg>
{:else}
	<svg
		viewBox="0 0 24 24"
		width={size}
		height={size}
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
	>
		<!-- Inside an <svg>, Svelte creates these as SVG elements. -->
		{#each glyph.node as [tag, attributes], i (i)}
			<svelte:element this={tag} {...attributes} />
		{/each}
	</svg>
{/if}
