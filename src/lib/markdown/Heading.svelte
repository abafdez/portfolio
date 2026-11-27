<script lang="ts">
	// A heading that links to itself. mdsvex gives the id (heading_ids, github-slugger's
	// ids; a repeat gets -1). The text is the link, so the heading's name stays its text;
	// a # shows on hover and focus (global.css, .prose).
	import type { Snippet } from 'svelte';
	let { level, id, children }: { level: number; id?: string; children?: Snippet } = $props();
</script>

<svelte:element this={`h${level}`} {id}>
	{#if id}<a href="#{id}">{@render children?.()}</a>{:else}{@render children?.()}{/if}
</svelte:element>
