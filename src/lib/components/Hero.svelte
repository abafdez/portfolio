<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Picture } from '@sveltejs/enhanced-img';
	import type { Link } from '#lib/links.ts';

	interface Props {
		// Required: a hero without a name or links makes no sense, so forgetting
		// one should be a type error, not a silent blank.
		name: string;
		links: Link[];
		// Optional: the hero still works without them.
		tagline?: string;
		photo?: Picture;
	}

	let { name, links, tagline, photo }: Props = $props();
</script>

<!-- The section is the size container; .layout responds to its width. -->
<section class="hero">
	<div class={['layout', photo && 'with-photo']}>
		{#if photo}
			<!-- alt="" because the name right next to it already says who this is. -->
			<enhanced:img src={photo} alt="" class="photo" />
		{/if}
		<div class="text">
			<h1>{name}</h1>
			{#if tagline}
				<p class="tagline">{tagline}</p>
			{/if}
			<ul class="links">
				{#each links as link (link.label)}
					<li>
						<a href={'route' in link ? resolve(link.route) : link.url}>{link.label}</a>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</section>

<style>
	.hero {
		container-type: inline-size;
		padding-block: var(--size-8) var(--size-6);
	}

	.layout {
		display: grid;
		gap: var(--size-5);
		align-items: center;
	}

	/* Animation hooks: the page passes them as props (<Hero --photo-animation="…" />).
	   Nothing passed means no animation. */
	.photo {
		inline-size: 8rem;
		block-size: auto;
		border-radius: var(--radius-round);
		animation: var(--photo-animation, none);
	}

	.text {
		animation: var(--text-animation, none);
	}

	/* After the base rules: @container adds no specificity, so source order decides. */
	@container (min-width: 36rem) {
		.layout.with-photo {
			grid-template-columns: auto 1fr;
			gap: var(--size-7);
		}

		.photo {
			inline-size: 12rem;
		}
	}

	h1 {
		font-size: var(--font-size-fluid-3);
	}

	.tagline {
		margin-block-start: var(--size-2);
		font-size: var(--font-size-3);
		color: var(--text-2);
		max-inline-size: var(--size-content-2);
	}

	.links {
		display: flex;
		flex-wrap: wrap;
		gap: var(--size-2);
		margin-block-start: var(--size-5);
		padding: 0;
		list-style: none;
	}

	.links a {
		display: inline-block;
		padding: var(--size-2) var(--size-3);
		border: var(--border-size-1) solid var(--surface-3);
		border-radius: var(--radius-2);
		background: var(--surface-2);
		font-family: var(--font-label);
		text-decoration: none;
	}

	.links a:hover {
		background: var(--surface-3);
	}
</style>
