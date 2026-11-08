<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import MessageSquare from '@lucide/svelte/icons/message-square';
	import { siGithub } from 'simple-icons';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import BrandIcon from '#lib/components/BrandIcon.svelte';
	import SectionNav from '#lib/components/SectionNav.svelte';
	import { profiles } from '#lib/links.ts';
	import { m } from '#lib/i18n/index.ts';
	import LogoMarquee from '#lib/skills/LogoMarquee.svelte';
	import SkillWindow from '#lib/skills/SkillWindow.svelte';

	let { data } = $props();

	const [github, linkedin] = profiles;

	// The kind of job picked (?profile=support), or undefined for every skill. Like the
	// Awesome filters: read from the URL once JS runs, written back on every change.
	let profile = $state<string>();
	let ready = $state(false);

	// Each group with only that profile's skills; a group left empty is dropped (and so
	// is its link in the nav).
	let groups = $derived.by(() => {
		const id = profile;
		if (!id) return data.groups;
		return data.groups
			.map((group) => ({ ...group, skills: group.skills.filter((s) => s.profiles.includes(id)) }))
			.filter((group) => group.skills.length);
	});
	let sections = $derived(groups.map(({ id, name }) => ({ id, label: name })));
	let count = $derived(groups.reduce((sum, group) => sum + group.skills.length, 0));
	let total = $derived(data.groups.reduce((sum, group) => sum + group.skills.length, 0));

	onMount(() => {
		// Only a profile the YAML declares: ?profile=nope shows everything.
		const id = page.url.searchParams.get('profile');
		profile = data.profiles.find((p) => p.id === id)?.id;
		ready = true;
	});

	// Shallow: no navigation, replace: no history entry per click. "Everything" has no
	// param, so the plain /about stays a clean URL.
	function pick(id: string | undefined) {
		profile = id;
		const url = new URL(page.url.href);
		if (id) url.searchParams.set('profile', id);
		else url.searchParams.delete('profile');
		goto(url, { shallow: true, replace: true });
	}
</script>

<Seo title={m.aboutTitle()} description={m.aboutDescription()} />

<!-- The CV is shared on request, not published: it has my contact details. -->
{#snippet cv()}
	<ul class="cv">
		<li>
			<a href={linkedin.url} rel="external"
				><MessageSquare size="1.25rem" aria-hidden="true" />{m.aboutAskLinkedIn()}</a
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
		<h1>{m.aboutHeading()}</h1>
		<p class="lead">{m.aboutLead()}</p>
		<p>{m.aboutCvOnRequest()}</p>
		{@render cv()}

		<div class="aside">
			<!-- Radios, not toggle buttons: one profile at a time, and arrow keys move
			     between them. Only with JS, since without it they can't do anything. -->
			{#if ready}
				<fieldset class="profiles">
					<legend>{m.aboutShowSkillsFor()}</legend>
					<div class="options">
						{#each [{ id: undefined, name: m.aboutEverything() }, ...data.profiles] as option (option.id)}
							<label>
								<input
									type="radio"
									name="profile"
									checked={profile === option.id}
									onchange={() => pick(option.id)}
								/>{option.name}
							</label>
						{/each}
					</div>
					<!-- role="status": screen readers announce the count when it changes. -->
					<p role="status">{m.aboutSkillCount({ count, total })}</p>
				</fieldset>
			{/if}
			<div class="toc"><SectionNav {sections} /></div>
		</div>
	</div>

	<div class="groups">
		<!-- Every logo, whatever the profile: it's decoration, and a few logos would leave
		     gaps in the loop. -->
		<LogoMarquee logos={data.logos} />
		<!-- Each group is a terminal window that collapses (SkillWindow.svelte). The first
		     starts open: it's the one on screen when the page loads. -->
		{#each groups as group, i (group.id)}
			<SkillWindow {group} open={i === 0} />
		{/each}

		<section aria-labelledby="cv-title">
			<h2 id="cv-title">{m.aboutCvTitle()}</h2>
			<p>{m.aboutCvText()}</p>
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

	section {
		margin-block-start: var(--size-8);

		& > p {
			margin-block-start: var(--size-2);
			color: var(--text-2);
		}
	}

	/* The radio inputs are hidden but still there (focus, arrow keys, the checked state);
	   the label is what you see, styled from its input with :has(). */
	.profiles {
		margin-block-start: var(--size-6);
		padding: 0;
		border: none;
		font-family: var(--font-label);
		font-size: var(--font-size-0);
		color: var(--text-2);

		& legend {
			margin-block-end: var(--size-1);
		}

		& p {
			margin-block-start: var(--size-2);
		}
	}

	.options {
		display: flex;
		flex-wrap: wrap;
		gap: var(--size-2);

		& label {
			padding: var(--size-1) var(--size-2);
			border: var(--border-size-1) solid var(--surface-3);
			border-radius: var(--radius-2);
			cursor: pointer;

			&:hover {
				color: var(--text-1);
			}

			/* Same as a picked Awesome tag: the brand color, the text in the page's. */
			&:has(:checked) {
				border-color: var(--brand);
				background-color: var(--brand);
				color: var(--surface-1);
			}

			/* The input has the focus, the label shows it (the global ring). */
			&:has(:focus-visible) {
				outline: 2px solid var(--brand);
				outline-offset: 3px;
			}
		}

		& input {
			position: absolute;
			opacity: 0;
			pointer-events: none;
		}
	}

	.toc {
		display: none;
	}

	/* Two columns on wide screens, like the landing. Unlike the landing, the whole intro
	   is too tall to stay put next to nine groups, so only the profiles and the nav
	   stick: the intro scrolls away (the CV link is repeated at the end), they stay. */
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
		.aside {
			position: sticky;
			inset-block-start: var(--header-space);
		}
	}
</style>
