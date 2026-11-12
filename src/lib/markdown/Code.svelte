<script lang="ts">
	// A fenced code block. One named after one of our blocks (```video, ```yt; their
	// fields and checks are in blocks.ts) is drawn by its component; any other is code,
	// highlighted by Shiki (its languages were loaded before rendering, render.server.ts).
	import { readBlock } from '#lib/blocks.ts';
	import type { Locale } from '#lib/i18n/locales.ts';
	import { highlight, languageOf, type Highlighter } from './shiki.ts';
	import type { Media } from './media.ts';
	import CodeBlock from './CodeBlock.svelte';
	import { components } from './blocks/index.ts';

	interface Props {
		lang?: string;
		text: string;
		file: string;
		locale: Locale;
		highlighter: Highlighter;
		media: Media;
	}

	let { lang, text, file, locale, highlighter, media }: Props = $props();

	const block = $derived(readBlock(lang, text, file));
	const Block = $derived(block && components[block.name]);
</script>

{#if block && Block}
	<Block {...block.values} {file} {media} />
{:else}
	<CodeBlock lang={languageOf(highlighter, lang)} {locale}>
		{@html highlight(highlighter, text, lang)}
	</CodeBlock>
{/if}
