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
		// A result that opened its page closed the box at once (morph.ts, leave()); the
		// next time it opens and closes with its animation again.
		if (panel) delete panel.dataset.instant;
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
				{#each results.hits as hit, index (hit.url)}
					<!-- --index staggers the results as they come in. -->
					<li style:--index={index}>
						<!-- data-morph-*: the result is a card (morph.ts). Opening it, its title
						     flies to the page's title and the excerpt to the description. -->
						<a href={hit.url} data-morph-card>
							{#if hit.section}<span class="section">{hit.section}</span>{/if}
							<span class="title" data-morph="title">{hit.title}</span>
							<!-- Pagefind's excerpt is HTML: it escapes the page's text, then wraps
							     the matches in <mark>. Safe as HTML (its docs say so), and the text
							     is this site's own. -->
							<span class="excerpt" data-morph="description">{@html hit.excerpt}</span>
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

	/* While the box is open, the button's glass is lit in the brand colour. */
	button:has(+ .panel:popover-open) {
		color: var(--brand);
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

	/* Opening and closing. A closed popover is display: none, and display can't be
	   animated, so: the open state is the end of the transition, @starting-style is
	   where it starts when the box appears, and the closed state is where it goes when
	   it leaves. allow-discrete keeps display and overlay (the top layer) until the
	   other properties have finished, so the closing animation is seen. It drops from
	   under the button: transform-origin is its top end corner. */
	@media (prefers-reduced-motion: no-preference) {
		.panel {
			opacity: 0;
			translate: 0 calc(-1 * var(--size-2));
			scale: 0.96;
			transform-origin: top right;
			transition:
				opacity 160ms var(--ease-out-2),
				translate 260ms var(--ease-spring-2),
				scale 260ms var(--ease-spring-2),
				display 260ms allow-discrete,
				overlay 260ms allow-discrete;
		}

		.panel:popover-open {
			opacity: 1;
			translate: 0;
			scale: 1;

			@starting-style {
				opacity: 0;
				translate: 0 calc(-1 * var(--size-2));
				scale: 0.96;
			}
		}

		/* The page behind dims a little, the same way in and out. */
		.panel::backdrop {
			background: transparent;
			transition:
				background-color 260ms var(--ease-out-2),
				display 260ms allow-discrete,
				overlay 260ms allow-discrete;
		}

		.panel:popover-open::backdrop {
			background: color-mix(in oklab, var(--surface-1) 35%, transparent);

			@starting-style {
				background: transparent;
			}
		}

		/* Closed by a result that opens its page: no closing animation, or it would show
		   in the page transition's "after" picture (morph.ts, leave()). */
		.panel:global([data-instant]),
		.panel:global([data-instant])::backdrop {
			transition: none;
		}

		/* Opening a result: the box was part of the page's "before" picture, drawn under
		   the old page's cards as they fade. With a name of its own it's a separate
		   picture, on top, and it fades and shrinks away while the result's title and
		   excerpt fly out of it (they have their own names, morph.ts). */
		:global(:root:active-view-transition-type(route)) .panel {
			view-transition-name: search-panel;
		}

		:global(::view-transition-old(search-panel)) {
			animation: panel-out 200ms var(--ease-in-2) both;
		}

		/* The magnifying glass in the field swings in when the box opens. */
		.panel:popover-open form > :global(svg) {
			animation: glass-in 400ms var(--ease-spring-3);
		}

		/* Each result rises into place, one after the other. */
		li {
			animation: result-in 280ms var(--ease-out-3) both;
			animation-delay: calc(var(--index) * 35ms);
		}
	}

	@keyframes panel-out {
		to {
			opacity: 0;
			scale: 0.97;
		}
	}

	@keyframes glass-in {
		from {
			rotate: -40deg;
			scale: 0.6;
		}
	}

	@keyframes result-in {
		from {
			opacity: 0;
			translate: 0 var(--size-2);
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
