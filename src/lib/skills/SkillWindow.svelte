<script lang="ts">
	// One group of skills as a terminal window that collapses to a preview: its name, a
	// line about it, a few skills as chips and every icon in the title bar.
	// Windows start collapsed and open by themselves as they come into view; once the
	// visitor opens or closes one, that's their choice, kept for their next visit.
	// Without JS every window is open (the CSS below), and the title bar does nothing.
	import type { Attachment } from 'svelte/attachments';
	import Icon from './Icon.svelte';
	import Skill from './Skill.svelte';
	import { spotlight } from './spotlight.ts';
	import type { Group } from './skills.ts';

	// open: how the window starts in the prerendered page. The server can't know what's
	// on screen, so the page opens the first one, the one you see when it loads.
	let { group, open: openAtFirst = false }: { group: Group; open?: boolean } = $props();

	// Only the first value of openAtFirst, on purpose: after that, open is the visitor's.
	// svelte-ignore state_referenced_locally
	let open = $state(openAtFirst);
	// True once the JS runs: until then the CSS decides what's hidden (see the styles).
	let ready = $state(false);
	// The visitor chose: don't open it by itself any more.
	let chosen = false;

	// How many skills a collapsed window shows as chips.
	const preview = 5;

	// Per visitor, in their browser: { "web": true, "tools": false }. Storage can be
	// missing or blocked (private windows), so every use is wrapped, and without it
	// the windows just don't remember.
	const key = 'about-windows';

	function saved(): Record<string, boolean> {
		try {
			return JSON.parse(localStorage.getItem(key) ?? '{}');
		} catch {
			return {};
		}
	}

	function toggle() {
		open = !open;
		chosen = true;
		try {
			localStorage.setItem(key, JSON.stringify({ ...saved(), [group.id]: open }));
		} catch {
			// Not remembered, that's all.
		}
	}

	// On the window: restore the visitor's choice, or open it when it reaches the top
	// two thirds of the screen. A region, not a line: a fast scroll can jump over a line,
	// but where it stops, a window on screen is inside the region.
	const watch: Attachment<HTMLElement> = (section) => {
		const choice = saved()[group.id];
		if (choice !== undefined) {
			open = choice;
			chosen = true;
		}
		ready = true;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (!entry.isIntersecting || chosen) return;
				open = true;
				observer.disconnect();
			},
			{ rootMargin: '0px 0px -33% 0px' }
		);
		observer.observe(section);
		return () => observer.disconnect();
	};

	// Find in page (Ctrl+F) can look inside a hidden="until-found" list, and fires
	// beforematch on it just before showing a match: open the window then.
	const openOnFind: Attachment<HTMLElement> = (list) => {
		const show = () => (open = true);
		list.addEventListener('beforematch', show);
		return () => list.removeEventListener('beforematch', show);
	};
</script>

<section
	class="window"
	aria-labelledby={group.id}
	data-open={open || undefined}
	data-ready={ready || undefined}
	{@attach watch}
