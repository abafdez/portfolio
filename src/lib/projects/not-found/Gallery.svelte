<script lang="ts">
	// /projects/404: the 404's games and animations on one page. A radio group picks one;
	// under it, how it's made and its files on GitHub. As on the 404 itself, only the
	// picked variant's code downloads.
	import { onMount } from 'svelte';
	import { m, text } from '#lib/i18n/index.ts';
	import { sourceUrl } from '#lib/links.ts';
	import { shared, variants } from './variants.ts';

	const folder = 'src/lib/projects/not-found';
	let picked = $state(variants[0].id);
	const variant = $derived(variants.find(({ id }) => id === picked) ?? variants[0]);

	// Every variant needs the browser (a canvas, the pointer), so nothing is drawn while
	// rendering the page, and the picker waits for the script.
	let ready = $state(false);
	onMount(() => {
		ready = true;
	});
</script>

<fieldset class="picker sheet" disabled={!ready}>
	<legend class="visually-hidden">{m.notFoundVariant()}</legend>
	{#each variants as { id, name } (id)}
		<label>
			<input type="radio" name="variant" value={id} bind:group={picked} />
			{text(name)}
		</label>
	{/each}
</fieldset>
<p class="no-js sheet">{m.notFoundNeedsJs()}</p>

<section aria-labelledby="variant-name">
	<h2 id="variant-name">{text(variant.name)}</h2>
	{#if ready}
		{#key variant.id}
			{#await variant.load() then { default: Variant }}
				<Variant />
			{/await}
		{/key}
	{/if}

	<div class="about sheet">
		<p>{text(variant.about)}</p>
		<h3>{m.notFoundCode()}</h3>
		<ul>
			{#each variant.files as file (file)}
				<li><a href={sourceUrl(`${folder}/${file}`)} rel="external"><code>{file}</code></a></li>
			{/each}
		</ul>
		<h3>{m.notFoundShared()}</h3>
		<ul>
			{#each shared as file (file)}
				<li><a href={sourceUrl(`${folder}/${file}`)} rel="external"><code>{file}</code></a></li>
			{/each}
		</ul>
	</div>
</section>

<style>
	.picker {
		display: flex;
		flex-wrap: wrap;
		gap: var(--size-2);
		min-inline-size: 0;
		margin-block-start: var(--size-5);
	}

	/* Each radio is stretched, invisible, over its label: the label is what you see and
	   click, the radio keeps the keyboard (arrow keys move between them). */
	label {
		position: relative;
		padding: var(--size-1) var(--size-3);
		border: var(--border-size-1) solid var(--surface-3);
		border-radius: var(--radius-round);
		background: var(--surface-2);
		color: var(--text-1);
	}

	input {
		position: absolute;
		inset: 0;
		margin: 0;
		opacity: 0;
		cursor: pointer;
	}

	label:has(:checked) {
		border-color: var(--brand);
		color: var(--brand);
	}

	label:has(:focus-visible) {
		outline: 2px solid var(--brand);
		outline-offset: 2px;
	}

	fieldset:disabled label {
		opacity: 0.6;
	}

	.no-js {
		display: none;
	}

	@media (scripting: none) {
		.no-js {
			display: block;
			margin-block-start: var(--size-3);
		}
	}

	section {
		margin-block-start: var(--size-7);
	}

	h2 {
		margin-block-end: var(--size-4);
	}

	.about {
		margin-block-start: var(--size-5);
	}

	.about p {
		max-inline-size: var(--reading-width);
		color: var(--text-2);
	}

	h3 {
		margin-block-start: var(--size-4);
		font-size: var(--font-size-1);
	}

	ul {
		display: flex;
		flex-wrap: wrap;
		gap: var(--size-1) var(--size-4);
		margin-block-start: var(--size-2);
		padding: 0;
		list-style: none;
	}
</style>
