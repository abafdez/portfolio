<script lang="ts">
	import Hero from '#lib/components/Hero.svelte';
	import TeaserCard, { type Teaser } from '#lib/components/TeaserCard.svelte';
	import SectionNav, { type Section } from '#lib/components/SectionNav.svelte';
	import photo from '#lib/assets/avatar.jpg?enhanced';
	import { profiles, type Link } from '#lib/links.ts';

	const links: Link[] = [
		{ label: 'View my CV', route: '/cv' },
		{ label: 'See projects', route: '/projects' },
		{ label: 'Read the blog', route: '/blog' },
		...profiles
	];

	// Empty until the blog (Phase 7) and projects (Phase 8) exist. The {:else}
	// fallbacks below show until then; nothing else changes when real data arrives.
	const posts: Teaser[] = [];
	const projects: Teaser[] = [];

	// The sections on the right, in order. The intro's nav is built from this list.
	const sections: Section[] = [
		{ id: 'posts', label: 'Latest posts' },
		{ id: 'projects', label: 'Featured projects' }
	];

	// This page's entrance: each part fades and slides up, one after another.
	// The keyframes are in this page's styles below. Reduced motion is handled by the
	// safety net in global.css.
	const enter = (delay: number) => `home-enter 600ms ease-out ${delay}ms both`;
</script>

<svelte:head><title>Alfonso Baeza · Portfolio</title></svelte:head>

<!-- Wide screens: the intro stays put on the left while the sections scroll on the
     right. Narrow screens: one column, intro first. -->
<div class="landing">
	<div class="intro">
		<!-- TODO: write the real tagline -->
		<Hero
			name="Alfonso Baeza"
			tagline="Web developer."
			{photo}
			{links}
			--photo-animation={enter(0)}
			--text-animation={enter(150)}
		/>
		<div class="toc" style:animation={enter(300)}><SectionNav {sections} /></div>
	</div>

	<div class="sections">
		<section id="posts" style:animation={enter(300)} aria-labelledby="posts-title">
			<h2 id="posts-title">Latest posts</h2>
			<div class="grid">
				{#each posts as post (post.title)}
					<TeaserCard {...post} />
				{:else}
					<p class="empty">No posts yet. They'll show up here once the blog is live.</p>
				{/each}
			</div>
		</section>

		<section id="projects" style:animation={enter(450)} aria-labelledby="projects-title">
			<h2 id="projects-title">Featured projects</h2>
			<div class="grid">
				{#each projects as project (project.title)}
					<TeaserCard {...project} />
				{:else}
					<p class="empty">No projects yet. Featured work will appear here.</p>
				{/each}
			</div>
		</section>
	</div>
</div>

<style>
	section + section {
		margin-block-start: var(--size-8);
	}

	/* The in-page nav only helps when the intro stays in view beside the sections. */
	.toc {
		display: none;
	}

	/* Two columns. align-items: start matters: by default grid items stretch to the
	   row's height, and a sticky element as tall as its container has nowhere to stick.
	   Sticky only on screens tall enough to show the whole intro. */
	@media (min-width: 64rem) {
		.landing {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: var(--size-9);
			align-items: start;
		}

		.toc {
			display: block;
		}

		.sections {
			padding-block-start: var(--size-8);
		}
	}

	@media (min-width: 64rem) and (min-height: 45rem) {
		.intro {
			position: sticky;
			inset-block-start: var(--header-space);
		}
	}

	/* Snapping: when you stop scrolling near the top of a section, the page settles on
	   it. "proximity" only snaps when you're close; "mandatory" would always snap and
	   fight you on long sections. :has() turns it on only while this page is open
	   (the CSS stays loaded after you navigate away). Wide screens, and only without
	   a reduced-motion preference, since the page moves by itself. */
	@media (min-width: 64rem) and (prefers-reduced-motion: no-preference) {
		:global(html:has(.landing)) {
			scroll-snap-type: y proximity;
		}

		/* The top of the page is a snap point too. Without it, the first section is the
		   nearest one on load, and the page jumps down to it by itself. */
		.landing,
		section {
			scroll-snap-align: start;
		}
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

	/* Scroll-driven reveal: each section's content fades and slides up as it enters the
	   screen. Content already in view on load is past the range, so it's just shown.
	   It's on .grid, not the section: the section already runs the time-based entrance,
	   and two animation declarations on one element would replace each other. */
	@supports (animation-timeline: view()) {
		@media (prefers-reduced-motion: no-preference) {
			.grid {
				animation: reveal linear both;
				animation-timeline: view();
				animation-range: entry 0% entry 80%;
			}
		}
	}

	@keyframes reveal {
		from {
			opacity: 0;
			translate: 0 var(--size-6);
		}
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
