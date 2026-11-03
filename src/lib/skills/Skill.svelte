<script lang="ts">
	// One skill in /about: its icon, name and level, and, when there's more to say,
	// a <details> that opens to how I use it and where it shows.
	import BrandIcon from '#lib/components/BrandIcon.svelte';
	import { hueAndChroma } from './brand-color.ts';
	import { decode } from './decode.ts';
	import { evidenceHref, levels, type Skill } from './skills.ts';

	let { skill }: { skill: Skill } = $props();

	let more = $derived(Boolean(skill.note || skill.evidence?.length));
	// A brand logo brings its own hue. A generic (Lucide) icon has none, and the CSS
	// falls back to --icon-tone's own (the site's green).
	let color = $derived(
		skill.icon && 'hex' in skill.icon ? hueAndChroma(skill.icon.hex) : undefined
	);
</script>

{#snippet head()}
	{@const Icon = skill.icon}
	<span class="icon" style:--hue={color?.hue} style:--chroma={color?.chroma}>
		<!-- Simple Icons are data (they have a path), Lucide icons are components. -->
		{#if Icon && 'path' in Icon}
			<BrandIcon icon={Icon} size="1.25rem" />
		{:else if Icon}
			<Icon size="1.25rem" aria-hidden="true" />
		{/if}
	</span>
	<!-- The name twice: the real one for screen readers, and a copy that decodes from
	     random glyphs when it scrolls into view (garbage while it runs, so hidden). -->
	<span class="name">
		<span class="visually-hidden">{skill.name}</span>
		<span aria-hidden="true" {@attach decode(skill.name)}>{skill.name}</span>
	</span>
	{#if skill.level}
		<!-- The word is the level; the bar only draws it. A screen reader hears
		     "CSS, Daily" (the comma is hidden from sight, not from it). -->
		<span class="level">
			<!-- htop-style: [||||||      ], 3 ticks per level out of 12. -->
			<span class="bar" style:--ticks={skill.level * 3} aria-hidden="true"
				>[<span class="track"><span class="fill">||||||||||||</span></span>]</span
			>
			<span><span class="visually-hidden">, </span>{levels[skill.level]}</span>
		</span>
	{/if}
{/snippet}

<li class="skill">
	{#if more}
		<details>
			<summary>
				{@render head()}
				<!-- A terminal-style open/closed marker instead of the default triangle. -->
				<span class="toggle" aria-hidden="true"></span>
			</summary>
			<div class="more">
				{#if skill.note}
					<p>{skill.note}</p>
				{/if}
				{#if skill.evidence?.length}
					<ul>
						{#each skill.evidence as evidence (evidence.label)}
							<li>
								<a href={evidenceHref(evidence)} rel={'url' in evidence ? 'external' : undefined}
									>{evidence.label}</a
								>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		</details>
	{:else}
		<div class="head">{@render head()}</div>
	{/if}
</li>

<style>
	/* A row in a terminal, not a card: no border, a highlight on hover.
	   container-type: the row's layout below depends on its own width, not the screen's. */
	.skill {
		container-type: inline-size;
		border-radius: var(--radius-2);

		&:hover {
			background: var(--surface-2);
		}
	}

	/* The same row, clickable or not: icon, name, level, then the [+] when it opens.
	   The last column has a fixed width, so a row without [+] keeps its level in line. */
	summary,
	.head {
		display: grid;
		/* fit-content(50%): the level never takes more than half the row. As plain
		   auto, grid gave it all the spare room before the name's 1fr got any, and at
		   320px names were one letter wide. */
		grid-template-columns: auto minmax(0, 1fr) fit-content(50%) 3ch;
		align-items: center;
		gap: var(--size-2);
		padding: var(--size-2) var(--size-3);
	}

	summary {
		list-style: none;
		cursor: pointer;

		/* Safari still draws its own marker. */
		&::-webkit-details-marker {
			display: none;
		}

		&:hover .name {
			color: var(--brand);
		}
	}

	/* Relative color: start from --icon-tone, keep its lightness (l), swap in the
	   brand's chroma and hue. var(--hue, h) falls back to the tone's own h when the
	   skill has no brand color. */
	.icon {
		display: flex;
		inline-size: 1.25rem;
		color: oklch(from var(--icon-tone) l var(--chroma, c) var(--hue, h));
	}

	/* minmax(0, 1fr) above lets this column shrink below its longest word, and a word
	   too long for it breaks with a hyphen: at 320px, "Virtualization" next to
	   "Comfortable" didn't fit, and the whole page grew sideways. */
	/* Monospace, so the random glyphs take exactly the room of the letters they
	   replace, and the row doesn't jitter while the name decodes. */
	.name {
		font-family: var(--font-code);
		color: var(--text-1);
		overflow-wrap: break-word;
		hyphens: auto;
	}

	/* Bar and word on one line, like a row of htop. The word gets a fixed width so the
	   bars line up down the list; on a narrow screen the word wraps under the bar. */
	.level {
		display: flex;
		flex-wrap: wrap;
		justify-content: end;
		align-items: center;
		gap: var(--size-1) var(--size-2);
		font-family: var(--font-label);
		font-size: var(--font-size-0);
		color: var(--text-2);

		& > :last-child {
			min-inline-size: 14ch;
		}
	}

	/* A narrow row (a phone): the level moves to its own line, under the name.
	   After .level on purpose: @container adds no specificity, so the later rule wins. */
	@container (width < 26rem) {
		summary,
		.head {
			grid-template-columns: auto minmax(0, 1fr) 3ch;
		}

		.level {
			grid-column: 2;
			grid-row: 2;
			justify-content: start;
		}
	}

	/* Visually hidden, still read. */
	.visually-hidden {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}

	/* [||||||      ]: the ticks are text, in the code font, so 1ch is one tick. The
	   fill is --ticks characters wide; the empty part of the track is dots drawn
	   underneath it (a pseudo-element, so it isn't text anyone reads). */
	.bar {
		font-family: var(--font-code);
		white-space: pre;
	}

	.track {
		position: relative;
		display: inline-block;
		inline-size: 12ch;
		vertical-align: bottom;
		text-align: start;

		&::before {
			content: '............';
			position: absolute;
			inset: 0;
			color: var(--surface-3);
		}
	}

	.fill {
		position: relative;
		display: inline-block;
		inline-size: calc(var(--ticks) * 1ch);
		overflow: hidden;
		vertical-align: bottom;
		color: var(--brand);
	}

	/* The bar counts up tick by tick as it scrolls into view: a view timeline, and
	   steps() so it jumps one character at a time, like htop redrawing. Without
	   support, or with reduced motion, it's just full. */
	@supports (animation-timeline: view()) {
		@media (prefers-reduced-motion: no-preference) {
			.fill {
				animation: count-up steps(var(--ticks), jump-end) both;
				animation-timeline: view();
				animation-range: entry 100% cover 35%;
			}
		}
	}

	@keyframes count-up {
		from {
			clip-path: inset(0 100% 0 0);
		}
	}

	.toggle::before {
		content: '[+]';
		font-family: var(--font-label);
		font-size: var(--font-size-0);
		color: var(--text-2);
	}

	details[open] .toggle::before {
		content: '[-]';
	}

	.more {
		padding: 0 var(--size-3) var(--size-3);
		color: var(--text-2);

		& ul {
			display: grid;
			gap: var(--size-1);
			margin-block-start: var(--size-2);
			padding-inline-start: var(--size-4);
		}

		/* At least 24px tall (WCAG's target size), in a list of them. */
		& a {
			display: inline-block;
			padding-block: var(--size-1);
		}
	}
</style>
