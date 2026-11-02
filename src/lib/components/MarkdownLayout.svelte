<script module lang="ts">
	// mdsvex wraps every .md file in this layout (see markdown() in vite.config.ts).
	// Each component exported here replaces that element in the markdown: every link
	// in a post or an entry is rendered by MarkdownLink instead of a plain <a>.
	// CodeBlock isn't an element name, so it replaces nothing: highlight() uses it by
	// name, as Components.CodeBlock (mdsvex imports this file as * as Components).
	import a from './MarkdownLink.svelte';
	import CodeBlock from './CodeBlock.svelte';

	export { a, CodeBlock };
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	// mdsvex passes the frontmatter as props too, but the [slug] pages already show it
	// (ArticleHeader), so the layout only renders the content.
	let { children }: { children: Snippet } = $props();
</script>

{@render children()}
