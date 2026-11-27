<!--
	:::compare … ::: in a post: panels side by side, one per heading written directly
	inside (directives-plugin.ts makes each a compare-side), stacked when there's no room.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children?: Snippet } = $props();
</script>

<div class="compare">{@render children?.()}</div>
