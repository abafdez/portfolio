<script lang="ts">
	// An icon from the skills data (IconData in skills.ts). A brand logo points at its
	// path in the logos.svg sprite with <use>, so no path is in the page's HTML, however
	// many times a logo is drawn. A Lucide icon is drawn from its elements, with
	// Lucide's own stroke style.
	import { resolve } from '$app/paths';
	import type { IconData } from './skills.ts';

	let { icon, size = '1em' }: { icon: IconData; size?: string } = $props();
</script>

<!-- aria-hidden: the name is always written next to it. -->
{#if 'logo' in icon}
	<svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
		<use href="{resolve('/logos.svg')}#{icon.logo}" />
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
		{#each icon.node as [tag, attributes], i (i)}
			<svelte:element this={tag} {...attributes} />
		{/each}
	</svg>
{/if}
