<script lang="ts">
	import MessageSquare from '@lucide/svelte/icons/message-square';
	import { siGithub } from 'simple-icons';
	import BrandIcon from '#lib/components/BrandIcon.svelte';
	import SectionNav from '#lib/components/SectionNav.svelte';
	import { profiles } from '#lib/links.ts';
	import Skill from '#lib/skills/Skill.svelte';
	import { groups } from '#lib/skills/skills.ts';

	const [github, linkedin] = profiles;
	const sections = groups.map(({ id, name }) => ({ id, label: name }));
</script>

<svelte:head>
	<title>About · AB</title>
	<meta
		name="description"
		content="What I work with: languages, frameworks, tools, ways of working and AI workflows."
	/>
</svelte:head>

<!-- The CV is shared on request, not published: it has my contact details. -->
{#snippet cv()}
	<ul class="cv">
		<li>
			<a href={linkedin.url} rel="external"
				><MessageSquare size="1.25rem" aria-hidden="true" />Ask on LinkedIn</a
			>
		</li>
		<li>
			<a href={github.url} rel="external"><BrandIcon icon={siGithub} size="1.25rem" />GitHub</a>
		</li>
	</ul>
{/snippet}

<!-- The landing's layout: on wide screens the intro stays put on the left while the
     skills scroll on the right. -->
<div class="about">
	<div class="intro">
		<h1>About me</h1>
		<p class="lead">
			More than 15 years making technology work for small businesses: networks, hardware, automation
			and websites. I studied web development, I'm certified in mainframe Natural, Adabas and COBOL,
			and I'm now going deep on the modern front end, learning in public on this site.
		</p>
		<p>Want my full CV? I send it on request.</p>
		{@render cv()}
		<div class="toc"><SectionNav {sections} /></div>
	</div>

	<div class="groups">
		{#each groups as group (group.id)}
			<section aria-labelledby={group.id}>
				<h2 id={group.id}><group.icon aria-hidden="true" />{group.name}</h2>
				<ul class="skills">
					{#each group.skills as skill (skill.name)}
						<Skill {skill} />
					{/each}
				</ul>
			</section>
		{/each}

		<section aria-labelledby="cv-title">
			<h2 id="cv-title">Want my full CV?</h2>
			<p>It has the dates, the companies and the details. Send me a message and I'll send it.</p>
			{@render cv()}
		</section>
	</div>
</div>

<style>
	.intro p {
		margin-block-start: var(--size-3);
		max-inline-size: var(--size-content-2);
		color: var(--text-2);
	}

	.lead {
		font-size: var(--font-size-3);
	}

	/* Same buttons as the hero's links, with an icon. */
	.cv {
		display: flex;
		flex-wrap: wrap;
		gap: var(--size-2);
		margin-block-start: var(--size-3);
		padding: 0;
		list-style: none;

		& a {
			display: inline-flex;
			align-items: center;
			gap: var(--size-2);
			padding: var(--size-2) var(--size-3);
			border: var(--border-size-1) solid var(--surface-3);
			border-radius: var(--radius-2);
			background: var(--surface-2);
			font-family: var(--font-label);
			text-decoration: none;

			&:hover {
				background: var(--surface-3);
			}
		}
	}

	/* The group's icon before its name, in the brand color, sized with the heading. */
	h2 {
		display: flex;
		align-items: center;
		gap: var(--size-3);

		& :global(svg) {
			flex: none;
			inline-size: 1em;
			block-size: 1em;
			color: var(--brand);
		}
	}

	section {
		margin-block-start: var(--size-8);

		& > p {
			margin-block-start: var(--size-2);
			color: var(--text-2);
		}
	}

	/* align-items: start: an open skill grows on its own, not its whole row. */
	.skills {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 16rem), 1fr));
		align-items: start;
		gap: var(--size-3);
		margin-block-start: var(--size-4);
		padding: 0;
		list-style: none;
	}

	.toc {
		display: none;
	}

	/* Two columns on wide screens, like the landing. Unlike the landing, the whole intro
	   is too tall to stay put next to nine groups, so only the nav sticks: the intro
	   scrolls away (the CV link is repeated at the end), the nav stays. */
	@media (min-width: 64rem) {
		.about {
			display: grid;
			grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
			gap: var(--size-9);
		}

		.toc {
			display: block;
			margin-block-start: var(--size-7);
		}
	}

	/* The intro column stretches to the full height of the row (grid's default), so
	   the nav inside it has room to stick all the way down. */
	@media (min-width: 64rem) and (min-height: 36rem) {
		.toc {
			position: sticky;
			inset-block-start: var(--header-space);
		}
	}
</style>
