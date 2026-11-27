<!--
	One panel of a :::compare. Its label is the heading that started it (still a heading,
	with its id and self-link), its children what followed, up to the next heading.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let { label, children }: { label?: Snippet; children?: Snippet } = $props();
</script>

<section class="compare-side">
	{@render label?.()}
	{@render children?.()}
</section>
