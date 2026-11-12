<script lang="ts">
	// ![alt](./x.png "Caption") alone in a paragraph: the image and its caption. It takes
	// the paragraph's place (parse.ts), since a <figure> can't go inside a <p>.
	import type { Snippet } from 'svelte';

	let { caption, children }: { caption: string; children?: Snippet } = $props();
</script>

<figure>
	{@render children?.()}
	<figcaption>{caption}</figcaption>
</figure>
