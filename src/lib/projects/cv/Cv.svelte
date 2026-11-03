<script lang="ts">
	// The CV builder: pick the kind of job, fill in who you are, and the CV next to the
	// form follows. The skills come from the site's data (the page's server load); the
	// rest is typed here and kept in this browser only (details.svelte.ts).
	import { onMount } from 'svelte';
	import { skillsFor, type CvSkills } from './cv.ts';
	import { CvDetails } from './details.svelte.ts';

	let { skills }: { skills: CvSkills } = $props();

	// The profiles never change after the page loads, so the first value is all it needs.
	// svelte-ignore state_referenced_locally
	const cv = new CvDetails(skills.profiles.map(({ id }) => id));

	onMount(() => cv.load());

	// Every change goes to localStorage: keeping something outside Svelte in step with
	// the state is what $effect is for. save() reads every field (JSON.stringify), so the
	// effect runs again whenever any of them changes. Not before load(), or the empty
	// form would overwrite what was saved.
	// Not an oninput on the form: a <select> fires input before change, and bind:value
	// on a select updates on change, so the save was one pick behind.
	$effect(() => {
		if (cv.loaded) cv.save();
	});

	let profile = $derived(skills.profiles.find(({ id }) => id === cv.values.profile)!);
	let groups = $derived(skillsFor(skills, profile.id));
	let fullName = $derived(`${cv.values.name} ${cv.values.surnames}`.trim());
	let place = $derived(
		[cv.values.city, cv.values.state, cv.values.postalCode].filter(Boolean).join(', ')
	);
	let contact = $derived([cv.values.phone, cv.values.email, place].filter(Boolean));

	// A letter, but a short one: it goes at the top of the CV.
	const letterMax = 600;
</script>

<div class="builder">
	<!-- onsubmit: a <button> in a form submits it unless it says type="button", and so
	     can Enter in a field. A form without an action sends its fields to the same URL,
	     as ?name=…&phone=…, into the address bar and the history. Nothing is ever sent. -->
	<form onsubmit={(event) => event.preventDefault()}>
		<!-- Disabled until the saved values are in, and for good without JS (it can't
		     save or preview anything then). A disabled fieldset disables every field. -->
		<fieldset disabled={!cv.loaded}>
			<legend>Job</legend>
			<label>
				Profile
				<select bind:value={cv.values.profile}>
					{#each skills.profiles as option (option.id)}
						<option value={option.id}>{option.name}</option>
					{/each}
				</select>
			</label>
		</fieldset>

		<!-- autocomplete: the browser can fill these from what it knows about you, and
		     tells password managers and screen readers what each field is. -->
		<fieldset disabled={!cv.loaded}>
			<legend>About you</legend>
			<label>
				Name
				<input bind:value={cv.values.name} autocomplete="given-name" />
			</label>
			<label>
				Surnames
				<input bind:value={cv.values.surnames} autocomplete="family-name" />
			</label>
			<label>
				Phone
				<input type="tel" bind:value={cv.values.phone} autocomplete="tel" />
			</label>
			<label>
				Email
				<input type="email" bind:value={cv.values.email} autocomplete="email" />
			</label>
			<label>
				City
				<input bind:value={cv.values.city} autocomplete="address-level2" />
			</label>
			<label>
				State
				<input bind:value={cv.values.state} autocomplete="address-level1" />
			</label>
			<label>
				Postal code
				<input bind:value={cv.values.postalCode} autocomplete="postal-code" inputmode="numeric" />
			</label>
			<label class="wide">
				Short letter
				<textarea bind:value={cv.values.letter} maxlength={letterMax} rows="6"></textarea>
				<span class="count">{cv.values.letter.length} / {letterMax}</span>
			</label>
		</fieldset>

		<p class="note">
			Saved in this browser only. Nothing you type here is sent anywhere.
			<noscript>The builder needs JavaScript.</noscript>
		</p>
	</form>

	<!-- The CV itself: what will print (a later step hides everything else). Plain text
	     in one column, standard headings, no icons: what an applicant tracking system
	     can read. -->
	<article class="cv" aria-labelledby="cv-name">
		<header>
			<h2 id="cv-name">{fullName || 'Your name'}</h2>
			<p class="headline">{profile.name}</p>
			{#if contact.length}
				<p>{contact.join(' · ')}</p>
			{/if}
		</header>

		{#if cv.values.letter.trim()}
			<section>
				<h3>Summary</h3>
				<p class="letter">{cv.values.letter}</p>
			</section>
		{/if}

		<section>
			<h3>Skills</h3>
			<ul>
				{#each groups as group (group.name)}
					<li>
						<strong>{group.name}:</strong>
						{group.skills.map(({ label }) => label).join(', ')}
					</li>
				{/each}
			</ul>
		</section>
	</article>
</div>

<style>
	/* Form and CV side by side when there's room for both, stacked otherwise. */
	.builder {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr));
		gap: var(--size-6);
		align-items: start;
		margin-block-start: var(--size-6);
	}

	form {
		display: grid;
		gap: var(--size-5);
	}

	fieldset {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 12rem), 1fr));
		gap: var(--size-3);
		padding: 0;
		border: none;

		&:disabled {
			opacity: 0.6;
		}
	}

	legend {
		margin-block-end: var(--size-2);
		font-family: var(--font-label);
		color: var(--text-1);
	}

	label {
		display: grid;
		gap: var(--size-1);
		font-family: var(--font-label);
		font-size: var(--font-size-0);
		color: var(--text-2);
	}

	/* The letter takes the whole row. */
	.wide {
		grid-column: 1 / -1;
	}

	input,
	select,
	textarea {
		padding: var(--size-2) var(--size-3);
		border: var(--border-size-1) solid var(--surface-3);
		border-radius: var(--radius-2);
		background-color: var(--surface-2);
		font: inherit;
		font-family: var(--font-body);
		font-size: var(--font-size-1);
		color: var(--text-1);
	}

	textarea {
		resize: vertical;
	}

	.count {
		justify-self: end;
	}

	.note {
		font-size: var(--font-size-0);
		color: var(--text-2);
	}

	/* A sheet of paper, roughly: a page-like card. */
	.cv {
		padding: var(--size-6);
		border: var(--border-size-1) solid var(--surface-3);
		border-radius: var(--radius-3);
		background: var(--surface-2);

		& h2 {
			font-size: var(--font-size-5);
		}

		& header p {
			margin-block-start: var(--size-1);
			color: var(--text-2);
		}

		& .headline {
			font-size: var(--font-size-2);
			color: var(--text-1);
		}

		& section {
			margin-block-start: var(--size-5);
		}

		& h3 {
			padding-block-end: var(--size-1);
			border-block-end: var(--border-size-1) solid var(--surface-3);
			font-size: var(--font-size-2);
		}

		& ul {
			display: grid;
			gap: var(--size-2);
			margin-block-start: var(--size-3);
			padding: 0;
			list-style: none;
		}

		/* Keeps the line breaks typed in the letter. */
		& .letter {
			margin-block-start: var(--size-3);
			white-space: pre-line;
		}
	}
</style>
