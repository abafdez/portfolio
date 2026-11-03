<script lang="ts">
	// The CV builder: pick the kind of job, fill in who you are, and the CV next to the
	// form follows. The skills come from the site's data (the page's server load); the
	// rest is typed here and kept in this browser only (details.svelte.ts), with my
	// changes to the skills (edits.svelte.ts).
	import { onMount, tick } from 'svelte';
	import type { CvSkills } from './cv.ts';
	import { CvDetails, type Field } from './details.svelte.ts';
	import { SkillEdits } from './edits.svelte.ts';
	import { inputs, problem } from './inputs.ts';
	import SkillEditor from './SkillEditor.svelte';
	import { isObject } from './storage.ts';

	let { skills }: { skills: CvSkills } = $props();

	// The profiles never change after the page loads, so the first value is all it needs.
	// svelte-ignore state_referenced_locally
	const ids = skills.profiles.map(({ id }) => id);
	const cv = new CvDetails(ids);
	const edits = new SkillEdits(ids);

	// The edits first: cv.load() sets loaded, and that lets the effects save.
	onMount(() => {
		edits.load();
		cv.load();
	});

	// Every change goes to localStorage: keeping something outside Svelte in step with
	// the state is what $effect is for. save() reads every field (JSON.stringify), so the
	// effect runs again whenever any of them changes. Not before load(), or the empty
	// form would overwrite what was saved.
	// Not an oninput on the form: a <select> fires input before change, and bind:value
	// on a select updates on change, so the save was one pick behind.
	$effect(() => {
		if (cv.loaded) cv.save();
	});

	// The same for the skill edits, in an effect of its own: a change to one doesn't
	// write the other again.
	$effect(() => {
		if (cv.loaded) edits.save();
	});

	let profile = $derived(skills.profiles.find(({ id }) => id === cv.values.profile)!);
	let groups = $derived(edits.groups(skills, profile.id));
	let fullName = $derived(`${cv.values.name} ${cv.values.surnames}`.trim());
	let place = $derived(
		[cv.values.city, cv.values.state, cv.values.postalCode].filter(Boolean).join(', ')
	);
	let contact = $derived([cv.values.phone, cv.values.email, place].filter(Boolean));

	// What a collapsed section says about itself in its summary line.
	const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;
	let aboutStatus = $derived.by(() => {
		const problems = Object.values(errors).filter(Boolean).length;
		const missing = inputs.filter(({ name, required }) => required && !cv.values[name].trim());
		if (problems) return `${plural(problems, 'field')} to fix`;
		if (missing.length) return `${plural(missing.length, 'required field')} left`;
		return fullName;
	});
	let skillCount = $derived(groups.reduce((sum, group) => sum + group.skills.length, 0));

	// A letter, but a short one: it goes at the top of the CV.
	const letterMax = 600;

	// What the last import or print did, for the status line.
	let message = $state('');

	let form: HTMLFormElement | undefined = $state();

	// The fields with a problem, and what it is ('' once it's fixed). A field is first
	// checked when you leave it, so it doesn't turn red while you're still typing; from
	// then on it's checked on every keystroke, so the message goes as soon as it's right.
	// (CSS has this rule built in, :user-invalid, but the message needs JS anyway.)
	let errors: Partial<Record<Field, string>> = $state({});

	function check(field: EventTarget | null) {
		if (field instanceof HTMLInputElement && field.name) {
			errors[field.name as Field] = problem(field);
		}
	}

	function recheck(event: Event) {
		const field = event.target;
		if (field instanceof HTMLInputElement && field.name in errors) check(field);
	}

	// Every field at once; the first with a problem, if any.
	function checkAll() {
		const fields = [...(form?.querySelectorAll<HTMLInputElement>('input[name]') ?? [])];
		fields.forEach(check);
		return fields.find((field) => !field.validity.valid);
	}

	// A field in a closed <details> can't take the focus: open its section first.
	function reveal(field: HTMLElement) {
		const section = field.closest('details');
		if (section) section.open = true;
		field.focus();
	}

	// A CV without a name or a way to reach you shouldn't go out: show what's missing and
	// take the focus there (a screen reader then reads its message), instead of printing.
	function printCv() {
		const first = checkAll();
		if (first) {
			message = 'Some fields need fixing first.';
			reveal(first);
			return;
		}
		message = '';
		print();
	}

	// A download made in the page: the file is a Blob, URL.createObjectURL gives it a
	// blob: URL, and a link with download saves it instead of opening it. The URL is
	// released once the click has started the download.
	// The file holds the details as localStorage does, plus the skill edits under
	// "skills", so each read() can take its part.
	function exportFile() {
		const data = JSON.stringify({ ...cv.values, skills: edits.all }, null, '\t');
		const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
		const link = document.createElement('a');
		link.href = url;
		link.download = 'cv-details.json';
		link.click();
		setTimeout(() => URL.revokeObjectURL(url));
	}

	// The file is read in the browser (File.text()); it's never uploaded. read() checks
	// it like it checks localStorage, and the $effect saves what it took.
	async function importFile(event: Event & { currentTarget: HTMLInputElement }) {
		// currentTarget is only set while the event is being handled: after the await it's
		// null, so keep the input now.
		const input = event.currentTarget;
		const file = input.files?.[0];
		if (!file) return;
		try {
			const data = JSON.parse(await file.text());
			const count = cv.read(data);
			const profiles = isObject(data) ? edits.read(data.skills) : 0;
			message =
				count || profiles
					? `Loaded ${count} fields and skill edits for ${profiles} ${profiles === 1 ? 'profile' : 'profiles'} from ${file.name}.`
					: `No CV fields in ${file.name}.`;
			// A file can hold anything that's a string: show what needs fixing. tick() waits
			// for the fields to show the new values before they're checked.
			if (count) await tick().then(checkAll);
		} catch {
			message = `${file.name} isn't a JSON file.`;
		}
		// Empty again, so picking the same file twice still fires change.
		input.value = '';
	}

	// The browser names the PDF after the page title, so while printing it's the CV's:
	// "Name Surnames - CV - Mainframe.pdf", not "CV builder · Projects · AB.pdf".
	let pageTitle = '';
	function beforePrint() {
		pageTitle = document.title;
		document.title = `${fullName || 'CV'} - CV - ${profile.name}`;
	}
	function afterPrint() {
		document.title = pageTitle;
	}
