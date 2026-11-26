<!--
	The CMS's icon picker (field type "lucide"): search Lucide's icons by name and pick one
	from a grid of the real icons. Stores the name as written on lucide.dev ('sparkles'),
	which glyph.server.ts turns into the icon at build time. A Svelte component inside
	Sveltia, which only renders React: icon.svelte.ts mounts it from a small React wrapper.
	The names come from the package's files (virtual:lucide-names), the drawings from the
	package itself, loaded only when a picker is shown.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import names from 'virtual:lucide-names';
	import Glyph from '#lib/components/Glyph.svelte';
	import type { Glyph as GlyphData } from '#lib/glyph.ts';

	interface Props {
		id: string;
		value?: string;
		onchange: (value: string) => void;
	}
	let { id, value, onchange }: Props = $props();

	// How many icons the grid shows at once: enough to browse, few enough to stay quick.
	const shown = 96;

	type Node = [string, Record<string, string>][];
	let icons = $state<Record<string, Node>>();
	let query = $state('');

	onMount(async () => {
		const { icons: all } = await import('lucide');
		icons = all as unknown as Record<string, Node>;
	});

	// 'arrow-up-right' → 'ArrowUpRight', the key in the package (as in glyph.server.ts).
	const pascal = (name: string) =>
		name.replace(/(^|-)(\w)/g, (_, __, letter: string) => letter.toUpperCase());
	const glyphOf = (name: string): GlyphData | undefined => {
		const node = icons?.[pascal(name)];
		return node ? { node } : undefined;
	};

	// Every word typed must be in the name: "arrow up" finds arrow-up-right.
	const matches = $derived.by(() => {
		const words = query
			.toLowerCase()
			.split(/[\s-]+/)
			.filter(Boolean);
		return words.length
			? names.filter((name) => words.every((word) => name.includes(word)))
			: names;
	});

	const current = $derived(value ? glyphOf(value) : undefined);
</script>

<div class="picker">
	<div class="current">
		<span class="preview" aria-hidden="true">
			{#if current}<Glyph glyph={current} size="2rem" />{/if}
		</span>
		<span class="name">
			{#if value}
				{value}{#if icons && !current}<em> · not a Lucide icon</em>{/if}
			{:else}
				No icon
			{/if}
		</span>
		{#if value}
			<button type="button" class="clear" onclick={() => onchange('')}>Clear</button>
		{/if}
	</div>

	<label class="search">
		<span class="visually-hidden">Search icons</span>
		<input
			{id}
			type="search"
			placeholder="Search {names.length} icons, e.g. code, arrow up, star"
			bind:value={query}
		/>
	</label>

	{#if icons}
		<p class="count" role="status">
			{matches.length === names.length
				? `${names.length} icons`
				: `${matches.length} ${matches.length === 1 ? 'icon' : 'icons'}`}{matches.length > shown
				? `, the first ${shown} shown: type more to narrow it down`
				: ''}
		</p>
		<ul class="grid">
			{#each matches.slice(0, shown) as name (name)}
				{@const glyph = glyphOf(name)}
				<li>
					<button
						type="button"
						title={name}
						aria-label={name}
						aria-pressed={name === value}
						onclick={() => onchange(name)}
					>
						{#if glyph}<Glyph {glyph} size="1.5rem" />{/if}
					</button>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="count">Loading the icons…</p>
	{/if}
</div>

<style>
	.picker {
		display: grid;
		gap: 0.5rem;
	}

	.current {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.preview {
		display: grid;
		place-items: center;
		inline-size: 3rem;
		block-size: 3rem;
		border: 1px solid #8888;
		border-radius: 6px;
	}

	.name {
		font-family: monospace;
	}

	.name em {
		font-style: normal;
		color: #c33;
	}

	.clear {
		margin-inline-start: auto;
	}

	input {
		inline-size: 100%;
		box-sizing: border-box;
		padding: 0.4rem 0.6rem;
		border: 1px solid #8888;
		border-radius: 4px;
		background: transparent;
		color: inherit;
		font: inherit;
	}

	.count {
		margin: 0;
		font-size: 0.85em;
		opacity: 0.8;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(2.75rem, 1fr));
		gap: 0.25rem;
		max-block-size: 16rem;
		margin: 0;
		padding: 0;
		overflow-y: auto;
		list-style: none;
	}

	.grid button {
		display: grid;
		place-items: center;
		inline-size: 100%;
		aspect-ratio: 1;
		padding: 0;
		border: 1px solid transparent;
		border-radius: 6px;
		background: none;
		color: inherit;
		cursor: pointer;

		&:hover {
			border-color: #8888;
		}

		&[aria-pressed='true'] {
			border-color: currentColor;
			background: #8883;
		}
	}

	button:focus-visible,
	input:focus-visible {
		outline: 2px solid currentColor;
		outline-offset: 2px;
	}

	.visually-hidden {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
</style>
