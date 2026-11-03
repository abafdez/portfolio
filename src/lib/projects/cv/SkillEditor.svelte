<script lang="ts">
	// The skills of one profile, to change for its CV: every skill of every group (not
	// only the profile's), each with a box for "on the CV", its wording and ↑ ↓ to move
	// it, plus my own. Every change is stored as a change to the YAML (edits.svelte.ts).
	import { tick } from 'svelte';
	import { flip } from 'svelte/animate';
	import { prefersReducedMotion } from 'svelte/motion';
	import type { CvGroup, CvSkills } from './cv.ts';
	import type { Item, SkillEdits } from './edits.svelte.ts';

	let {
		skills,
		edits,
		profile
	}: { skills: CvSkills; edits: SkillEdits; profile: { id: string; name: string } } = $props();

	// Where the last move put a skill, for screen readers (the list moves silently).
	let status = $state('');

	const name = (row: Item) => ('own' in row ? row.own.text || 'your new skill' : row.skill.name);

	// The row and its button move in the page (Svelte moves the <li>), and a moved
	// element loses the focus. So the focus goes back to the same button in the moved
	// row, or the other arrow once the row reaches the top or the bottom (that one is
	// disabled then, and a disabled button can't take the focus).
	async function move(group: CvGroup, row: Item, by: -1 | 1, list: HTMLElement) {
		edits.move(group, profile.id, row.key, by);
		const rows = edits.items(group, profile.id);
		const place = rows.findIndex(({ key }) => key === row.key) + 1;
		status = `${name(row)}: ${place} of ${rows.length} in ${group.name}.`;
		await tick();
		const moved = list.querySelector(`[data-key="${CSS.escape(row.key)}"]`);
		const [up, down] = moved?.querySelectorAll<HTMLButtonElement>('.move button') ?? [];
		const pressed = by === -1 ? up : down;
		(pressed?.disabled ? (by === -1 ? down : up) : pressed)?.focus();
	}

	// A new skill gets the focus, so I can type it straight away. tick() waits until its
	// input is on the page.
	async function add(group: CvGroup, list: HTMLElement) {
		const id = edits.add(group.name, profile.id);
		await tick();
		list.querySelector<HTMLInputElement>(`[data-key="${CSS.escape(id)}"] input`)?.focus();
	}

	// The row and its button are gone: the focus goes to "Add", nearby, not to <body>.
	function remove(group: CvGroup, id: string, list: HTMLElement) {
		edits.remove(group.name, profile.id, id);
		list.parentElement?.querySelector<HTMLButtonElement>('.add')?.focus();
	}
</script>

<p class="note">
	Untick a skill to leave it out of this CV, change its wording, move it with ↑ ↓, or add your own.
	Only for {profile.name}, only in this browser.
</p>

<!-- Visually hidden, read out when it changes. -->
<p class="visually-hidden" role="status">{status}</p>

{#each skills.groups as group (group.name)}
	{@const rows = edits.items(group, profile.id)}
	{@const count = edits.printed(group, profile.id).length}
	<!-- name: details with the same name are an accordion, built into HTML: opening one
	     closes the others. No JS. -->
	<details name="cv-skill-groups">
		<summary>{group.name} <span class="note">({count} on the CV)</span></summary>
		<ul>
			<!-- Keyed by the skill's name (or my skill's id): when the order changes,
			     Svelte moves the <li>s instead of rewriting their contents, and flip
			     slides them from where they were to where they go. -->
			{#each rows as row, i (row.key)}
				<li data-key={row.key} animate:flip={{ duration: prefersReducedMotion.current ? 0 : 200 }}>
					{#if 'skill' in row}
						{@const skill = row.skill}
						<!-- Function bindings, as in the Awesome filter: a getter and a setter, so
						     the checkbox and the text field read and write the edits. -->
						<input
							type="checkbox"
							aria-label="{skill.name} on the CV"
							bind:checked={
								() => edits.included(skill, profile.id),
								(value) => edits.include(skill, profile.id, value)
							}
						/>
						<input
							class="text"
							aria-label="Wording for {skill.name}"
							placeholder={skill.label}
							bind:value={
								() => edits.label(skill, profile.id),
								(text) => edits.relabel(skill, profile.id, text)
							}
						/>
					{:else}
						{@const own = row.own}
						<span class="mine" aria-hidden="true">+</span>
						<input
							class="text"
							aria-label="Your skill in {group.name}"
							bind:value={
								() => own.text, (text) => edits.rename(group.name, profile.id, own.id, text)
							}
						/>
					{/if}
					<span class="move">
						<button
							type="button"
							aria-label="Move {name(row)} up"
							disabled={i === 0}
							onclick={(event) => move(group, row, -1, event.currentTarget.closest('ul')!)}
							>↑</button
						>
						<button
							type="button"
							aria-label="Move {name(row)} down"
							disabled={i === rows.length - 1}
							onclick={(event) => move(group, row, 1, event.currentTarget.closest('ul')!)}>↓</button
						>
						{#if 'own' in row}
							<button
								type="button"
								aria-label="Remove {name(row)}"
								onclick={(event) => remove(group, row.key, event.currentTarget.closest('ul')!)}
								>✕</button
							>
						{/if}
					</span>
				</li>
			{/each}
		</ul>
		<button
			class="add"
			type="button"
			onclick={(event) => add(group, event.currentTarget.parentElement!.querySelector('ul')!)}
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

	/* Three columns on every row, so mine line up with the YAML's: the box (or the +),
	   the text, the buttons. */
	li {
		display: grid;
		grid-template-columns: 1.5rem minmax(0, 1fr) auto;
		align-items: center;
		gap: var(--size-2);
	}

	.text {
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

	.mine {
		justify-self: center;
		font-family: var(--font-label);
		color: var(--brand);
	}

	/* A skill that's off: its wording dims, so the list reads like the CV. */
	li:has([type='checkbox']:not(:checked)) .text {
		color: var(--text-2);
		text-decoration: line-through;
	}

	.move {
		display: flex;
		gap: var(--size-1);
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

		&:hover:not(:disabled) {
			background: var(--surface-3);
		}

		/* Disabled is information here (already at the top or the bottom), so it dims
		   but stays readable. */
		&:disabled {
			color: var(--text-2);
			cursor: default;
		}
	}

	/* Square, at least 24px: arrows don't need the text padding. */
	.move button {
		min-inline-size: 1.75rem;
		margin: 0;
		padding: var(--size-1);
	}
</style>
