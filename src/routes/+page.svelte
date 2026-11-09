<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import { m, route, text } from '#lib/i18n/index.ts';
	import Hero from '#lib/components/Hero.svelte';
	import TeaserCard, { type Teaser } from '#lib/components/TeaserCard.svelte';
	import { thumbnailOf } from '#lib/covers.ts';
	import SectionNav, { type Section } from '#lib/components/SectionNav.svelte';
	import photo from '#lib/assets/avatar.jpg?enhanced';
	import { blogTag, devlogTag, profiles, type Link } from '#lib/links.ts';
	import { projects as allProjects } from '#lib/projects/projects.ts';
	import type { PageProps } from './$types';

	// From +page.server.ts: the latest posts and Devlog entries.
	let { data }: PageProps = $props();

	const links: Link[] = [
		{ label: m.homeAboutMe(), route: '/about' },
		{ label: m.homeSeeProjects(), route: '/projects' },
		{ label: m.homeReadBlog(), route: '/blog' },
		...profiles
	];

	// The newest projects (the list is newest first). Imported, not loaded: it's plain
	// data, and the tools themselves stay on their own pages.
	const projects: Teaser[] = allProjects
		.slice(0, 3)
		.map(({ slug, title, description, date, tags }) => ({
			title: text(title),
			description: text(description),
			date,
			tags,
			href: route('/projects/[tool]', { tool: slug })
		}));

	// The sections on the right, in order. The intro's nav is built from this list.
	const sections: Section[] = [
		{ id: 'posts', label: m.homeLatestPosts() },
		{ id: 'log', label: m.devlogTitle() },
		{ id: 'projects', label: m.homeFeaturedProjects() }
	];

	// This page's entrance: each part fades and slides up, one after another.
	// The keyframes are in this page's styles below. Reduced motion is handled by the
	// safety net in global.css.
	const enter = (delay: number) => `home-enter 600ms ease-out ${delay}ms both`;
</script>

<Seo description={m.homeTagline()} />

<!-- Wide screens: the intro stays put on the left while the sections scroll on the
     right. Narrow screens: one column, intro first. -->
<div class="landing">
	<!-- On a sheet: the tagline and the section links are body text. -->
	<div class="intro sheet">
		<Hero
			name="Alfonso Baeza"
			tagline={m.homeTagline()}
			{photo}
			{links}
			--photo-animation={enter(0)}
			--text-animation={enter(150)}
		/>
		<div class="toc" style:animation={enter(300)}><SectionNav {sections} /></div>
	</div>

	<div class="sections">
		<section id="posts" style:animation={enter(300)} aria-labelledby="posts-title">
			<h2 id="posts-title">{m.homeLatestPosts()}</h2>
			<div class="grid">
				{#each data.posts as post (post.slug)}
					<TeaserCard
						{...post}
						href={route('/blog/[slug]', { slug: post.slug })}
						thumbnail={thumbnailOf(post)}
						status={post.draft ? 'draft' : 'published'}
						tagHref={blogTag}
					/>
				{:else}
					<p class="empty">{m.homeNoPosts()}</p>
				{/each}
			</div>
		</section>

		<section id="log" style:animation={enter(450)} aria-labelledby="log-title">
			<h2 id="log-title">{m.devlogTitle()}</h2>
			<p class="intro-text sheet">{m.homeLogIntro()}</p>
			<div class="grid">
				{#each data.log as entry (entry.slug)}
					<TeaserCard
						{...entry}
						href={route('/devlog/[slug]', { slug: entry.slug })}
						tagHref={devlogTag}
					/>
				{:else}
					<p class="empty">{m.homeNoEntries()}</p>
				{/each}
			</div>
		</section>

		<section id="projects" style:animation={enter(600)} aria-labelledby="projects-title">
			<h2 id="projects-title">{m.homeFeaturedProjects()}</h2>
			<div class="grid">
				{#each projects as project (project.href)}
					<TeaserCard {...project} />
				{:else}
					<p class="empty">{m.homeNoProjects()}</p>
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

	.empty,
	.intro-text {
		color: var(--text-2);
	}

	/* One line: a slimmer sheet. */
	.intro-text {
		margin-block-start: var(--size-2);
		padding: var(--size-2) var(--size-3);
	}

	/* Scroll-driven reveal: each section's content is wiped in from the top, like a
	   terminal printing lines, and slides up as it enters the screen. Content already in
	   view on load is past the range, so it's just shown.
	   A wipe (clip-path), not a fade: Lighthouse measures contrast on load, and content
	   below the fold at opacity 0 failed it (1.86:1), even though nobody sees it faded.
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
			clip-path: inset(0 0 100% 0);
			translate: 0 var(--size-6);
		}
		to {
			clip-path: inset(0);
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
