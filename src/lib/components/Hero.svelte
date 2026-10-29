<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Picture } from '@sveltejs/enhanced-img';
	import type { Link } from '#lib/links.ts';

	interface Props {
		name: string;
		tagline: string;
		photo: Picture;
		links: Link[];
	}

	let { name, tagline, photo, links }: Props = $props();
</script>

<!-- The section is the size container; .layout responds to its width. -->
<section class="hero">
	<div class="layout">
		<!-- alt="" because the name right next to it already says who this is. -->
		<enhanced:img src={photo} alt="" class="photo" />
		<div class="text">
			<h1>{name}</h1>
			<p class="tagline">{tagline}</p>
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

	@container (min-width: 36rem) {
		.layout {
			grid-template-columns: auto 1fr;
			gap: var(--size-7);
		}
	}

	.photo {
		inline-size: 8rem;
		block-size: auto;
		border-radius: var(--radius-round);
	}

	@container (min-width: 36rem) {
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
		text-decoration: none;
	}

	.links a:hover {
		background: var(--surface-3);
	}

	/* Motion only for people who haven't asked to reduce it. */
	@media (prefers-reduced-motion: no-preference) {
		.layout > * {
			animation:
				var(--animation-fade-in) both,
				var(--animation-slide-in-up) both;
		}

		.text {
			animation-delay: 150ms;
		}
	}
</style>
