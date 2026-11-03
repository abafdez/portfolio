<script lang="ts">
	// One group of skills as a terminal window that collapses to a preview: its name, a
	// line about it, a few skills as chips and every icon in the title bar.
	// Windows start collapsed and open by themselves as they come into view; once the
	// visitor opens or closes one, that's their choice until they leave or reload (not
	// saved: a reload starts fresh).
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
	// Whether the list is hidden (hidden="until-found"). It follows open, except when the
	// window collapses with motion: then it waits for the animation to end (collapsed()),
	// so the list is still there to shrink.
	// svelte-ignore state_referenced_locally
	let shut = $state(!openAtFirst);
	// True once the JS runs: until then, the hidden attribute stays off.
	let ready = $state(false);
	// The visitor chose: don't open it by itself any more.
	let chosen = false;
	// The icons don't fit in the title bar: they loop, like a carousel.
	let loop = $state(false);

	// How many skills a collapsed window shows as chips.
	const preview = 5;
	let icons = $derived(group.skills.filter((skill) => skill.icon));

	const motion = () => matchMedia('(prefers-reduced-motion: no-preference)').matches;

	function show(value: boolean, animate = true) {
		open = value;
		if (value || !animate || !motion()) shut = !value;
	}

	// The end of the collapse: hide the list for real. Only the list's own row size
	// counts; transitions inside it (a bar's bump, a row's glow) bubble up here too.
	function collapsed(event: TransitionEvent) {
		if (event.target !== event.currentTarget) return;
		if (event.propertyName === 'grid-template-rows' && !open) shut = true;
	}

	function toggle() {
		show(!open);
		chosen = true;
	}

	// On the window: open it when it reaches the top two thirds of the screen, unless
	// the visitor already chose. A region, not a line: a fast scroll can jump over a
	// line, but where it stops, a window on screen is inside the region.
	const watch: Attachment<HTMLElement> = (section) => {
		ready = true;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (!entry.isIntersecting || chosen) return;
				show(true);
				observer.disconnect();
			},
			{ rootMargin: '0px 0px -33% 0px' }
		);
		observer.observe(section);
		return () => observer.disconnect();
	};

	// Find in page (Ctrl+F) can look inside a hidden="until-found" list, and fires
	// beforematch on it just before showing a match: open the window then, at once
	// (the browser scrolls to the match straight away).
	const openOnFind: Attachment<HTMLElement> = (list) => {
		const found = () => show(true, false);
		list.addEventListener('beforematch', found);
		return () => list.removeEventListener('beforematch', found);
	};

	// Do the icons fit in the title bar? Measured again whenever the dock changes size
	// (a resize, or the dock appearing when the window collapses; hidden, it's 0 wide).
	const fit: Attachment<HTMLElement> = (dock) => {
		const observer = new ResizeObserver(() => {
			const copy = dock.querySelector<HTMLElement>('.copy');
			if (copy && dock.clientWidth > 0) loop = copy.offsetWidth > dock.clientWidth;
		});
		observer.observe(dock);
		return () => observer.disconnect();
	};
</script>

