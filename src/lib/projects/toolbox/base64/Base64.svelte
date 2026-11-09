<script lang="ts">
	// Base64 in two parts: text ↔ Base64 (as UTF-8), and a file → data URL.
	// The logic is in base64.ts (tested); this is the form around it.
	import { onMount } from 'svelte';
	import FileUp from '@lucide/svelte/icons/file-up';
	import { formatNumber, m } from '#lib/i18n/index.ts';
	import CopyButton from '../CopyButton.svelte';
	import { cssBackground, decodeText, encodeText, maxFileSize, readAsDataUrl } from './base64.ts';

	// Unique ids for labels and descriptions, the same on the server and the client.
	const id = $props.id();

	// Every part needs JS: disabled until it runs (a form that does nothing is worse
	// than one that says it can't).
	let ready = $state(false);
	onMount(() => (ready = true));

	// --- Text ---
	type Mode = 'encode' | 'decode';
	let mode = $state<Mode>('encode');
	let urlSafe = $state(false);
	let input = $state('');

	const result = $derived(
		mode === 'encode' ? { ok: true as const, text: encodeText(input, urlSafe) } : decodeText(input)
	);
	const output = $derived(result.ok ? result.text : '');
	const problem = $derived(
		result.ok ? '' : result.problem === 'base64' ? m.base64NotBase64() : m.base64NotText()
	);

	// Switching direction takes the output along as the new input: encode "ñ", switch
	// to Decode, and "ñ" comes back.
	function switchTo(next: Mode) {
		if (result.ok) input = output;
		mode = next;
	}

	// --- File ---
	type Picked =
		| { name: string; size: number; dataUrl: string; image: boolean }
		| { name: string; problem: string };
	let picked = $state<Picked>();
	let dragging = $state(false);
	// Two files picked quickly: only the last one's result counts.
	let reads = 0;

	const size = (bytes: number) =>
		bytes < 1024
			? `${formatNumber(bytes, 0)} B`
			: bytes < 1024 * 1024
				? `${formatNumber(bytes / 1024, 1)} KB`
				: `${formatNumber(bytes / 1024 / 1024, 1)} MB`;
	// "2 MB", not "2.0 MB": a limit is a round number.
	const max = $derived(`${formatNumber(maxFileSize / 1024 / 1024, 0)} MB`);

	// One handler for both ways in: clicking opens the file picker, and a file dropped
	// on the input lands in it too (browsers do that for file inputs, no drop code).
	async function pick(event: Event & { currentTarget: HTMLInputElement }) {
		dragging = false;
		const file = event.currentTarget.files?.[0];
		if (!file) return;
		const read = ++reads;
		if (file.size > maxFileSize) {
			picked = { name: file.name, problem: m.base64TooBig({ name: file.name, max }) };
			return;
		}
		try {
			const dataUrl = await readAsDataUrl(file);
			if (read !== reads) return;
			picked = {
				name: file.name,
				size: file.size,
				dataUrl,
				image: file.type.startsWith('image/')
			};
		} catch {
			if (read === reads)
				picked = { name: file.name, problem: m.base64ReadFailed({ name: file.name }) };
		}
	}
</script>

<p class="needs-js">{m.toolboxNeedsJs()}</p>

