<script lang="ts">
	import { onMount, tick } from 'svelte';
	import Plus from '@lucide/svelte/icons/plus';
	import Minus from '@lucide/svelte/icons/minus';
	import type { ResolvedPathname } from '$app/types';
	import { spotlight } from '#lib/spotlight.ts';

	// The blog's tags as chips, most used first. Folded, the list shows a few rows and
	// fades out into a "+" button that shows them all.
	interface Props {
		// hue: the tag's colour (hue.ts), at the brand's lightness, like a skill icon.
		tags: { tag: string; count: number; hue: number }[];
		// A tag's page, e.g. blogTag from links.ts.
		href: (tag: string) => ResolvedPathname;
	}

	let { tags, href }: Props = $props();

	let list: HTMLUListElement;
	let open = $state(false);
	// The button does nothing until the JS has run.
	let ready = $state(false);
	// Whether the tags need more rows than the folded list has. Assumed in the HTML (the
	// blog has dozens of tags), measured once mounted: if they all fit, no fade, no button.
	let overflows = $state(true);
	// The list's whole height in px: what it opens to (a height can't animate to auto
	// in every browser yet, but it can to a number).
	let full = $state(0);

	// Folded, the last row that shows is the fade: its tags, and any below it, are inert (no
	// focus, not read out, no clicks) until the list opens. Measured again whenever the
	// list changes size, since a narrower list wraps into more rows.
	function measure() {
		const items = [...list.children] as HTMLElement[];
		const row = items[0].offsetHeight + parseFloat(getComputedStyle(list).rowGap);
		full = list.scrollHeight;
		if (!open) overflows = list.scrollHeight > list.clientHeight + 1;
		const fade = list.clientHeight - row;
		for (const item of items) {
			item.inert = !open && overflows && item.offsetTop + item.offsetHeight > fade;
		}
	}

	onMount(() => {
		const observer = new ResizeObserver(measure);
		observer.observe(list);
		ready = true;
		return () => observer.disconnect();
	});

	// Opening moves focus to the first tag that was hidden: that's what the visitor asked
	// to see, and the button is after the whole list now.
	async function toggle() {
		const first = ([...list.children] as HTMLElement[]).find((item) => item.inert);
		open = !open;
		await tick();
		measure();
		if (open) first?.querySelector('a')?.focus();
	}
</script>

<div class="cloud" class:open class:overflows>
	<!-- spotlight: as the pointer moves over the list, each chip's edge lights up in its
	     own colour near it (spotlight.ts, like the skills on /about). -->
	<ul id="tag-cloud" bind:this={list} style:--full="{full}px" {@attach spotlight}>
		{#each tags as { tag, count, hue } (tag)}
			<li style:--hue={hue}>
				<a href={href(tag)}>
					#{tag}
					<span class="count">
						{count}<span class="visually-hidden">{count === 1 ? ' post' : ' posts'}</span>
					</span>
				</a>
			</li>
		{/each}
	</ul>
	{#if overflows}
		<button
			type="button"
			aria-expanded={open}
			aria-controls="tag-cloud"
			disabled={!ready}
			onclick={toggle}
		>
			{#if open}
				<Minus aria-hidden="true" /> Fewer tags
			{:else}
				<Plus aria-hidden="true" /> All {tags.length} tags
			{/if}
		</button>
	{/if}
</div>

<style>
	ul {
		--chip: 2rem;
		--gap: var(--size-2);
		--row: calc(var(--chip) + var(--gap));
		/* Folded: three rows, and a fourth that fades out. A page can ask for more by
		   setting --tag-rows on an ancestor (the blog does, beside the posts). */
		--rows: var(--tag-rows, 4);
		/* measure() reads offsetTop against the list. */
		position: relative;
		display: flex;
		flex-wrap: wrap;
		gap: var(--gap);
		margin: 0;
		/* Room for the spotlight ring, which sits 1px outside each chip. */
		padding: var(--border-size-2);
		list-style: none;
		font-family: var(--font-label);
		font-size: var(--font-size-0);
	}

	/* Folded only with JS, since only JS can open it; without, every tag shows. In the
	   HTML from the start (not added once mounted), so the page doesn't jump. */
	@media (scripting: enabled) {
		ul {
			max-block-size: calc(var(--rows) * var(--row) - var(--gap) + 2 * var(--border-size-2));
			overflow: clip;
			transition: max-block-size 400ms var(--ease-out-3);
		}

		.overflows:not(.open) ul {
			mask: linear-gradient(#000 calc(100% - var(--row)), transparent);
		}

		.open ul {
			max-block-size: var(--full);
		}
	}

	/* --glow: the brand's lightness with the tag's own hue (the same recipe as a skill
	   icon on /about), so every theme keeps the colours at its own brightness. */
	li {
		--glow: oklch(from var(--brand) l 0.13 var(--hue));
		position: relative;
		border-radius: var(--radius-2);
	}

	/* A chip: a faint tint of its colour, and a stripe of it on the start edge. The text
	   stays --text-1/--text-2, which every theme checks on its surfaces. */
	a {
		display: flex;
		align-items: center;
		gap: var(--size-2);
		block-size: var(--chip);
		padding-inline: var(--size-2);
		border: var(--border-size-1) solid var(--surface-3);
		border-inline-start: var(--border-size-2) solid var(--glow);
		border-radius: inherit;
		background: color-mix(in oklab, var(--glow) 8%, var(--surface-2));
		color: var(--text-1);
		text-decoration: none;
		white-space: nowrap;

		&:is(:hover, :focus-visible) {
			background: var(--surface-3);
		}
	}

	.count {
		color: var(--text-2);
	}

	/* The spotlight (as in Skill.svelte): a radial gradient at the pointer, cut down to
	   a 1px ring with a mask (the whole box minus its content box). Smaller than a skill
	   row's, since a chip is small. */
	li::before {
		content: '';
		position: absolute;
		inset: calc(-1 * var(--border-size-1));
		padding: var(--border-size-1);
		border-radius: inherit;
		background: radial-gradient(8rem circle at var(--x) var(--y), var(--glow), transparent 70%);
		mask:
			linear-gradient(#000 0 0) content-box exclude,
			linear-gradient(#000 0 0);
		opacity: 0;
		transition: opacity 300ms;
		pointer-events: none;
	}

	ul:hover li::before {
		opacity: 1;
	}

	/* The "+": pulled up into the fade, so the tags fade out into it. */
	button {
		position: relative;
		display: inline-flex;
		align-items: center;
		gap: var(--size-1);
		min-block-size: var(--chip);
		padding-inline: var(--size-2) var(--size-3);
		border: var(--border-size-1) dashed var(--surface-3);
		border-radius: var(--radius-2);
		background: var(--surface-1);
		color: var(--text-2);
		font-family: var(--font-label);
		font-size: var(--font-size-0);
		cursor: pointer;

		&:is(:hover, :focus-visible) {
			color: var(--text-1);
			border-color: var(--text-2);
		}

		& :global(svg) {
			inline-size: 1.2em;
			block-size: 1.2em;
		}
	}

	.overflows:not(.open) button {
		margin-block-start: calc(var(--row) * -0.5);
	}

	.open button {
		margin-block-start: var(--size-2);
	}

	/* Without JS nothing is folded, so nothing to open. After the button's own rules:
	   same specificity, so the later one wins. */
	@media (scripting: none) {
		button {
			display: none;
		}
	}
</style>
