<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="bitacora">{@render children()}</div>

<style>
	/* Everything inside inherits the handwritten font through the tokens. */
	.bitacora {
		--font-body: var(--font-hand);
		font-family: var(--font-body);
	}
</style>
