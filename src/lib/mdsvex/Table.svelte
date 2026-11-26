<script lang="ts">
	// markdown/Table.svelte, with the file from the table plugin (plugins.ts).
	import type { Snippet } from 'svelte';
	import Table from '#lib/markdown/Table.svelte';
	let { file, children }: { file: string; children?: Snippet } = $props();
</script>

<Table {file}>{@render children?.()}</Table>
