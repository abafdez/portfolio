<script lang="ts">
	// One skill in /about: its icon, name and level, and, when there's more to say,
	// a <details> that opens to how I use it and where it shows.
	import { fillOnView } from './fill.ts';
	import Icon from './Icon.svelte';
	import { evidenceHref, type Skill } from './skills.ts';
	import { m } from '#lib/i18n/index.ts';

	let { skill }: { skill: Skill } = $props();

	let more = $derived(Boolean(skill.note || skill.evidence?.length));
</script>

{#snippet head()}
	<span class="icon">
		{#if skill.icon}
			<Icon icon={skill.icon} size="1.25rem" />
		{/if}
	</span>
	<span class="name">{skill.name}</span>
	{#if skill.level}
		<!-- The word is the level; the bar only draws it. A screen reader hears
		     "CSS, Daily" (the comma is hidden from sight, not from it). -->
		<span class="level">
			<!-- htop-style: [||||||      ], 3 ticks per level out of 12. -->
			<span class="bar" style:--ticks={skill.level * 3} aria-hidden="true" {@attach fillOnView}
				>[<span class="track"><span class="fill">||||||||||||</span></span>]</span
			>
			<span><span class="visually-hidden">, </span>{m.skillLevel({ level: skill.level })}</span>
		</span>
	{/if}
{/snippet}

<!-- The brand color goes on the row: the icon, the glow and the cursor all use it.
     A skill without a logo has none, and the CSS falls back to --icon-tone's own. -->
<li class="skill" style:--hue={skill.hue} style:--chroma={skill.chroma}>
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
	   container-type: the row's layout below depends on its own width, not the screen's.
	   --glow: the brand's color at the theme's lightness (see .icon below). */
	.skill {
		--glow: oklch(from var(--icon-tone) l var(--chroma, c) var(--hue, h));
		position: relative;
		container-type: inline-size;
		border-radius: var(--radius-2);

		&:hover {
			background: var(--surface-2);
		}
	}

	/* The spotlight: a border that lights up in the brand's color near the pointer.
	   spotlight.ts sets --x and --y on every row of the list while the pointer moves
	   over it, and this is a radial gradient centered there, cut down to a 1px ring
	   with a mask (the whole box minus its content box). It's 16rem wide, so it reaches
	   the rows above and below too. It only fades in while the pointer is over the list. */
	.skill::before {
		content: '';
		position: absolute;
		inset: calc(-1 * var(--border-size-1));
		padding: var(--border-size-1);
		border-radius: inherit;
		background: radial-gradient(16rem circle at var(--x) var(--y), var(--glow), transparent 70%);
		mask:
			linear-gradient(#000 0 0) content-box exclude,
			linear-gradient(#000 0 0);
		opacity: 0;
		transition: opacity 300ms;
		pointer-events: none;
	}

	:global(.spotlight:hover) .skill::before {
		opacity: 1;
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
		color: var(--glow);
	}

	/* Monospace, like the rest of a terminal listing.
	   minmax(0, 1fr) above lets this column shrink below its longest word, and a word
	   too long for it breaks with a hyphen: at 320px, "Virtualization" next to
	   "Comfortable" didn't fit, and the whole page grew sideways. */
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

	/* [||||||      ]: the ticks are text, in the code font, so 1ch is one tick. The
	   fill is --ticks characters wide; the empty part of the track is dots drawn
	   underneath it (a pseudo-element, so it isn't text anyone reads).
	   inline-block: an inline box can't be scaled (the hover bump below). */
	.bar {
		display: inline-block;
		transform-origin: right;
		font-family: var(--font-code);
		white-space: pre;
	}

	/* The bump: the row you point at grows its bar a little, from its right end so it
	   doesn't push into the word next to it. */
	.skill:is(:hover, :focus-within) .bar {
		scale: 1.12;
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

		/* A block cursor on the last tick, like a terminal waiting at the end of the
		   line. Only on the row you're pointing at (or tabbing through): seventy
		   cursors blinking at once would be noise. */
		&::after {
			content: '';
			position: absolute;
			inset-block: 0;
			inset-inline-start: calc((var(--ticks) - 1) * 1ch);
			inline-size: 1ch;
			background: var(--glow);
			opacity: 0;
		}
	}

	.skill:is(:hover, :focus-within) .track::after {
		opacity: 1;
	}

	.fill {
		position: relative;
		display: inline-block;
		inline-size: calc(var(--ticks) * 1ch);
		overflow: hidden;
		vertical-align: bottom;
		color: var(--brand);
	}

	/* The fill sweeps in from the left, from empty to its level, once the bar is on
	   screen (fill.ts marks it data-filling). 90ms per tick, so every bar moves at the
	   same speed and a longer one takes longer (3 ticks in 0.27s, 12 in about 1s),
	   easing out as it reaches its level. --delay (from fill.ts) staggers the bars that
	   come into view together, so they cascade down the list.
	   Until then it's empty, from the start: (scripting: enabled) is true when the
	   browser runs JS, so the prerendered page doesn't show full bars that then empty
	   and refill once the JS starts. Without JS, or with reduced motion, it stays full.
	   :global(): JS sets data-filling, not the template, so Svelte can't see it match
	   anything, and would drop the rule from the CSS as unused. */
	@media (scripting: enabled) and (prefers-reduced-motion: no-preference) {
		.fill {
			clip-path: inset(0 100% 0 0);
		}

		.bar:global([data-filling]) .fill {
			animation: count-up calc(var(--ticks) * 90ms) var(--ease-out-3) var(--delay, 0s) both;
		}
	}

	/* With reduced motion, the bump is instant and the cursor stays on without
	   blinking. */
	@media (prefers-reduced-motion: no-preference) {
		/* A spring easing overshoots and settles back: the bump. */
		.bar {
			transition: scale 500ms var(--ease-spring-3);
		}

		/* steps(1): on or off, no fade, like a real cursor. */
		.skill:is(:hover, :focus-within) .track::after {
			animation: blink 1s steps(1) infinite;
		}
	}

	/* Both ends are inset(), on purpose. With only a from, the end is the fill's own
	   clip-path, none, and inset() and none can't be blended: the browser flips from one
	   to the other halfway through instead of animating, and the bar just appeared. */
	@keyframes count-up {
		from {
			clip-path: inset(0 100% 0 0);
		}

		to {
			clip-path: inset(0);
		}
	}

	@keyframes blink {
		50% {
			opacity: 0;
		}
	}

	/* Always the last column, also in a row with no level (Spanish, Self-hosted apps):
	   placed by order, it would land in the level's column. -1 is the grid's last
	   line, so -2 / -1 is the last column, three columns or four. */
	.toggle {
		grid-column: -2 / -1;
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
