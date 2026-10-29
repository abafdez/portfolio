<script lang="ts">
	import Hero from '#lib/components/Hero.svelte';
	import TeaserCard from '#lib/components/TeaserCard.svelte';
	import photo from '#lib/assets/avatar.jpg?enhanced';
	import type { Link } from '#lib/links.ts';

	const links: Link[] = [
		{ label: 'View my CV', route: '/cv' },
		{ label: 'See projects', route: '/projects' },
		{ label: 'Read the blog', route: '/blog' },
		{ label: 'GitHub', url: 'https://github.com/abafdez' }
		// TODO: { label: 'LinkedIn', url: 'https://www.linkedin.com/in/…' }
	];

	// Placeholders until the blog (Phase 7) and projects (Phase 8) have real content.
	const placeholder = { title: 'Coming soon', description: 'Nothing here yet.' };
</script>

<svelte:head><title>Alfonso Baeza · Portfolio</title></svelte:head>

<!-- TODO: write the real tagline -->
<Hero name="Alfonso Baeza" tagline="Web developer." {photo} {links} />

<section aria-labelledby="latest-posts">
	<h2 id="latest-posts">Latest posts</h2>
	<div class="grid">
		{#each [1, 2, 3] as n (n)}
			<TeaserCard {...placeholder} />
		{/each}
	</div>
</section>

<section aria-labelledby="featured-projects">
	<h2 id="featured-projects">Featured projects</h2>
	<div class="grid">
		{#each [1, 2, 3] as n (n)}
			<TeaserCard {...placeholder} />
		{/each}
	</div>
</section>

<style>
	section + section {
		margin-block-start: var(--size-8);
	}

	/* As many columns as fit (min 16rem, or full width on narrow screens).
	   auto-fit collapses empty columns, so 3 cards stretch to fill the row. */
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
		gap: var(--size-4);
		margin-block-start: var(--size-4);
	}
</style>
