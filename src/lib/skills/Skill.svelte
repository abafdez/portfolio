<script lang="ts">
	// One skill in /about: its icon, name and level, and, when there's more to say,
	// a <details> that opens to how I use it and where it shows.
	import BrandIcon from '#lib/components/BrandIcon.svelte';
	import { hueAndChroma } from './brand-color.ts';
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
	<span class="name">{skill.name}</span>
	{#if skill.level}
		<!-- The word is the level; the meter only draws it. A screen reader hears
		     "CSS, Daily" (the comma is hidden from sight, not from it). -->
		<span class="level">
			<span class="meter" style:--level={skill.level} aria-hidden="true"></span>
			<span><span class="comma">, </span>{levels[skill.level]}</span>
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
	.skill {
		border: var(--border-size-1) solid var(--surface-3);
		border-radius: var(--radius-2);
		background: var(--surface-2);
	}

	/* The same row, clickable or not: icon, name, level, then the [+] when it opens.
	   The last column has a fixed width, so a row without [+] keeps its level in line. */
	summary,
	.head {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto 3ch;
		align-items: center;
		gap: var(--size-2);
		padding: var(--size-3);
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
	.name {
		color: var(--text-1);
		overflow-wrap: break-word;
		hyphens: auto;
	}

	.level {
		display: grid;
		justify-items: end;
		gap: var(--size-1);
		font-family: var(--font-label);
		font-size: var(--font-size-0);
		color: var(--text-2);
		text-align: end;
	}

	/* Visually hidden, still read. */
	.comma {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}

	/* Four segments, drawn with a repeating gradient: --segment of color, then --gap of
	   nothing. The empty ones are the meter's background; ::after draws --level of them
	   filled, on top. The gradient is declared on both, so each one reads its own
	   --color (a custom property holding it would be resolved once, on .meter, and
	   ::after would inherit the gray: the same trap as light-dark() in tokens.css). */
	.meter,
	.meter::after {
		background: repeating-linear-gradient(
			to right,
			var(--color) 0 var(--segment),
			transparent 0 calc(var(--segment) + var(--gap))
		);
	}

	.meter {
		--segment: 0.6rem;
		--gap: 0.15rem;
		--color: var(--surface-3);
		position: relative;
		display: block;
		inline-size: calc(4 * var(--segment) + 3 * var(--gap));
		block-size: 0.5rem;

		&::after {
			--color: var(--brand);
			content: '';
			position: absolute;
			inset-block: 0;
			inset-inline-start: 0;
			inline-size: calc(var(--level) * (var(--segment) + var(--gap)) - var(--gap));
		}
	}

	/* The wow part, CSS only. As each meter scrolls up into view, its segments light up
	   one at a time: the timeline is the meter's own trip through the viewport (a view
	   timeline), and steps() jumps segment by segment instead of sliding, like a
	   terminal progress bar. Without support, or with reduced motion, it's just full. */
	@supports (animation-timeline: view()) {
		@media (prefers-reduced-motion: no-preference) {
			.meter {
				view-timeline: --meter;
			}

			.meter::after {
				animation: meter-fill steps(var(--level), jump-end) both;
				animation-timeline: --meter;
				/* From fully in view at the bottom to a third of the way up the screen. */
				animation-range: entry 100% cover 35%;
			}
		}
	}

	@keyframes meter-fill {
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
