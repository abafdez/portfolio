<script lang="ts">
	// Every brand logo in the skills, sliding by in a loop. Decoration: the same skills
	// are listed, with names, right below, so the whole strip is aria-hidden.
	import type { SimpleIcon } from 'simple-icons';
	import { hueAndChroma } from './brand-color.ts';
	import { groups } from './skills.ts';

	// Brand logos only (generic icons say nothing on their own), once each.
	const logos = [
		...new Map(
			groups
				.flatMap((group) => group.skills)
				.flatMap((skill) => (skill.icon && 'hex' in skill.icon ? [skill.icon] : []))
				.map((icon: SimpleIcon) => [icon.slug, icon])
		).values()
	].map((icon) => ({ icon, ...hueAndChroma(icon.hex) }));
</script>

<!-- The list twice, one after the other. The track slides left by exactly half its
     width (one copy) and starts over: the second copy is then where the first one
     was, so the jump can't be seen.
     The first copy writes each logo's path, with an id; the second one only points at
     it (<use href="#…">), so the paths aren't in the HTML twice. Written out twice they
     were 168 KB, half the page. -->
<div class="marquee" aria-hidden="true">
	<div class="track">
		{#each [0, 1] as copy (copy)}
			<ul>
				{#each logos as { icon, hue, chroma } (icon.slug)}
					<li style:--hue={hue} style:--chroma={chroma} title={icon.title}>
						<svg viewBox="0 0 24 24" width="2rem" height="2rem" fill="currentColor">
							{#if copy === 0}
								<path id="logo-{icon.slug}" d={icon.path} />
							{:else}
								<use href="#logo-{icon.slug}" />
							{/if}
						</svg>
					</li>
				{/each}
			</ul>
		{/each}
	</div>
</div>

<style>
	/* The edges fade out (a mask: where the gradient is transparent, so is the strip).
	   contain: inline-size: the strip is as wide as its column, whatever it holds.
	   Without it, the page measured the whole track (every logo, twice) and grew
	   800px wider at 320px; overflow: hidden alone doesn't stop that. */
	.marquee {
		contain: inline-size;
		overflow: hidden;
		margin-block-start: var(--size-6);
		mask-image: linear-gradient(to right, transparent, #000 10%, #000 90%, transparent);
	}

	.track {
		display: flex;
		inline-size: max-content;
	}

	ul {
		display: flex;
		gap: var(--size-6);
		/* The gap between the two copies, so the loop keeps the same spacing. */
		padding: 0 var(--size-6) 0 0;
		list-style: none;
	}

	/* Same color rule as the skill icons: the theme's lightness, the brand's hue. */
	li {
		display: flex;
		color: oklch(from var(--icon-tone) l var(--chroma, c) var(--hue, h));
	}

	/* Slides forever, even under the pointer: there's nothing in it to click or read
	   that the list below doesn't have. With reduced motion it stays still (and the
	   strip just shows the first logos that fit). */
	@media (prefers-reduced-motion: no-preference) {
		.track {
			animation: slide 60s linear infinite;
		}
	}

	@keyframes slide {
		to {
			translate: -50%;
		}
	}
</style>
