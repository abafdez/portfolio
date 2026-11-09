<script lang="ts">
	// HTML symbols: pick a group or search, pick a symbol, copy it in the form you need
	// (the character, its HTML name or number, a CSS or JS escape, its UTF-8 bytes).
	// The data and logic are in symbols.ts (tested); this is the page around them.
	import { onMount, tick } from 'svelte';
	import X from '@lucide/svelte/icons/x';
	import { m, text } from '#lib/i18n/index.ts';
	import CopyButton from '../CopyButton.svelte';
	import ToolCredits from '../ToolCredits.svelte';
	import { credits } from './credits.ts';
	import { blockIcons, blockNames } from './names.ts';
	import { blocks, forms, label, search, symbols, type Character } from './symbols.ts';

	const id = $props.id();

	let ready = $state(false);
	onMount(() => (ready = true));

	// 'named' or a block's index. Arrows to start: a small, recognisable group, so the
	// prerendered page stays light (the named group has over 1,400).
	let group = $state<'named' | number>(blocks.findIndex((b) => b.name === 'Arrows'));
	let query = $state('');
	let selected = $state<Character>();
	// With nothing picked, the card shows the symbol under the pointer or the keyboard
	// focus (wide screens: on narrow ones the card only opens once a symbol is picked).
	let hovered = $state<Character>();
	const current = $derived(selected ?? hovered);

	// The icons and the list both pick a group, and picking one ends a search.
	type Group = 'named' | number;
	function pick(next: Group) {
		group = next;
		query = '';
	}
	const groups: { value: Group; name: string; icon: string }[] = $derived([
		{ value: 'named', name: m.symbolsNamed(), icon: '&' },
		...blocks.map((block, i) => ({
			value: i,
			name: text(blockNames[block.name]),
			icon: blockIcons[block.name]
		}))
	]);

	// A search looks in every group; the cap keeps a one-letter search from drawing
	// hundreds of buttons. A group shows all of its own (the named one, 1,431).
	const cap = 300;
	const inGroup = $derived(
		group === 'named'
			? symbols.filter((s) => s.entities.length)
			: symbols.filter((s) => s.block === group)
	);
	const found = $derived(query.trim() ? search(query) : inGroup);
	const searching = $derived(!!query.trim());
	const shown = $derived(searching ? found.slice(0, cap) : found);
	const detail = $derived(current && forms(current));

	// Closing the details puts focus back on the symbol they were about, so a keyboard
	// user carries on from where they were.
	let grid: HTMLElement;
	async function close() {
		const codePoint = selected?.codePoint;
		selected = undefined;
		await tick();
		grid.querySelector<HTMLElement>(`[data-code-point="${codePoint}"]`)?.focus();
	}

	// Spaces have no ink: their tile shows their width in a dashed box instead.
	const isSpace = (char: string) => /\p{Zs}/u.test(char);
</script>

<p class="needs-js">{m.toolboxNeedsJs()}</p>

