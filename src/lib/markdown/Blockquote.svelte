<script lang="ts">
	// A blockquote. One the callout plugin marked (plugins.ts) is our callout
	// (markdown/Callout + CalloutTitle); any other stays a quote.
	import type { Snippet } from 'svelte';
	import type { CalloutType } from '#lib/callouts.ts';
	import Callout from '#lib/markdown/Callout.svelte';
	import CalloutTitle from '#lib/markdown/CalloutTitle.svelte';

	interface Props {
		kind?: CalloutType;
		title?: string;
		file?: string;
		children?: Snippet;
	}
	let { kind, title = '', file = '', children }: Props = $props();
</script>

{#if kind}
	<Callout {kind}>
		<CalloutTitle {kind} custom={title !== ''} {file}>{title}</CalloutTitle>
		{@render children?.()}
	</Callout>
{:else}
	<blockquote>{@render children?.()}</blockquote>
{/if}
