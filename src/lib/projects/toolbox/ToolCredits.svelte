<script lang="ts">
	// The foot of a tool that ships someone else's code or data: what it took, from
	// whom, under which licence, and the licence's own text when it asks to travel with
	// every copy. A built site is a copy, so it's here on the page, not only in the repo.
	import { m, text } from '#lib/i18n/index.ts';
	import { reflow, type Credit } from './credits.ts';

	let { credits }: { credits: Credit[] } = $props();
</script>

<footer class="sheet" aria-labelledby="tool-credits">
	<h2 id="tool-credits">{m.toolboxCredits()}</h2>
	<ul>
		{#each credits as { what, source, url, by, licence, notice, changes } (source)}
			<li>
				<p>
					{text(what)}: <a href={url} rel="external">{source}</a>, {by} ·
					<a href={licence.url} rel="external">{licence.name}</a>{#if changes}. {text(changes)}{/if}
				</p>
				{#if notice}
					<details>
						<summary>{m.toolboxLicenceText({ licence: licence.name })}</summary>
						<!-- Legal text stays as written, in English. -->
						<p class="notice" lang="en">{reflow(notice)}</p>
					</details>
				{/if}
			</li>
		{/each}
	</ul>
</footer>

<style>
	/* A sheet (global.css): small text. */
	footer {
		margin-block-start: var(--size-8);
		font-family: var(--font-label);
		font-size: var(--font-size-0);
		color: var(--text-2);
	}

	h2 {
		font-size: var(--font-size-1);
		color: var(--text-1);
	}

	ul {
		display: grid;
		gap: var(--size-2);
		margin-block-start: var(--size-2);
		padding: 0;
		list-style: none;
	}

	a,
	summary {
		color: var(--text-2);
		cursor: pointer;

		&:hover {
			color: var(--brand);
		}
	}

	details {
		margin-block-start: var(--size-1);
	}

	/* pre-line keeps the blank lines between the licence's paragraphs (see reflow()). */
	.notice {
		max-inline-size: var(--reading-width);
		margin-block-start: var(--size-2);
		padding: var(--size-3);
		border-radius: var(--radius-2);
		background: var(--surface-2);
		white-space: pre-line;
	}
</style>