<section class="window" aria-labelledby={group.id} data-open={open || undefined} {@attach watch}>
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
		<!-- Collapsed, the window shows what's inside in its title bar, like a dock. When
		     the icons don't fit, a second copy follows the first and the two slide by,
		     like the marquee at the top of the page (LogoMarquee.svelte). -->
		<span
			class="dock"
			aria-hidden="true"
			data-loop={loop || undefined}
			style:--count={icons.length}
			{@attach fit}
		>
			<span class="track">
				{#each loop ? [0, 1] : [0] as copy (copy)}
					<span class="copy">
						{#each icons as skill, i (skill.name)}
							<span style:--hue={skill.hue} style:--chroma={skill.chroma} style:--i={i}>
								<Icon icon={skill.icon!} size="1rem" />
							</span>
						{/each}
					</span>
				{/each}
			</span>
		</span>
		<span class="hint">
			<span class="visually-hidden">{group.name}: </span>{open ? 'collapse' : 'expand'}
			<span aria-hidden="true">{open ? '[-]' : '[+]'}</span>
		</span>
	</button>

	<div class="screen">
		<h2 id={group.id}><Icon icon={group.icon} />{group.name}</h2>
		<p class="description">{group.description}</p>

		<!-- Two rows that swap as the window opens and closes: the preview (the first few
		     skills by name) grows while the list shrinks, and back. Each is a one-row
		     grid whose row goes from 1fr (its height) to 0fr (nothing), which CSS can
		     animate, unlike height: auto. -->
		<div class="reveal preview">
			<div>
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
			</div>
		</div>

		<!-- hidden="until-found": hidden, but find in page still searches it (and
		     openOnFind opens the window). Only once the JS runs; without JS every list
		     shows. -->
		<div class="reveal content" ontransitionend={collapsed}>
			<div
				class="list"
				id="{group.id}-skills"
				hidden={ready && shut ? 'until-found' : undefined}
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

	/* One light is on, a little bigger: green (zoom) while open, yellow (minimize) while
	   collapsed, below. Red (close) stays off: nothing closes. */
	.lights {
		display: flex;
		gap: var(--size-1);

		& i {
			inline-size: 0.6rem;
			block-size: 0.6rem;
			border-radius: var(--radius-round);
			background: var(--surface-3);
		}

		& i:nth-child(3) {
			background: var(--window-zoom);
			scale: 1.2;
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
	}

	.track {
		display: flex;
		inline-size: max-content;
	}

	.copy {
		display: flex;
		gap: var(--size-2);

		& > span {
			display: flex;
			color: oklch(from var(--icon-tone) l var(--chroma, c) var(--hue, h));
		}
	}

	/* Looping: the gap between the two copies, and edges that fade out. */
	.dock[data-loop] {
		mask-image: linear-gradient(
			to right,
			transparent,
			#000 var(--size-3),
			#000 calc(100% - var(--size-3)),
			transparent
		);

		& .copy {
			padding-inline-end: var(--size-2);
		}
	}

	.hint {
		display: flex;
		gap: var(--size-2);
		white-space: nowrap;
	}

	.screen {
		padding: var(--size-3) var(--size-3) var(--size-4);

		& > :not(.content) {
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

	/* A one-row grid: 1fr is the row's content height, 0fr is nothing, and the browser
	   can animate between the two. The child needs min-block-size: 0 (or the row can't
	   go below its content) and overflow: clip, with a small margin so the rows'
	   glowing borders aren't cut at the edges. Open: the list shows, the preview not. */
	.reveal {
		display: grid;

		& > * {
			min-block-size: 0;
			overflow: clip;
			overflow-clip-margin: var(--size-1);
		}
	}

	.preview {
		grid-template-rows: 0fr;

		& > * {
			opacity: 0;
		}
	}

	.content {
		grid-template-rows: 1fr;
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--size-2);
		margin-block-start: var(--size-3);
		padding: 0;
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
	   preview grows, the list shrinks, and the yellow light takes over from the green. */
	@media (scripting: enabled) {
		.window:not([data-open]) {
			& .path {
				display: none;
			}

			& .dock {
				display: block;
			}

			& .preview {
				grid-template-rows: 1fr;

				& > * {
					opacity: 1;
				}
			}

			& .content {
				grid-template-rows: 0fr;

				& > * {
					opacity: 0;
				}
			}

			& .lights i:nth-child(3) {
				background: var(--surface-3);
				scale: 1;
			}

			& .lights i:nth-child(2) {
				background: var(--window-minimize);
				scale: 1.2;
			}
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

	/* The motion. With reduced motion, everything above still happens, at once. */
	@media (prefers-reduced-motion: no-preference) {
		.reveal {
			transition: grid-template-rows 400ms var(--ease-out-3);

			& > * {
				transition: opacity 400ms var(--ease-out-3);
			}
		}

		/* A spring easing overshoots and settles back: the light pops as it turns on. */
		.lights i {
			transition:
				background-color 300ms,
				scale 500ms var(--ease-spring-3);
		}

		/* The icons pop into the title bar one after another as the window collapses
		   (an animation runs when its element goes from display: none to shown). */
		.copy > span {
			animation: dock-in 500ms var(--ease-spring-3) both;
			animation-delay: calc(var(--i) * 30ms);
		}

		/* 1.5s per icon, so a longer group doesn't slide faster. */
		.dock[data-loop] .track {
			animation: slide calc(var(--count) * 1.5s) linear infinite;
		}
	}

	@keyframes dock-in {
		from {
			opacity: 0;
			translate: 0 0.5rem;
			scale: 0.5;
		}
	}

	@keyframes slide {
		to {
			translate: -50%;
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