>
	<!-- The title bar is the button. Its name for a screen reader is the hidden group
	     name plus the hint ("Web development: collapse"), and aria-expanded says the
	     state; the lights, the path and the icons are decoration. -->
	<button
		class="titlebar"
		type="button"
		aria-expanded={open}
		aria-controls="{group.id}-skills"
		onclick={toggle}
	>
		<span class="lights" aria-hidden="true"><i></i><i></i><i></i></span>
		<span class="path" aria-hidden="true">alfonso@portfolio: ~/skills/{group.id}</span>
		<!-- Collapsed, the window shows what's inside in its title bar, like a dock. -->
		<span class="dock" aria-hidden="true">
			{#each group.skills as skill (skill.name)}
				{#if skill.icon}
					<span style:--hue={skill.hue} style:--chroma={skill.chroma}>
						<Icon icon={skill.icon} size="1rem" />
					</span>
				{/if}
			{/each}
		</span>
		<span class="hint">
			<span class="visually-hidden">{group.name}: </span>{open ? 'collapse' : 'expand'}
			<span aria-hidden="true">{open ? '[-]' : '[+]'}</span>
		</span>
	</button>

	<div class="screen">
		<h2 id={group.id}><Icon icon={group.icon} />{group.name}</h2>
		<p class="description">{group.description}</p>

		<!-- The preview: the first few skills by name. Only while collapsed. -->
		<ul class="chips">
			{#each group.skills.slice(0, preview) as skill (skill.name)}
				<li style:--hue={skill.hue} style:--chroma={skill.chroma}>
					{#if skill.icon}<Icon icon={skill.icon} size="1rem" />{/if}{skill.name}
				</li>
			{/each}
			{#if group.skills.length > preview}
				<li class="more">+{group.skills.length - preview} more</li>
			{/if}
		</ul>

		<!-- hidden="until-found": hidden, but find in page still searches it (and
		     openOnFind opens the window). Only once the JS runs: before, the CSS hides
		     it, and without JS nothing does. -->
		<div
			class="list"
			id="{group.id}-skills"
			hidden={ready && !open ? 'until-found' : undefined}
			{@attach openOnFind}
		>
			<!-- spotlight: a glow follows the pointer over the rows (spotlight.ts). -->
			<ul class="skills spotlight" {@attach spotlight}>
				{#each group.skills as skill (skill.name)}
					<Skill {skill} />
				{/each}
			</ul>
		</div>
	</div>
</section>

<style>
	.window {
		margin-block-start: var(--size-8);
		overflow: clip;
		border: var(--border-size-1) solid var(--surface-3);
		border-radius: var(--radius-3);
		background: var(--surface-1);
	}

	/* A button that looks like a title bar: the whole bar is the click target. */
	.titlebar {
		display: flex;
		align-items: center;
		gap: var(--size-3);
		inline-size: 100%;
		padding: var(--size-2) var(--size-3);
		border: none;
		border-block-end: var(--border-size-1) solid var(--surface-3);
		background: var(--surface-2);
		font-family: var(--font-label);
		font-size: var(--font-size-0);
		color: var(--text-2);
		text-align: start;
		cursor: pointer;

		&:hover {
			color: var(--text-1);
		}
	}

	/* Open, the three lights are on, like a Mac's active window. */
	.lights {
		display: flex;
		gap: var(--size-1);

		& i {
			inline-size: 0.6rem;
			block-size: 0.6rem;
			border-radius: var(--radius-round);
			background: var(--window-close);
		}

		& i:nth-child(2) {
			background: var(--window-minimize);
		}

		& i:nth-child(3) {
			background: var(--window-zoom);
		}
	}

	/* contain: inline-size makes the path (and the dock) count as 0 wide when the page
	   measures its content, so they're cut instead of widening the page at 320px. */
	.path,
	.dock {
		flex: 1;
		contain: inline-size;
		overflow: hidden;
		white-space: nowrap;
	}

	.path {
		text-overflow: ellipsis;
	}

	.dock {
		display: none;
		gap: var(--size-2);

		& > span {
			display: flex;
			color: oklch(from var(--icon-tone) l var(--chroma, c) var(--hue, h));
		}
	}

	.hint {
		display: flex;
		gap: var(--size-2);
		white-space: nowrap;
	}

	.screen {
		padding: var(--size-3) var(--size-3) var(--size-4);

		& > :not(.list) {
			padding-inline: var(--size-3);
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

	.description {
		margin-block-start: var(--size-1);
		color: var(--text-2);
	}

	.chips {
		display: none;
		flex-wrap: wrap;
		gap: var(--size-2);
		margin-block-start: var(--size-3);
		list-style: none;

		& li {
			display: inline-flex;
			align-items: center;
			gap: var(--size-2);
			padding: var(--size-1) var(--size-2);
			border: var(--border-size-1) solid var(--surface-3);
			border-radius: var(--radius-2);
			font-family: var(--font-code);
			font-size: var(--font-size-0);
			color: var(--text-1);

			& :global(svg) {
				color: oklch(from var(--icon-tone) l var(--chroma, c) var(--hue, h));
			}
		}

		& .more {
			border-style: dashed;
			color: var(--text-2);
		}
	}

	/* The skills are one list of rows, like a terminal prints them. The small gap keeps
	   the glowing borders of two rows from touching. */
	.skills {
		display: grid;
		gap: var(--size-1);
		margin-block-start: var(--size-4);
		padding: 0;
		list-style: none;
	}

	/* Collapsed, which only happens with JS (scripting: enabled; without it, every
	   window stays open and the hint is gone). The path gives way to the dock, the
	   preview shows, and only the yellow light, minimize, stays on. */
	@media (scripting: enabled) {
		.window:not([data-open]) {
			& .path {
				display: none;
			}

			& .dock,
			& .chips {
				display: flex;
			}

			& .lights i:not(:nth-child(2)) {
				background: var(--surface-3);
			}
		}

		/* Before the JS starts, the CSS hides a collapsed window's list; once it runs,
		   hidden="until-found" does instead (a display: none here would stop find in
		   page from looking inside). */
		.window:not([data-open]):not([data-ready]) .list {
			display: none;
		}
	}

	@media (scripting: none) {
		.hint {
			display: none;
		}

		.titlebar {
			cursor: default;
		}
	}

	/* Visually hidden, still read. */
	.visually-hidden {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
</style>
