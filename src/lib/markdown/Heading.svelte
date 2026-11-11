<script lang="ts">
	// ## The base path -> <h2 id="the-base-path"><a href="#the-base-path">The base path</a></h2>
	// svelte-markdown makes the id (github-slugger, the same ids rehype-slug made; a repeated
	// one gets -1). The text links to its own heading, so any section can be linked to; as
	// the whole text, the heading's name stays "The base path" for screen readers. The
	// prerender crawler checks #links against these ids.
	import type { Snippet } from 'svelte';

	let { depth, id, children }: { depth: number; id?: string; children?: Snippet } = $props();
</script>

<svelte:element this={`h${depth}`} {id}>
	{#if id}<a href="#{id}">{@render children?.()}</a>{:else}{@render children?.()}{/if}
</svelte:element>