<!-- The controls and the count on one sheet: labels and small text, not on the grid. -->
<div class="sheet bar">
	<search class="controls">
		<div class="field">
			<label for="{id}-search">{m.symbolsSearch()}</label>
			<input
				id="{id}-search"
				type="search"
				placeholder={m.symbolsSearchHint()}
				autocomplete="off"
				spellcheck="false"
				disabled={!ready}
				bind:value={query}
			/>
		</div>
		<div class="field">
			<label for="{id}-group">{m.symbolsGroup()}</label>
			<!-- While searching it says so: the results come from every group. -->
			<select
				id="{id}-group"
				disabled={!ready}
				bind:value={() => (searching ? 'all' : group), (value) => pick(value as Group)}
			>
				{#if searching}<option value="all">{m.symbolsEveryGroup()}</option>{/if}
				{#each groups as { value, name } (value)}
					<option {value}>{name}</option>
				{/each}
			</select>
		</div>
	</search>

	<!-- The same groups as icons: radios, so Tab reaches the row once and the arrow keys
	     move through it. Each one's name is its group's; the icon is decoration. -->
	<fieldset class="icons" disabled={!ready}>
		<legend class="visually-hidden">{m.symbolsGroups()}</legend>
		{#each groups as { value, name, icon } (value)}
			<label title={name}>
				<input
					type="radio"
					name="{id}-icons"
					checked={!searching && group === value}
					onchange={() => pick(value)}
				/>
				<span aria-hidden="true">{icon}</span>
				<span class="visually-hidden">{name}</span>
			</label>
		{/each}
	</fieldset>

	<p class="count" role="status">
		{#if !found.length}
			{m.symbolsNone()}
		{:else if searching}
			{m.symbolsFound({ count: found.length })}
			{#if found.length > cap}{m.symbolsCapped({ count: cap, total: found.length })}{/if}
		{:else}
			{m.symbolsCount({ count: found.length })}
		{/if}
	</p>
</div>

<div class="layout">
	<section aria-labelledby="{id}-symbols">
		<h2 id="{id}-symbols" class="visually-hidden">{m.symbolsSymbols()}</h2>
		<ul
			class="grid"
			bind:this={grid}
			onpointerleave={() => (hovered = undefined)}
			onfocusout={(event) => {
				if (!grid.contains(event.relatedTarget as Node)) hovered = undefined;
			}}
		>
			{#each shown as symbol (symbol.codePoint)}
				{@const char = String.fromCodePoint(symbol.codePoint)}
				<li>
					<!-- The glyph is hidden from screen readers: they'd read "→" as
					     "right arrow" and then the name again. -->
					<button
						type="button"
						aria-pressed={selected === symbol}
						data-code-point={symbol.codePoint}
						disabled={!ready}
						onclick={() => (selected = symbol)}
						onpointerenter={(event) => {
							if (event.pointerType === 'mouse') hovered = symbol;
						}}
						onfocus={() => (hovered = symbol)}
					>
						<span class="glyph" class:space={isSpace(char)} aria-hidden="true">{char}</span>
						<span class="name">{label(symbol.name)}</span>
					</button>
				</li>
			{/each}
		</ul>
	</section>

	<!-- Beside the grid on wide screens; on narrow ones, held at the bottom once a symbol
	     is picked, with a button to put it away. Either way it stays in view while you
	     scroll the grid. -->
	<section class="details" class:open={selected} aria-labelledby="{id}-details">
		{#if current && detail}
			<div class="top">
				<div class="big" class:space={isSpace(detail.char)} aria-hidden="true">{detail.char}</div>
				{#if selected}
					<button class="close" type="button" aria-label={m.symbolsClose()} onclick={close}>
						<X aria-hidden="true" />
					</button>
				{:else}
					<p class="hint">{m.symbolsKeep()}</p>
				{/if}
			</div>
			<h2 id="{id}-details">{label(current.name)}</h2>
			<dl>
				{#snippet row(name: string, value: string)}
					<div>
						<dt>{name}</dt>
						<dd><code>{value}</code> <CopyButton {value} what={name} /></dd>
					</div>
				{/snippet}
				{@render row(m.symbolsChar(), detail.char)}
				{@render row(m.symbolsCodePoint(), detail.unicode)}
				<!-- The shortest name to copy; → has five, the rest are listed under it. -->
				{#if detail.entities.length}
					{@render row(m.symbolsHtmlName(), detail.entities[0])}
					{#if detail.entities.length > 1}
						<p class="also">
							{m.symbolsAlso()}
							{#each detail.entities.slice(1) as entity (entity)}<code>{entity}</code>{' '}{/each}
						</p>
					{/if}
				{/if}
				{@render row(m.symbolsHtmlDecimal(), detail.decimal)}
				{@render row(m.symbolsHtmlHex(), detail.hex)}
				{@render row(m.symbolsCss(), detail.css)}
				{@render row(m.symbolsJs(), detail.js)}
				{@render row(m.symbolsUrl(), detail.url)}
				{@render row(m.symbolsUtf8(), detail.utf8)}
				{@render row(m.symbolsUtf16(), detail.utf16)}
			</dl>
		{:else}
			<h2 id="{id}-details">{m.symbolsDetails()}</h2>
			<p class="hint">{m.symbolsHover()}</p>
		{/if}
	</section>
</div>

<ToolCredits {credits} />

<style>
	.needs-js {
		display: none;
		margin-block-start: var(--size-5);
		color: var(--text-2);

		@media (scripting: none) {
			display: block;
		}
	}

	.bar {
		margin-block-start: var(--size-6);
	}

	.controls {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
		gap: var(--size-3) var(--size-4);
	}

	.field {
		display: grid;
		gap: var(--size-2);
	}

	label {
		font-family: var(--font-label);
		font-size: var(--font-size-1);
	}

	input,
	select {
		inline-size: 100%;
		padding: var(--size-2) var(--size-3);
		border: var(--border-size-1) solid var(--surface-3);
		border-radius: var(--radius-2);
		background: var(--surface-2);
		color: var(--text-1);
		font: inherit;

		&:focus-visible {
			outline: var(--border-size-2) solid var(--brand);
			outline-offset: 1px;
		}

		&:disabled {
			cursor: not-allowed;
		}
	}

	/* One square per group, its icon centred; the picked one lit like a picked tile. */
	.icons {
		display: flex;
		flex-wrap: wrap;
		gap: var(--size-2);
		margin-block-start: var(--size-4);
		padding: 0;
		border: none;

		& label {
			position: relative;
			display: grid;
			place-items: center;
			inline-size: 2.75rem;
			block-size: 2.75rem;
			border: var(--border-size-1) solid var(--surface-3);
			border-radius: var(--radius-2);
			background: var(--surface-2);
			font-size: 1.35rem;
			line-height: 1;
			cursor: pointer;

			&:hover {
				border-color: var(--brand);
			}

			&:has(:checked) {
				border-color: var(--brand);
				box-shadow: inset 0 0 0 1px var(--brand);
				color: var(--brand);
			}

			&:has(:focus-visible) {
				outline: var(--border-size-2) solid var(--brand);
				outline-offset: 2px;
			}
		}

		/* The radio itself is invisible but still there, stretched over its square: it
		   takes the clicks, the focus and the arrow keys. */
		& input {
			position: absolute;
			inset: 0;
			margin: 0;
			opacity: 0;
			cursor: inherit;
		}

		&:disabled label {
			cursor: not-allowed;
		}
	}

	.count {
		min-block-size: 1lh;
		margin-block-start: var(--size-3);
		font-family: var(--font-label);
		font-size: var(--font-size-0);
		color: var(--text-2);
	}

	.layout {
		display: grid;
		gap: var(--size-4);
		margin-block-start: var(--size-3);

		@media (min-width: 56rem) {
			grid-template-columns: minmax(0, 1fr) 20rem;
			align-items: start;
		}
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(6.5rem, 1fr));
		gap: var(--size-2);
		padding: 0;
		list-style: none;
	}

	/* Off-screen tiles skip layout and paint until scrolled near: the named group has
	   over 1,400 of them. */
	li {
		content-visibility: auto;
		contain-intrinsic-size: auto 6.5rem;
	}

	.grid button {
		display: grid;
		grid-template-rows: 3rem auto;
		place-items: center;
		gap: var(--size-1);
		inline-size: 100%;
		block-size: 100%;
		padding: var(--size-2);
		border: var(--border-size-1) solid var(--surface-3);
		border-radius: var(--radius-2);
		background: var(--surface-2);
		color: var(--text-1);
		cursor: pointer;

		&:hover:not(:disabled) {
			border-color: var(--brand);
		}

		&[aria-pressed='true'] {
			border-color: var(--brand);
			box-shadow: inset 0 0 0 1px var(--brand);
		}

		&:focus-visible {
			outline: var(--border-size-2) solid var(--brand);
			outline-offset: 2px;
		}
	}

	/* The character grows under the pointer or the focus. */
	.glyph {
		font-size: 1.75rem;
		line-height: 1;
	}

	.grid button:is(:hover, :focus-visible) .glyph {
		scale: 1.6;
	}

	@media (prefers-reduced-motion: no-preference) {
		.glyph {
			transition: scale 0.25s var(--ease-spring-3);
		}
	}

	/* A space shows its width: white-space keeps it, the dashes outline it. */
	.space {
		white-space: pre;
		outline: 1px dashed var(--text-2);
	}

	.name {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		font-family: var(--font-label);
		font-size: var(--font-size-0);
		color: var(--text-2);
		text-align: center;
		overflow-wrap: anywhere;
	}

	.details {
		position: sticky;
		inset-block-end: 0;
		max-block-size: 40svh;
		overflow: auto;
		padding: var(--size-4);
		border: var(--border-size-1) solid var(--surface-3);
		border-radius: var(--radius-3);
		background: var(--surface-1);

		/* Narrow: only once a symbol is picked (the grid needs the room). */
		&:not(.open) {
			display: none;
		}

		@media (min-width: 56rem) {
			inset-block: var(--size-4) auto;
			max-block-size: calc(100svh - var(--size-8));

			&:not(.open) {
				display: block;
			}
		}

		& h2 {
			font-size: var(--font-size-2);
		}
	}

	.top {
		display: flex;
		align-items: start;
		justify-content: space-between;
		gap: var(--size-3);
	}

	.close {
		display: grid;
		place-items: center;
		padding: var(--size-1);
		border: var(--border-size-1) solid var(--surface-3);
		border-radius: var(--radius-2);
		background: var(--surface-2);
		color: var(--text-2);
		cursor: pointer;

		&:hover {
			border-color: var(--brand);
			color: var(--text-1);
		}
	}

	.hint {
		font-family: var(--font-label);
		font-size: var(--font-size-0);
		color: var(--text-2);
	}

	h2 + .hint {
		margin-block-start: var(--size-2);
	}

	.also {
		margin-block-start: calc(-1 * var(--size-1));
		font-family: var(--font-label);
		font-size: var(--font-size-0);
		color: var(--text-2);

		& code {
			margin-inline-start: var(--size-1);
		}
	}

	.big {
		inline-size: fit-content;
		font-size: 4rem;
		line-height: 1.2;
	}

	dl {
		display: grid;
		gap: var(--size-2);
		margin-block-start: var(--size-3);
	}

	dt {
		font-family: var(--font-label);
		font-size: var(--font-size-0);
		color: var(--text-2);
	}

	dd {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: var(--size-2);
		margin: 0;
	}

	code {
		font-family: var(--font-code);
		overflow-wrap: anywhere;
	}
</style>
