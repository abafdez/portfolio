<!--
	:kbd[Ctrl+B] in a post: one keycap per key, nested <kbd>s as the HTML spec writes a key
	combination. directives-plugin.ts passes the bracket text as `keys`; the + between keys
	stays text, so a screen reader and a copy read "Ctrl+B".
-->
<script lang="ts">
	import { splitKeys } from './keys.ts';

	let { keys }: { keys: string } = $props();

	const parts = $derived(splitKeys(keys));
</script>

<kbd class="keys"
	>{#each parts as key, index (index)}{#if index > 0}+{/if}<kbd>{key}</kbd>{/each}</kbd
>
