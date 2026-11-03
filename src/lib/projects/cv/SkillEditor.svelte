<script lang="ts">
	// The skills of one profile, to change for its CV: every skill of every group (not
	// only the profile's), each with a box for "on the CV" and its wording, then my own.
	// Every change is stored as a change to the YAML (edits.svelte.ts).
	import { tick } from 'svelte';
	import type { CvSkills } from './cv.ts';
	import type { SkillEdits } from './edits.svelte.ts';

	let {
		skills,
		edits,
		profile
	}: { skills: CvSkills; edits: SkillEdits; profile: { id: string; name: string } } = $props();

	// A new skill gets the focus, so I can type it straight away. tick() waits until its
	// input is on the page.
	async function add(group: string, details: HTMLElement) {
		edits.add(group, profile.id);
		await tick();
		details.querySelector<HTMLInputElement>('.own:last-child input')?.focus();
	}

	// The row and its button are gone: the focus goes to "Add", nearby, not to <body>.
	function remove(group: string, index: number, details: HTMLElement) {
		edits.remove(group, profile.id, index);
		details.querySelector<HTMLButtonElement>('.add')?.focus();
	}
</script>

<p class="note">
	Untick a skill to leave it out of this CV, change its wording, or add your own. Only for
	{profile.name}, only in this browser.
</p>

{#each skills.groups as group (group.name)}
	{@const own = edits.added(group.name, profile.id)}
	{@const count =
		group.skills.filter((skill) => edits.included(skill, profile.id)).length +
		own.filter((text) => text.trim()).length}
	<!-- Closed: ten groups of open lists would bury the rest of the form. -->
	<details>
		<summary>{group.name} <span class="note">({count} on the CV)</span></summary>
		<ul>
			{#each group.skills as skill (skill.name)}
				<!-- Function bindings, as in the Awesome filter: a getter and a setter, so the
				     checkbox and the text field read and write the edits, not a variable. -->
				<li>
					<input
						type="checkbox"
						aria-label="{skill.name} on the CV"
						bind:checked={
							() => edits.included(skill, profile.id),
							(value) => edits.include(skill, profile.id, value)
						}
					/>
					<input
						aria-label="Wording for {skill.name}"
						placeholder={skill.label}
						bind:value={
							() => edits.label(skill, profile.id), (text) => edits.relabel(skill, profile.id, text)
						}
					/>
				</li>
			{/each}
			<!-- My own skills have no key of their own: the index is what identifies them. -->
			{#each own as _, i (i)}
				<li class="own">
					<input
						aria-label="Your skill {i + 1} in {group.name}"
						bind:value={() => own[i], (text) => edits.rename(group.name, profile.id, i, text)}
					/>
					<button
						type="button"
						onclick={(event) => remove(group.name, i, event.currentTarget.closest('details')!)}
						>Remove <span class="visually-hidden">your skill {i + 1}</span></button
					>
				</li>
			{/each}
		</ul>
		<button
			class="add"
			type="button"
			onclick={(event) => add(group.name, event.currentTarget.closest('details')!)}
			>Add a skill <span class="visually-hidden">to {group.name}</span></button
		>
	</details>
{/each}

<button type="button" onclick={() => edits.reset(profile.id)}
	>Reset the skills for {profile.name}</button
>

<style>
	.note {
		font-size: var(--font-size-0);
		color: var(--text-2);
	}

	details {
		border-block-end: var(--border-size-1) solid var(--surface-3);
	}

	summary {
		padding-block: var(--size-2);
		font-family: var(--font-label);
		color: var(--text-1);
		cursor: pointer;
	}

	ul {
		display: grid;
		gap: var(--size-2);
		padding: 0;
		list-style: none;
	}

	li {
		display: flex;
		align-items: center;
		gap: var(--size-2);
	}

	/* The text field takes the rest of the row, and can shrink below its default size
	   (inputs are about 20 characters wide unless told). */
	li input:not([type='checkbox']) {
		flex: 1;
		min-inline-size: 0;
		padding: var(--size-1) var(--size-2);
		border: var(--border-size-1) solid var(--surface-3);
		border-radius: var(--radius-2);
		background-color: var(--surface-2);
		font: inherit;
		color: var(--text-1);
	}

	/* 24px, WCAG's minimum target size. accent-color tints the native checkbox. */
	input[type='checkbox'] {
		inline-size: 1.5rem;
		block-size: 1.5rem;
		accent-color: var(--brand);
	}

	/* A skill that's off: its wording dims, so the list reads like the CV. */
	li:has([type='checkbox']:not(:checked)) input:not([type='checkbox']) {
		color: var(--text-2);
		text-decoration: line-through;
	}

	button {
		margin-block: var(--size-2);
		padding: var(--size-1) var(--size-2);
		border: var(--border-size-1) solid var(--surface-3);
		border-radius: var(--radius-2);
		background: none;
		font-family: var(--font-label);
		font-size: var(--font-size-0);
		color: var(--text-1);
		cursor: pointer;

		&:hover {
			background: var(--surface-3);
		}
	}

	li button {
		margin: 0;
	}

	.visually-hidden {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
</style>
