<script lang="ts">
	// An Awesome list with a search box and tag filters. The page is prerendered with
	// every link, so without JS it's still the whole list; the filters appear once JS
	// runs, since they can't do anything without it.
	import { onMount, tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import TagCloud from '#lib/components/TagCloud.svelte';
	import TagList from '#lib/components/TagList.svelte';
	import { hueOf } from '#lib/hue.ts';
	import type { AwesomeList } from './awesome.ts';
	import { LinkFilter } from './filter.svelte.ts';
	import { m } from '#lib/i18n/index.ts';

	// lang: the list's language, when it isn't the page's (not translated yet).
	let { list, lang }: { list: AwesomeList; lang?: string } = $props();

	const filter = new LinkFilter(() => list.categories);
	let ready = $state(false);
	let search: HTMLInputElement | undefined = $state();
	let filters: HTMLElement | undefined = $state();

	// The tags as chips, like the blog's tag cloud: how many links use each, the most
	// used first.
	const tags = $derived(
		list.tags
			.map((tag) => ({
				tag,
				count: list.categories
					.flatMap((category) => category.links)
					.filter((link) => link.tags.includes(tag)).length,
				hue: hueOf(tag)
			}))
			.sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
	);

	onMount(() => {
		// The URL can't be read while prerendering, so like the contrast checker, the
		// filter comes from the URL here, in the browser.
		filter.read(page.url.searchParams, list.tags);
		ready = true;
	});

	// After every change, the filter goes into the address bar (shallow: no navigation;
	// replace: no history entry per keystroke), so the view can be shared as a link.
	// The button disappears once nothing is filtered, and focus would fall to <body>:
	// keyboard users would start over from the top. The search box is where they'll
	// type next.
	function clear() {
		filter.clear();
		share();
		search?.focus();
	}

	// A tag on a link: filter by it, like pressing its chip, then go to that chip, so the
	// visitor sees what's filtered and can undo it. The tag's href (?tag=css) is for
	// everything else: opening it in a new tab, copying it, or a click before JS runs.
	async function filterBy(tag: string, event: MouseEvent) {
		if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
		event.preventDefault();
		if (!filter.tags.includes(tag)) filter.toggle(tag);
		share();
		await tick();
		const chip = filters?.querySelector<HTMLElement>(`[data-tag="${tag}"]`);
		if (chip && !chip.closest('[inert]')) chip.focus();
		else filters?.scrollIntoView();
	}

	function share() {
		const url = new URL(page.url.href);
		url.search = filter.params.toString();
		goto(url, { shallow: true, replace: true });
	}
</script>

<!-- In the prerendered HTML too, but invisible until JS runs (see the styles): if it
     only appeared then, it would push the whole list down (a layout shift). -->
<search class:ready bind:this={filters}>
	<label>
		{m.awesomeSearch()}
		<!-- A function binding: a getter and a setter instead of a variable. The
			     setter updates the filter, then the URL, in that order. -->
		<input
			type="search"
			bind:this={search}
			bind:value={() => filter.query, (value) => ((filter.query = value), share())}
		/>
	</label>

	<fieldset>
		<legend>{m.tagsLabel()}</legend>
		<TagCloud
			{tags}
			countLabel={(count) => m.tagLinkCount({ count })}
			pressed={(tag) => filter.tags.includes(tag)}
			ontoggle={(tag) => (filter.toggle(tag), share())}
		/>
	</fieldset>

	<div class="summary">
		<!-- role="status": screen readers announce the count when it changes. -->
		<p role="status">{m.awesomeShown({ count: filter.count, total: list.count })}</p>
		{#if filter.active}
			<button type="button" onclick={clear}>{m.awesomeClear()}</button>
		{/if}
	</div>
</search>

{#each filter.results as category (category.id)}
	<section aria-labelledby={category.id} {lang}>
		<h2 id={category.id}>{category.name}</h2>
		<ul class="links">
			{#each category.links as link (link.url)}
				<li>
					<h3><a href={link.url} rel="external">{link.title}</a></h3>
					<p>{link.description}</p>
					<TagList
						tags={link.tags}
						tagHref={(tag) => `?tag=${encodeURIComponent(tag)}`}
						onTag={filterBy}
						--tags-space="var(--size-3)"
					/>
				</li>
			{/each}
		</ul>
	</section>
{:else}
	<p class="empty">{m.awesomeEmpty()}</p>
{/each}

<style>
	search {
		display: grid;
		gap: var(--size-4);
		margin-block-start: var(--size-6);
		font-family: var(--font-label);
		font-size: var(--font-size-0);
		color: var(--text-2);
	}

	/* Until JS runs, the filters keep their space but can't be seen or reached:
	   visibility: hidden also takes them out of the tab order and away from screen
	   readers. Without JS they'd never work, so they don't take space at all. */
	search:not(.ready) {
		visibility: hidden;
	}

	@media (scripting: none) {
		search {
			display: none;
		}
	}

	label {
		display: grid;
		gap: var(--size-1);
	}

	input {
		max-inline-size: 30rem;
		padding: var(--size-2) var(--size-3);
		border: var(--border-size-1) solid var(--surface-3);
		border-radius: var(--radius-2);
		background-color: var(--surface-2);
		color: var(--text-1);
	}

	fieldset {
		padding: 0;
		border: none;
	}

	legend {
		margin-block-end: var(--size-1);
	}

	/* Clear. At least 24px tall (WCAG's target size), like the tag links. */
	.summary button {
		padding: var(--size-1) var(--size-2);
		border: var(--border-size-1) solid var(--surface-3);
		border-radius: var(--radius-2);
		background: none;
		color: inherit;
		cursor: pointer;

		&:hover {
			color: var(--text-1);
		}
	}

	.summary {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--size-3);
	}

	section {
		margin-block-start: var(--size-7);
	}

	/* Same grid as the cards elsewhere: as many 16rem columns as fit. */
	.links {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
		gap: var(--size-4);
		margin-block-start: var(--size-3);
		padding: 0;
		list-style: none;
	}

	.links li {
		padding: var(--size-4);
		border: var(--border-size-1) solid var(--surface-3);
		border-radius: var(--radius-3);
		background: var(--surface-2);
	}

	h3 {
		font-size: var(--font-size-2);
	}

	.links p,
	.empty {
		margin-block-start: var(--size-2);
		color: var(--text-2);
	}

	.empty {
		margin-block-start: var(--size-7);
	}
</style>
