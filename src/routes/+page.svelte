<script lang="ts">
	import Hero from '#lib/components/Hero.svelte';
	import TeaserCard, { type Teaser } from '#lib/components/TeaserCard.svelte';
	import photo from '#lib/assets/avatar.jpg?enhanced';
	import type { Link } from '#lib/links.ts';

	const links: Link[] = [
		{ label: 'View my CV', route: '/cv' },
		{ label: 'See projects', route: '/projects' },
		{ label: 'Read the blog', route: '/blog' },
		{ label: 'GitHub', url: 'https://github.com/abafdez' }
		// TODO: { label: 'LinkedIn', url: 'https://www.linkedin.com/in/…' }
	];

	// Empty until the blog (Phase 7) and projects (Phase 8) exist. The {:else}
	// fallbacks below show until then; nothing else changes when real data arrives.
	const posts: Teaser[] = [];
	const projects: Teaser[] = [];

	// This page's entrance: each part fades and slides up, one after another.
	// The keyframes are in this page's styles below. Reduced motion is handled by the
	// safety net in global.css.
	const enter = (delay: number) => `home-enter 600ms ease-out ${delay}ms both`;
</script>

<svelte:head><title>Alfonso Baeza · Portfolio</title></svelte:head>

<!-- TODO: write the real tagline -->
<Hero
	name="Alfonso Baeza"
	tagline="Web developer."
	{photo}
	{links}
	--photo-animation={enter(0)}
	--text-animation={enter(150)}
/>

<section style:animation={enter(300)} aria-labelledby="latest-posts">
	<h2 id="latest-posts">Latest posts</h2>
	<div class="grid">
		{#each posts as post (post.title)}
			<TeaserCard {...post} />
		{:else}
			<p class="empty">No posts yet. They'll show up here once the blog is live.</p>
		{/each}
	</div>
</section>

<section style:animation={enter(450)} aria-labelledby="featured-projects">
	<h2 id="featured-projects">Featured projects</h2>
	<div class="grid">
		{#each projects as project (project.title)}
			<TeaserCard {...project} />
		{:else}
			<p class="empty">No projects yet. Featured work will appear here.</p>
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

	.empty {
		color: var(--text-2);
	}

	/* -global- keeps the name as written. Svelte would otherwise rename it to
	   something like svelte-abc123-home-enter, and the Hero (another component)
	   couldn't find it by name. The prefix keeps it unique on the site. */
	@keyframes -global-home-enter {
		from {
			opacity: 0;
			translate: 0 var(--size-3);
		}
	}
</style>
