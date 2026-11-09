<script lang="ts">
	// One section of the guide: what it does, when to use it, what to avoid, and its MDN
	// page. `Backticks` in the text become <code>, without {@html}: the text is split on
	// them and each piece rendered as text or code.
	import { m, text } from '#lib/i18n/index.ts';
	import type { Section } from './guide.ts';
	import type { Translated } from '#lib/i18n/index.ts';

	let { section }: { section: Section } = $props();

	const parts = (value: Translated) => text(value).split(/(`[^`]+`)/);
</script>

{#snippet prose(value: Translated)}
	{#each parts(value) as part, i (i)}
		{#if part.startsWith('`')}<code>{part.slice(1, -1)}</code>{:else}{part}{/if}
	{/each}
{/snippet}

{#each section.intro as paragraph, i (i)}
	<p>{@render prose(paragraph)}</p>
{/each}

<div class="lists">
	<div>
		<h3>{m.cursorsUse()}</h3>
		<ul>
			{#each section.use as item, i (i)}<li>{@render prose(item)}</li>{/each}
		</ul>
	</div>
	<div>
		<h3>{m.cursorsAvoid()}</h3>
		<ul class="avoid">
			{#each section.avoid as item, i (i)}<li>{@render prose(item)}</li>{/each}
		</ul>
	</div>
</div>

<p class="mdn">
	<a href={section.mdn.url} rel="external">{m.cursorsMdn({ name: section.mdn.name })}</a>
</p>

<style>
	p {
		max-inline-size: var(--reading-width);
		margin-block-start: var(--size-3);
	}

	code {
		padding: 0.1em 0.3em;
		border-radius: var(--radius-2);
		background: var(--surface-2);
		font-family: var(--font-code);
		font-size: 0.9em;
	}

	.lists {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
		gap: var(--size-4);
		margin-block-start: var(--size-4);
	}

	h3 {
		font-family: var(--font-label);
		font-size: var(--font-size-1);
		color: var(--text-2);
	}

	ul {
		margin-block-start: var(--size-2);
		padding-inline-start: var(--size-5);

		& li + li {
			margin-block-start: var(--size-1);
		}

		& li::marker {
			color: var(--brand);
		}

		&.avoid li::marker {
			color: var(--error);
		}
	}

	.mdn {
		font-family: var(--font-label);
		font-size: var(--font-size-0);
	}
</style>