<section class="sheet" aria-labelledby="{id}-text">
	<h2 id="{id}-text">{m.base64TextTitle()}</h2>
	<fieldset class="options" disabled={!ready}>
		<legend class="visually-hidden">{m.base64Mode()}</legend>
		{#each ['encode', 'decode'] as const as value (value)}
			<label>
				<input
					type="radio"
					name="{id}-mode"
					{value}
					checked={mode === value}
					onchange={() => switchTo(value)}
				/>
				{value === 'encode' ? m.base64Encode() : m.base64Decode()}
			</label>
		{/each}
		{#if mode === 'encode'}
			<label><input type="checkbox" bind:checked={urlSafe} /> {m.base64UrlSafe()}</label>
		{/if}
	</fieldset>

	<div class="fields">
		<div class="field">
			<!-- In a row like the outputs' (which have a copy button), so both labels line up. -->
			<div class="label-row">
				<label for="{id}-input">{mode === 'encode' ? m.base64Text() : m.base64Base64()}</label>
			</div>
			<textarea
				id="{id}-input"
				rows="6"
				spellcheck="false"
				disabled={!ready}
				aria-invalid={!!problem}
				aria-describedby="{id}-problem"
				bind:value={input}></textarea>
		</div>
		{@render out(`${id}-output`, mode === 'encode' ? m.base64Base64() : m.base64Text(), output)}
	</div>
	<p id="{id}-problem" class="problem" role="status">{problem}</p>
</section>

<section class="sheet" aria-labelledby="{id}-file">
	<h2 id="{id}-file">{m.base64FileTitle()}</h2>
	<label class="drop" class:dragging class:disabled={!ready}>
		<input
			type="file"
			disabled={!ready}
			onchange={pick}
			ondragenter={() => (dragging = true)}
			ondragleave={() => (dragging = false)}
			ondrop={() => (dragging = false)}
		/>
		<FileUp aria-hidden="true" />
		<span>{m.base64Drop({ max })}</span>
	</label>

	<div role="status">
		{#if picked && 'problem' in picked}
			<p class="problem">{picked.problem}</p>
		{:else if picked}
			<p class="size">
				{m.base64FileSize({
					name: picked.name,
					size: size(picked.size),
					encoded: size(picked.dataUrl.length)
				})}
			</p>
		{/if}
	</div>

	{#if picked && 'dataUrl' in picked}
		{#if picked.image}
			<img class="preview" src={picked.dataUrl} alt={m.base64Preview(picked)} />
		{/if}
		<div class="fields">
			{@render out(`${id}-data-url`, m.base64DataUrl(), picked.dataUrl)}
			{@render out(`${id}-css`, m.base64Css(), cssBackground(picked.dataUrl))}
		</div>
	{/if}
</section>

<!-- An output: its label, a copy button, and the text, read-only (selectable, and a
     screen reader can read it, unlike a disabled field). -->
{#snippet out(fieldId: string, label: string, value: string)}
	<div class="field">
		<div class="label-row">
			<label for={fieldId}>{label}</label>
			<CopyButton {value} what={label} />
		</div>
		<textarea id={fieldId} rows="6" readonly spellcheck="false" {value}></textarea>
	</div>
{/snippet}

<style>
	section {
		margin-block-start: var(--size-7);
	}

	.needs-js {
		display: none;
		margin-block-start: var(--size-5);
		color: var(--text-2);

		@media (scripting: none) {
			display: block;
		}
	}

	.options {
		display: flex;
		flex-wrap: wrap;
		gap: var(--size-2) var(--size-5);
		margin-block-start: var(--size-3);
		padding: 0;
		border: none;
		font-family: var(--font-label);
		font-size: var(--font-size-1);

		& label {
			display: inline-flex;
			align-items: center;
			gap: var(--size-2);
			cursor: pointer;
		}

		& input {
			accent-color: var(--brand);
		}
	}

	/* Input and output side by side when there's room, stacked when not. */
	.fields {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr));
		gap: var(--size-4);
		margin-block-start: var(--size-4);
	}

	.field {
		display: grid;
		gap: var(--size-2);
		align-content: start;
	}

	.label-row {
		min-block-size: 2rem;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: var(--size-2);
	}

	label {
		font-family: var(--font-label);
		font-size: var(--font-size-1);
	}

	textarea {
		inline-size: 100%;
		padding: var(--size-2) var(--size-3);
		border: var(--border-size-1) solid var(--surface-3);
		border-radius: var(--radius-2);
		background: var(--surface-2);
		color: var(--text-1);
		font-family: var(--font-code);
		font-size: var(--font-size-1);
		resize: vertical;
		tab-size: 2;
		/* Base64 is one long word: break it anywhere, never scroll sideways. */
		overflow-wrap: anywhere;

		&[aria-invalid='true'] {
			border-color: var(--error);
		}

		&:focus-visible {
			outline: var(--border-size-2) solid var(--brand);
			outline-offset: 1px;
		}
	}

	.problem {
		margin-block-start: var(--size-2);
		color: var(--error);

		&:empty {
			display: none;
		}
	}

	/* The drop zone is a label with the file input stretched over it, invisible: a
	   click opens the picker and a dropped file lands in the input, both natively. */
	.drop {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--size-3);
		margin-block-start: var(--size-3);
		padding: var(--size-6) var(--size-4);
		border: var(--border-size-2) dashed var(--surface-3);
		border-radius: var(--radius-3);
		background: var(--surface-2);
		color: var(--text-2);
		text-align: center;
		cursor: pointer;

		& :global(svg) {
			flex-shrink: 0;
		}

		& input {
			position: absolute;
			inset: 0;
			opacity: 0;
			cursor: inherit;
		}

		&:hover,
		&.dragging {
			border-color: var(--brand);
			color: var(--text-1);
		}

		&:has(input:focus-visible) {
			outline: var(--border-size-2) solid var(--brand);
			outline-offset: var(--border-size-2);
		}

		&.disabled {
			cursor: not-allowed;
		}
	}

	.size {
		margin-block-start: var(--size-3);
		font-family: var(--font-label);
		font-size: var(--font-size-1);
		color: var(--text-2);
	}

	.preview {
		display: block;
		max-inline-size: 100%;
		max-block-size: 10rem;
		margin-block-start: var(--size-3);
		border-radius: var(--radius-2);
		background: var(--surface-2);
	}
</style>
