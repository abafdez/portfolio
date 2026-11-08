<script lang="ts">
	// The contrast checker: each text token on each surface, in both themes, scored
	// against WCAG. It reads the colors in the browser (readColors), so it checks the
	// tokens as they are now, including a future theme that overrides them.
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { formatNumber, m } from '#lib/i18n/index.ts';
	import {
		contrast,
		level,
		readColors,
		schemes,
		surfaces,
		texts,
		type Colors,
		type Scheme,
		type Surface,
		type Text
	} from './contrast.ts';

	// The pair being checked. The URL holds it too (?text=…&surface=…), so a pair can be
	// shared as a link.
	let text: Text = $state('text-2');
	let surface: Surface = $state('surface-1');
	// null until the browser has read the tokens.
	let colors: Colors | null = $state(null);

	onMount(() => {
		// The page is prerendered: at build time there's no visitor URL to read (SvelteKit
		// throws if you try), so the params are read here, and onMount only runs in the
		// browser. find() also checks the value is one of ours.
		const params = page.url.searchParams;
		text = texts.find((t) => t === params.get('text')) ?? text;
		surface = surfaces.find((s) => s === params.get('surface')) ?? surface;
		colors = readColors();

		// Another colour theme picked while this page is open (PalettePicker sets
		// data-palette on <html>): read the tokens again. A MutationObserver calls us
		// back when that attribute changes, and only that one.
		const observer = new MutationObserver(() => (colors = readColors()));
		observer.observe(document.documentElement, { attributeFilter: ['data-palette'] });
		return () => observer.disconnect();
	});

	// When a select changes. An event handler, not an $effect: we react to what the user
	// did, not to every change of state (onMount's changes don't need a URL update).
	function share() {
		// A copy: page.url is read-only (its type has no set()), so it can't be changed by
		// accident.
		const url = new URL(page.url.href);
		url.searchParams.set('text', text);
		url.searchParams.set('surface', surface);
		// shallow: only the address bar changes (no load, no route transition).
		// replace: one history entry, not one per pick, so Back leaves the page.
		goto(url, { shallow: true, replace: true });
	}

	const ratio = (colors: Colors, scheme: Scheme, text: Text, surface: Surface) =>
		contrast(colors[scheme][text], colors[scheme][surface]);

	const names: Record<Scheme, () => string> = { dark: m.themeDark, light: m.themeLight };

	// Cut to two decimals, not rounded: 4.497 fails AA, so it mustn't show as 4.50.
	// Then written the page's way: 4.50 in English, 4,50 in Spanish.
	const format = (ratio: number) => formatNumber(Math.floor(ratio * 100) / 100, 2);
</script>

<div class="pick">
	<label>
		{m.contrastText()}
		<select bind:value={text} onchange={share}>
			{#each texts as option (option)}
				<option value={option}>--{option}</option>
			{/each}
		</select>
	</label>
	<label>
		{m.contrastSurface()}
		<select bind:value={surface} onchange={share}>
			{#each surfaces as option (option)}
				<option value={option}>--{option}</option>
			{/each}
		</select>
	</label>
</div>

<div class="themes">
	{#each schemes as scheme (scheme)}
		<section aria-labelledby="{scheme}-title">
			<h2 id="{scheme}-title">{names[scheme]()}</h2>
			<!-- CSS draws the pair in this theme (data-theme declares the tokens again,
			     see tokens.css), so the sample needs no JS. -->
			<p
				class="sample"
				data-theme={scheme}
				style:color="var(--{text})"
				style:background-color="var(--{surface})"
			>
				{m.contrastSample()}
			</p>
			<!-- Always there, empty until the tokens are read: a line that appeared later
			     would push everything under it down (a layout shift). -->
			<p class="score">
				{#if colors}
					{@const pair = ratio(colors, scheme, text, surface)}
					<strong>{format(pair)}:1</strong>
					{m.contrastLevel({ level: level(pair) })}
				{:else}
					&nbsp;
				{/if}
			</p>
		</section>
	{/each}
</div>

{#if colors}
	<h2 class="all">{m.contrastAllPairs()}</h2>
	<p class="note">{m.contrastNote()}</p>
	<div class="tables">
		{#each schemes as scheme (scheme)}
			<table>
				<caption>{names[scheme]()}</caption>
				<thead>
					<tr>
						<td></td>
						{#each surfaces as column (column)}
							<th scope="col">{column}</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each texts as row (row)}
						<tr>
							<th scope="row">{row}</th>
							{#each surfaces as column (column)}
								{@const pair = ratio(colors, scheme, row, column)}
								<td class:current={row === text && column === surface}>
									{format(pair)} <span>{m.contrastLevel({ level: level(pair) })}</span>
								</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		{/each}
	</div>
{:else}
	<!-- Without JS this stays: the ratios are computed in the browser. -->
	<p class="note">{m.contrastNoJs()}</p>
{/if}

<style>
	.pick {
		display: flex;
		flex-wrap: wrap;
		gap: var(--size-3) var(--size-5);
		margin-block-start: var(--size-5);
		font-family: var(--font-label);
	}

	label {
		display: grid;
		gap: var(--size-1);
		font-size: var(--font-size-0);
		color: var(--text-2);
	}

	select {
		padding: var(--size-2) var(--size-3);
		border: var(--border-size-1) solid var(--surface-3);
		border-radius: var(--radius-2);
		background-color: var(--surface-2);
		color: var(--text-1);
	}

	/* As many columns as fit: the two themes side by side on wide screens. */
	.themes,
	.tables {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr));
		gap: var(--size-4);
		margin-block-start: var(--size-5);
	}

	h2 {
		font-size: var(--font-size-3);
	}

	.sample {
		margin-block-start: var(--size-2);
		padding: var(--size-4);
		border: var(--border-size-1) solid var(--surface-3);
		border-radius: var(--radius-3);
	}

	.score {
		margin-block-start: var(--size-2);
		font-family: var(--font-label);

		& strong {
			font-size: var(--font-size-4);
			color: var(--brand);
		}
	}

	h2.all {
		margin-block-start: var(--size-8);
	}

	.note {
		margin-block-start: var(--size-2);
		color: var(--text-2);
	}

	table {
		border-collapse: collapse;
		font-family: var(--font-label);
		font-size: var(--font-size-0);
	}

	caption {
		padding-block-end: var(--size-2);
		text-align: start;
		color: var(--text-2);
	}

	/* Tight padding: at 320px, four columns of monospace just fit. */
	th,
	td {
		padding: var(--size-1);
		border: var(--border-size-1) solid var(--surface-3);
		text-align: start;
	}

	th {
		font-weight: normal;
		color: var(--text-2);
	}

	/* The level on its own line, so every cell has the same shape. */
	td span {
		display: block;
		color: var(--text-2);
	}

	/* The pair picked above. */
	td.current {
		outline: 2px solid var(--brand);
		outline-offset: -2px;
	}
</style>
