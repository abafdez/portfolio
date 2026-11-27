<!--
	:::demo[A counter] … ::: in a post: a window around a live demo, its title in the bar,
	like the site's terminal windows. Inside goes a ```svelte run block (Pre.svelte draws
	the demo above its code) and any markdown that explains it.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let { label, children }: { label?: Snippet; children?: Snippet } = $props();
</script>

<section class="demo-frame">
	<p class="demo-title"><span class="demo-lights" aria-hidden="true"></span>{@render label?.()}</p>
	<div class="demo-body">{@render children?.()}</div>
</section>
