<script lang="ts">
	// The search button in the header and the box it opens. Like the colour theme menu,
	// a popover (popovertarget): Escape and a click outside close it, and focus goes back
	// to the button, with no JS of ours. The results come from Pagefind (search.ts).
	import { onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import SearchIcon from '@lucide/svelte/icons/search';
	import { m } from '#lib/i18n/index.ts';
	import { load, search, type Results } from '#lib/search.ts';

	let ready = $state(false);
	let query = $state('');
	// undefined: nothing asked yet; null: no index (dev); 'searching': waiting.
	let results = $state<Results | null | 'searching'>();
	let panel = $state<HTMLElement>();
	let input = $state<HTMLInputElement>();

	onMount(() => {
		ready = true;
		// "/" opens the search from anywhere, as on GitHub and MDN, unless you're typing.
		const onKey = (event: KeyboardEvent) => {
			const target = event.target as HTMLElement;
			if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey) return;
			if (target.closest('input, textarea, select, [contenteditable]')) return;
			event.preventDefault();
			panel?.showPopover();
		};
		addEventListener('keydown', onKey);
		return () => removeEventListener('keydown', onKey);
	});

	// A result is a link inside the site: once it's followed, the box closes.
	afterNavigate(() => panel?.hidePopover());

	function opened(event: ToggleEvent) {
		if (event.newState !== 'open') return;
		input?.focus();
		input?.select();
		load(); // start fetching Pagefind while the visitor types
	}

	async function run() {
		const asked = query.trim();
		if (!asked) {
			results = undefined;
			return;
		}
		results = 'searching';
		const found = await search(asked);
		if (found === null) return; // a newer query is on its way
		if (asked !== query.trim()) return;
		results = found ?? null;
	}

	const message = $derived.by(() => {
		if (results === undefined) return '';
		if (results === null) return m.searchUnavailable();
		if (results === 'searching') return m.searchSearching();
		if (!results.total) return m.searchNone({ query: query.trim() });
		return m.searchCount({ count: results.total });
	});
</script>

<button
	type="button"
	popovertarget="search"
	aria-label={m.searchLabel()}
	title={m.searchLabel()}
	disabled={!ready}
>
	<SearchIcon aria-hidden="true" />
</button>

<div id="search" class="panel" popover bind:this={panel} ontoggle={opened}>
	<search>
		<form onsubmit={(event) => event.preventDefault()}>
			<label for="search-input" class="visually-hidden">{m.searchLabel()}</label>
			<SearchIcon aria-hidden="true" />
			<input
				id="search-input"
				type="search"
				autocomplete="off"
				placeholder={m.searchPlaceholder()}
				bind:this={input}
				bind:value={query}
				oninput={run}
			/>
			<kbd aria-hidden="true">Esc</kbd>
		</form>
		<p class="status" role="status">{message}</p>
		{#if typeof results === 'object' && results?.hits.length}
			<ol>
				{#each results.hits as hit (hit.url)}
					<li>
						<a href={hit.url}>
							{#if hit.section}<span class="section">{hit.section}</span>{/if}
							<span class="title">{hit.title}</span>
							<!-- Pagefind's excerpt is HTML: it escapes the page's text, then wraps
							     the matches in <mark>. Safe as HTML (its docs say so), and the text
							     is this site's own. -->
							<span class="excerpt">{@html hit.excerpt}</span>
						</a>
					</li>
				{/each}
			</ol>
		{/if}
	</search>
</div>

<style>
	button {
		display: grid;
		place-items: center;
		inline-size: var(--size-8);
		block-size: var(--size-8);
		padding: var(--size-2);
		color: var(--text-2);
		background: none;
		border: none;
		border-radius: var(--radius-round);
		cursor: pointer;
		anchor-name: --search-button;

		&:is(:hover, :focus-visible) {
			color: var(--text-1);
		}

		& :global(svg) {
			inline-size: 100%;
			block-size: 100%;
		}
	}

	/* Under the button, its end edge lined up with the button's, like the theme menu. */
	.panel {
		position-anchor: --search-button;
		position-area: block-end span-inline-start;
		inset: auto;
		inline-size: min(36rem, calc(100vw - 2 * var(--size-3)));
		max-block-size: min(75vh, 44rem);
		margin: var(--size-2) 0 0;
		padding: var(--size-3);
		overflow: auto;
		border: var(--border-size-1) solid var(--surface-3);
		border-radius: var(--radius-3);
		background-color: var(--surface-1);
		color: var(--text-1);
		box-shadow: var(--shadow-float);
	}

	/* Narrow screens, or no anchor positioning: across the top, under the header. */
	@media (max-width: 40rem) {
		.panel {
			position-area: none;
			inset: var(--size-10) var(--size-3) auto;
			inline-size: auto;
			margin: 0;
		}
	}

	@supports not (position-area: block-end) {
		.panel {
			inset: var(--header-space) var(--size-3) auto auto;
			margin: 0;
		}
	}

	form {
		display: flex;
		align-items: center;
		gap: var(--size-2);
		padding: var(--size-2) var(--size-3);
		border: var(--border-size-1) solid var(--surface-3);
		border-radius: var(--radius-2);
		background: var(--surface-2);
		color: var(--text-2);

		&:focus-within {
			border-color: var(--brand);
		}

		& > :global(svg) {
			flex: none;
			inline-size: var(--size-4);
			block-size: var(--size-4);
		}
	}

	input {
		flex: 1;
		min-inline-size: 0;
		border: none;
		background: none;
		color: var(--text-1);
		font: inherit;
		outline: none;
	}

	kbd {
		padding: 0 var(--size-1);
		border: var(--border-size-1) solid var(--surface-3);
		border-radius: var(--radius-1);
		font-family: var(--font-label);
		font-size: var(--font-size-0);
	}

	.status {
		margin-block: var(--size-2) 0;
		font-family: var(--font-label);
		font-size: var(--font-size-0);
		color: var(--text-2);

		&:empty {
			display: none;
		}
	}

	ol {
		display: grid;
		gap: var(--size-1);
		margin: var(--size-2) 0 0;
		padding: 0;
		list-style: none;
	}

	a {
		display: grid;
		gap: var(--size-1);
		padding: var(--size-2) var(--size-3);
		border-radius: var(--radius-2);
		color: var(--text-1);
		text-decoration: none;

		&:is(:hover, :focus-visible) {
			background: var(--surface-2);
		}

		&:focus-visible {
			outline: 2px solid var(--brand);
			outline-offset: -2px;
		}
	}

	.section {
		font-family: var(--font-label);
		font-size: var(--font-size-0);
		color: var(--brand);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.title {
		font-weight: var(--font-weight-6);
	}

	.excerpt {
		font-size: var(--font-size-0);
		color: var(--text-2);

		& :global(mark) {
			background: color-mix(in oklab, var(--brand) 18%, transparent);
			color: var(--text-1);
			border-radius: var(--radius-1);
		}
	}
</style>