</script>

<svelte:window onbeforeprint={beforePrint} onafterprint={afterPrint} />

<div class="builder">
	<!-- onsubmit: a <button> in a form submits it unless it says type="button", and so
	     can Enter in a field. A form without an action sends its fields to the same URL,
	     as ?name=…&phone=…, into the address bar and the history. Nothing is ever sent.
	     novalidate: no browser bubbles, we show our own messages. The fields still check
	     themselves (validity). focusout and input bubble, so the form hears every field. -->
	<form
		bind:this={form}
		novalidate
		onsubmit={(event) => event.preventDefault()}
		onfocusout={(event) => check(event.target)}
		oninput={recheck}
	>
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

		<!-- Sections that fold away once they're done. name="cv-form" makes them an
		     accordion (opening one closes the other), built into HTML. Closed, each says
		     how it's doing in its summary. The legend repeats the summary for screen
		     readers (it names the group of fields), hidden for the eye. -->
		<details name="cv-form" open>
			<summary>About you <span class="note">{aboutStatus}</span></summary>
			<!-- autocomplete: the browser can fill these from what it knows about you, and
		     tells password managers and screen readers what each field is. -->
			<fieldset disabled={!cv.loaded}>
				<legend class="visually-hidden">About you</legend>
				<p class="note wide">* required</p>
				{#each inputs as input (input.name)}
					{@const error = errors[input.name]}
					<!-- The message sits outside the label, or it would become part of the field's
				     name. aria-describedby links it instead: a screen reader reads it after
				     the name, and aria-invalid says "invalid". The * is for the eye; required
				     tells a screen reader. -->
					<div class="field">
						<label>
							<span
								>{input.label}{#if input.required}<span class="required" aria-hidden="true">*</span
									>{/if}</span
							>
							<input
								name={input.name}
								type={input.type ?? 'text'}
								bind:value={cv.values[input.name]}
								autocomplete={input.autocomplete}
								inputmode={input.inputmode}
								required={input.required}
								pattern={input.pattern}
								aria-invalid={error ? 'true' : undefined}
								aria-describedby={error ? `${input.name}-error` : undefined}
							/>
						</label>
						{#if error}
							<span class="error" id="{input.name}-error">{error}</span>
						{/if}
					</div>
				{/each}
				<label class="wide">
					Short letter
					<textarea bind:value={cv.values.letter} maxlength={letterMax} rows="6"></textarea>
					<span class="count">{cv.values.letter.length} / {letterMax}</span>
				</label>
			</fieldset>
		</details>

		<details name="cv-form">
			<summary>Skills <span class="note">{skillCount} on the CV</span></summary>
			<fieldset class="skills" disabled={!cv.loaded}>
				<legend class="visually-hidden">Skills</legend>
				<SkillEditor {skills} {edits} {profile} />
			</fieldset>
		</details>

		<p class="note">
			Saved in this browser only. Nothing you type here is sent anywhere. Export your details to
			keep a copy: clearing the browser's data deletes them.
			<noscript>The builder needs JavaScript.</noscript>
		</p>
	</form>

	<!-- The right column: what to do with the CV, then the CV. -->
	<div class="preview">
		<!-- Over the CV it acts on, outside the form: these buttons don't edit anything.
		     A fieldset still works outside a form, and still disables them all at once.
		     type="button" anyway, in case they ever move back into a form. -->
		<fieldset class="actions-box" disabled={!cv.loaded}>
			<legend>Your CV</legend>
			<div class="actions">
				<!-- The print dialog has "Save as PDF": a PDF with real text, which is what
				     an applicant tracking system needs. -->
				<button class="primary" type="button" onclick={printCv}>Print or save as PDF</button>
				<button type="button" onclick={exportFile}>Export details</button>
				<!-- A file input looks like nothing else on the site, so it's hidden and its
				     label is the button (like the radios on /about). -->
				<label class="file">
					Import details
					<input type="file" accept=".json,application/json" onchange={importFile} />
				</label>
			</div>
			<p class="note" role="status">{message}</p>
		</fieldset>

		<!-- The CV itself, and all that prints (the print styles below). Plain text in one
	     column, standard headings, no icons: what an applicant tracking system can
	     read. -->
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
							{group.skills.join(', ')}
						</li>
					{/each}
				</ul>
			</section>
		</article>
	</div>
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

	/* One column: the editor's rows and the row of buttons need the whole width. */
	.skills,
	.actions-box {
		display: block;
	}

	/* A section's title, and how it's doing in a smaller line next to it. */
	summary {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--size-1) var(--size-3);
		padding-block: var(--size-2);
		border-block-end: var(--border-size-1) solid var(--surface-3);
		font-family: var(--font-label);
		color: var(--text-1);
		cursor: pointer;

		/* display: flex hides the marker (it belongs to display: list-item), so draw
		   our own, turning when the section opens. */
		&::before {
			content: '▸';
			color: var(--brand);
		}
	}

	details[open] > summary {
		margin-block-end: var(--size-4);

		&::before {
			content: '▾';
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

	.field {
		display: grid;
		gap: var(--size-1);
		align-content: start;
	}

	/* A problem: the border turns the error color, twice as thick (an inset shadow, so
	   nothing moves), and the message says what's wrong: color alone isn't enough for
	   people who can't tell red apart. Styled from aria-invalid, the same attribute a
	   screen reader hears, so the two can't disagree. */
	[aria-invalid='true'] {
		border-color: var(--error);
		box-shadow: inset 0 0 0 1px var(--error);
	}

	/* A margin, not a space: Svelte trims the whitespace at the start of an element. */
	.required {
		margin-inline-start: 0.5ch;
	}

	.error {
		font-family: var(--font-label);
		font-size: var(--font-size-0);
		color: var(--error);
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

	.preview {
		display: grid;
		gap: var(--size-4);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--size-2);
	}

	/* The buttons, and the label that stands in for the file input. */
	.actions > * {
		display: inline-flex;
		align-items: center;
		padding: var(--size-2) var(--size-3);
		border: var(--border-size-1) solid var(--surface-3);
		border-radius: var(--radius-2);
		background: var(--surface-2);
		font-family: var(--font-label);
		font-size: var(--font-size-0);
		color: var(--text-1);
		cursor: pointer;

		&:hover {
			background: var(--surface-3);
		}
	}

	/* The main action: the brand color, the text in the page's (like a picked tag). */
	.actions .primary {
		border-color: var(--brand);
		background: var(--brand);
		color: var(--surface-1);

		&:hover {
			background: var(--brand);
			opacity: 0.9;
		}
	}

	/* Hidden, still focusable: Enter or Space on it opens the file picker, and the label
	   shows its focus. */
	.file {
		&:has(:focus-visible) {
			outline: 2px solid var(--brand);
			outline-offset: 3px;
		}

		& input {
			position: absolute;
			opacity: 0;
			pointer-events: none;
			inline-size: 1px;
		}
	}

	/* On paper: only the CV, in one column. The site's header, footer and background
	   hide themselves (their own print styles), the page header is hidden by the route,
	   and tokens.css switches to the light theme. Sizes in points, the unit of paper. */
	@media print {
		form,
		.actions-box {
			display: none;
		}

		.preview {
			display: block;
		}

		.builder {
			display: block;
			margin: 0;
		}

		.cv {
			padding: 0;
			border: none;
			background: none;
			font-size: 10.5pt;
			line-height: 1.4;

			& h2 {
				font-size: 20pt;
			}

			& .headline {
				font-size: 12pt;
			}

			& h3 {
				font-size: 12pt;
				/* Never a heading alone at the bottom of a page. */
				break-after: avoid;
			}

			& li,
			& .letter {
				break-inside: avoid;
			}
		}
	}

	/* The sheet: A4, the size used in Spain and most of the world. */
	@page {
		size: A4;
		margin: 15mm;
	}
</style>
