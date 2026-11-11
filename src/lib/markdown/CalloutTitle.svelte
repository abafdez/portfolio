<script lang="ts">
	// A callout's title: its icon, then the type ("Tip") or its own title. With its own
	// title, the type is still read out first: "Warning: Not on GitHub Pages". In the
	// file's language, like GitHub's words for the types.
	// The text is one <span>: the title is a flex row (icon, text), and every part of
	// "Use `pnpm`" would be a flex item of its own, with a gap between them.
	import type { Snippet } from 'svelte';
	import { calloutTypes, type CalloutType } from '#lib/callouts.ts';
	import { fileLocale } from '#lib/i18n/locales.ts';

	interface Props {
		kind: CalloutType;
		custom: boolean;
		file: string;
		children?: Snippet;
	}

	let { kind, custom, file, children }: Props = $props();

	const { title, icon } = $derived(calloutTypes[kind]);
	const name = $derived(title[fileLocale(file)]);
</script>

<p class="callout-title">
	<!-- A Lucide icon, drawn in the title's colour. Screen readers read the title instead. -->
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
	>
		{#each icon as [tag, attributes], index (index)}
			<svelte:element this={tag} {...attributes} />
		{/each}
	</svg>
	<span>
		{#if custom}
			<span class="visually-hidden">{`${name}: `}</span>{@render children?.()}
		{:else}
			{name}
		{/if}
	</span>
</p>
