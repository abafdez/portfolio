<script lang="ts">
	// > [!tip] … as a box (a parse plugin marks the blockquote, mdsvex/plugins.ts; callouts.ts
	// has the types). Its first child is the title (CalloutTitle), then the text.
	import type { Snippet } from 'svelte';
	import type { CalloutType } from '#lib/callouts.ts';

	let { kind, children }: { kind: CalloutType; children?: Snippet } = $props();
</script>

<aside class="callout" data-callout={kind}>{@render children?.()}</aside>
