<!--
	:::details[Summary] … ::: in a post: a native <details>, closed unless (open=true).
	Find in page opens it when the match is inside. The summary is required
	(directives-plugin.ts fails the build without one).
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let { label, open, children }: { label: Snippet; open?: string; children?: Snippet } = $props();
</script>

<details class="details" open={open === 'true'}>
	<summary>{@render label()}</summary>
	<div class="details-body">{@render children?.()}</div>
</details>
