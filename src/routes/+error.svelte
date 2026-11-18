<script lang="ts">
	// What SvelteKit shows when a page fails, inside the root layout. On GitHub Pages
	// every address that isn't a page gets build/404.html (the adapter's fallback), which
	// starts the app, finds no route and lands here with status 404. So this is the
	// site's 404 page, in the language of the address (/es/… is Spanish).
	// A 404 also gets one of the variants (games and animations, src/lib/projects/not-found/), at
	// random. Picked once the page runs in the browser: a random pick while rendering on
	// the server (pnpm dev does) wouldn't match the browser's.
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import Seo from '#lib/components/Seo.svelte';
	import { m, route, text } from '#lib/i18n/index.ts';
	import { sections } from '#lib/links.ts';
	import { variants } from '#lib/projects/not-found/variants.ts';

	const missing = $derived(page.status === 404);
	let index = $state(-1);
	const variant = $derived(variants[index]);

	onMount(() => {
		index = Math.floor(Math.random() * variants.length);
	});
</script>

<Seo
	title={missing ? m.notFoundTitle() : m.errorTitle()}
	description={missing ? m.notFoundDescription() : m.errorText()}
	noindex
/>

<header class="sheet">
	<p class="status" aria-hidden="true">{page.status}</p>
	<h1>{missing ? m.notFoundTitle() : m.errorTitle()}</h1>
	<p class="intro">{missing ? m.notFoundText() : m.errorText()}</p>
	{#if missing}
		<p class="path">{m.notFoundPath()} <code>{page.url.pathname}</code></p>
	{/if}
	<nav aria-label={m.notFoundLinks()}>
		<ul>
			{#each sections as { href, label } (href)}
				<li><a href={route(href)}>{label()}</a></li>
			{/each}
		</ul>
	</nav>
</header>

{#if missing && variant}
	<section aria-labelledby="variant-title">
		<div class="bar">
			<h2 id="variant-title">{text(variant.name)}</h2>
			<button type="button" onclick={() => (index = (index + 1) % variants.length)}>
				{m.notFoundAnother()}
			</button>
		</div>
		{#key variant.id}
			{#await variant.load() then { default: Variant }}
				<Variant />
			{/await}
		{/key}
	</section>
{/if}

<style>
	.status {
		font-family: var(--font-code);
		font-size: var(--font-size-0);
		color: var(--brand);
		letter-spacing: 0.1em;
	}

	.intro {
		margin-block-start: var(--size-2);
		color: var(--text-2);
	}

	.path {
		margin-block-start: var(--size-2);
		color: var(--text-2);
		overflow-wrap: anywhere;
	}

	nav ul {
		display: flex;
		flex-wrap: wrap;
		gap: var(--size-2) var(--size-4);
		margin-block-start: var(--size-4);
		padding: 0;
		list-style: none;
	}

	section {
		margin-block-start: var(--size-7);
	}

	/* The variant's name is a display heading, on the grid; the button sits beside it. */
	.bar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: var(--size-2);
		margin-block-end: var(--size-4);
	}

	.bar button {
		padding: var(--size-1) var(--size-3);
		border: var(--border-size-1) solid var(--surface-3);
		border-radius: var(--radius-2);
		background: var(--surface-1);
		color: var(--text-1);
		font: inherit;
	}

	.bar button:hover {
		background: var(--surface-2);
	}
</style>
