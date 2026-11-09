<script lang="ts">
	// Copies a tool's output, like the copy button on code blocks (CodeBlock.svelte):
	// shown only once JS runs and the browser can copy, and the result is announced.
	import { onMount } from 'svelte';
	import { m } from '#lib/i18n/index.ts';

	interface Props {
		value: string;
		// What it copies, for its accessible name: "Copy Base64". The visible text is
		// "copy", which that name starts with (a voice user can say what they see).
		what: string;
	}

	let { value, what }: Props = $props();

	let canCopy = $state(false);
	let status = $state('');
	let timer: ReturnType<typeof setTimeout>;

	onMount(() => {
		canCopy = 'clipboard' in navigator;
		return () => clearTimeout(timer);
	});

	async function copy() {
		try {
			await navigator.clipboard.writeText(value);
			status = m.codeCopied();
		} catch {
			status = m.codeCopyFailed();
		}
		clearTimeout(timer);
		timer = setTimeout(() => (status = ''), 2000);
	}
</script>

{#if canCopy}
	<span class="copy">
		<!-- role="status": screen readers announce the text when it changes. -->
		<span role="status">{status}</span>
		<button type="button" aria-label={m.toolboxCopy({ what })} disabled={!value} onclick={copy}>
			{m.codeCopy()}
		</button>
	</span>
{/if}

<style>
	.copy {
		display: inline-flex;
		align-items: center;
		gap: var(--size-2);
		font-family: var(--font-label);
		font-size: var(--font-size-0);
		color: var(--text-2);
	}

	button {
		padding: var(--size-1) var(--size-2);
		border: var(--border-size-1) solid var(--surface-3);
		border-radius: var(--radius-2);
		background: var(--surface-2);
		color: var(--text-1);
		font: inherit;
		cursor: pointer;

		&:hover:not(:disabled) {
			border-color: var(--brand);
		}

		&:disabled {
			cursor: not-allowed;
			color: var(--text-2);
		}
	}
</style>
