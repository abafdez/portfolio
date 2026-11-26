<script lang="ts">
	// A heading that links to itself (the markdown/Heading.svelte markup).
	import type { Snippet } from 'svelte';
	let { level, id, children }: { level: number; id?: string; children?: Snippet } = $props();
</script>

<svelte:element this={`h${level}`} {id}>
	{#if id}<a href="#{id}">{@render children?.()}</a>{:else}{@render children?.()}{/if}
</svelte:element>
