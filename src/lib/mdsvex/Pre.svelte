<script lang="ts">
	// A code block in our frame (markdown/CodeBlock.svelte): the language bar and the copy
	// button, around the <pre> mdsvex highlighted with twinkleplop (`children` is that
	// whole <pre>, not just what goes inside it).
	import type { Snippet } from 'svelte';
	import { fileLocale } from '#lib/i18n/locales.ts';
	import CodeBlock from '#lib/markdown/CodeBlock.svelte';

	let { lang, file, children }: { lang?: string; file: string; children?: Snippet } = $props();
</script>

<CodeBlock lang={lang || 'text'} locale={fileLocale(file)}>
	{@render children?.()}
</CodeBlock>
