<script lang="ts">
	// A fenced code block. One named after one of our blocks (```video, ```yt; their
	// fields and checks are in blocks.ts) is drawn by its component; any other is code,
	// highlighted by twinkleplop (highlight.ts).
	import { readBlock } from '#lib/blocks.ts';
	import type { Locale } from '#lib/i18n/locales.ts';
	import { highlight, languageOf } from './highlight.ts';
	import type { Media } from './media.ts';
	import CodeBlock from './CodeBlock.svelte';
	import { components } from './blocks/index.ts';

	interface Props {
		lang?: string;
		text: string;
		file: string;
		locale: Locale;
		media: Media;
	}

	let { lang, text, file, locale, media }: Props = $props();

	const block = $derived(readBlock(lang, text, file));
	const Block = $derived(block && components[block.name]);
</script>

{#if block && Block}
	<Block {...block.values} {file} {media} />
{:else}
	<CodeBlock lang={languageOf(lang)} {locale}>
		{@html highlight(text, lang)}
	</CodeBlock>
{/if}
