<script lang="ts">
	// Whether a blog post is a draft or published, in dev only. A build has no drafts
	// (see content.ts), so there every post is published and the badge would say
	// nothing. `dev` is false in a build, so the badge isn't even in the HTML there.
	import { dev } from '$app/env';
	import FilePenLine from '@lucide/svelte/icons/file-pen-line';
	import Globe from '@lucide/svelte/icons/globe';

	let { status }: { status: 'draft' | 'published' } = $props();
</script>

{#if dev}
	<!-- The word says it; the icon only repeats it, so it's hidden from screen readers. -->
	<span class="status" data-status={status}>
		{#if status === 'draft'}
			<FilePenLine size="1em" aria-hidden="true" />
		{:else}
			<Globe size="1em" aria-hidden="true" />
		{/if}
		{status}
	</span>
{/if}

<style>
	.status {
		display: inline-flex;
		align-items: center;
		gap: 0.3em;
		padding-inline: var(--size-1);
		border: var(--border-size-1) solid currentColor;
		border-radius: var(--radius-2);
		font-family: var(--font-label);
		font-size: var(--font-size-0);
		vertical-align: middle;
	}

	/* A draft is unfinished: muted, with a dashed border. Published is the brand. */
	[data-status='draft'] {
		border-style: dashed;
		color: var(--text-2);
	}

	[data-status='published'] {
		color: var(--brand);
	}
</style>
