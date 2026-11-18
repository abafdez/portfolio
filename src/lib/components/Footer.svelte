<script lang="ts">
	// The footer: a thin bar at the end of every page, and a panel it opens (a popover
	// rising from the bottom like a sheet) with who I am, how to hire me and my links.
	// A small handle at the bottom of the window opens it too: barely there while you
	// read, it grows and shows its label as the pointer gets near the bottom edge.
	import { onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import X from '@lucide/svelte/icons/x';
	import Briefcase from '@lucide/svelte/icons/briefcase-business';
	import FolderGit from '@lucide/svelte/icons/folder-git-2';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import UserRound from '@lucide/svelte/icons/user-round';
	import Mail from '@lucide/svelte/icons/mail';
	import MessageSquare from '@lucide/svelte/icons/message-square';
	import ChevronUp from '@lucide/svelte/icons/chevron-up';
	import { siGithub } from 'simple-icons';
	import BrandIcon from '#lib/components/BrandIcon.svelte';
	import { spotlight } from '#lib/spotlight.ts';
	import { m, route } from '#lib/i18n/index.ts';
	import { email, profiles, repository } from '#lib/links.ts';
	import { looks } from '#lib/components/hire/looks.ts';
	import photo from '#lib/assets/avatar.jpg?enhanced';

	const linkedin = profiles.find(({ label }) => label === 'LinkedIn')!;
	const github = profiles.find(({ label }) => label === 'GitHub')!;

	// Which look the top card has (components/hire/looks.ts): a random one the first
	// time the panel opens, then the next one each time, per visit. -1: not opened yet,
	// so no look's code is downloaded until then.
	let look = $state(-1);
	const next = () =>
		(look = look < 0 ? Math.floor(Math.random() * looks.length) : (look + 1) % looks.length);

	function toggled(event: ToggleEvent) {
		if (event.newState === 'open') next();
	}

	let panel = $state<HTMLElement>();
	// The email button's link, put together once the page runs (see email in links.ts).
	let mailto = $state<string>();
	let hint = $state<HTMLElement>();

	// A link in the panel goes to another page: the panel closes behind it.
	afterNavigate(() => panel?.hidePopover());

	// --near on the handle: 0 far from the bottom edge, 1 at it (the last 10rem of the
	// window). Written straight to the style, once a frame at most: it changes on every
	// pointer move, and Svelte state would re-render for nothing. Only with a real
	// pointer; on touch the handle just stays small.
	onMount(() => {
		if (email.user && email.domain) mailto = `mailto:${email.user}@${email.domain}`;
		if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
		const reach = 10 * parseFloat(getComputedStyle(document.documentElement).fontSize);
		let frame = 0;
		let y = 0;
		const update = () => {
			frame = 0;
			const near = Math.min(1, Math.max(0, 1 - (innerHeight - y) / reach));
			hint?.style.setProperty('--near', near.toFixed(3));
		};
		const onMove = (event: PointerEvent) => {
			y = event.clientY;
			frame ||= requestAnimationFrame(update);
		};
		const onLeave = () => hint?.style.setProperty('--near', '0');
		addEventListener('pointermove', onMove, { passive: true });
		document.documentElement.addEventListener('pointerleave', onLeave);
		return () => {
			removeEventListener('pointermove', onMove);
			document.documentElement.removeEventListener('pointerleave', onLeave);
			cancelAnimationFrame(frame);
		};
	});
</script>

<footer>
	<!-- The handle: a shortcut for the mouse, hidden from screen readers and the tab
	     order, since the bar's own button (below) does the same and is always reachable. -->
	<div class="hint-wrap">
		<button
			class="hint"
			type="button"
			popovertarget="about-panel"
			aria-hidden="true"
			tabindex="-1"
			bind:this={hint}
		>
			<span class="grip"></span>
			<span class="label">{m.footerMore()}</span>
		</button>
	</div>

	<div class="inner">
		<p><small>&copy; {new Date().getFullYear()} Alfonso Baeza. {m.footerRights()}</small></p>
		<button class="more" type="button" popovertarget="about-panel">
			<UserRound aria-hidden="true" />
			{m.footerMore()}
			<ChevronUp class="chevron" aria-hidden="true" />
		</button>
		<ul>
			{#each profiles as profile (profile.label)}
				<li><a href={profile.url} rel="external">{profile.label}</a></li>
			{/each}
		</ul>
	</div>

	<!-- The panel. A popover: Escape and a click outside close it, focus goes back to
	     the button that opened it. -->
	<div
		id="about-panel"
		class="panel"
		popover
		bind:this={panel}
		ontoggle={toggled}
		aria-labelledby="about-title"
	>
		<div class="panel-inner">
			<div class="top">
				<h2 id="about-title" class="visually-hidden">{m.footerMore()}</h2>
				<button
					class="close"
					type="button"
					popovertarget="about-panel"
					popovertargetaction="hide"
					aria-label={m.footerClose()}
					title={m.footerClose()}
				>
					<X aria-hidden="true" />
				</button>
			</div>
			<!-- The top card, in one of its looks. {#key}: a new look is a new component,
			     so its entrance animations run again. -->
			<div class="look">
				{#if look >= 0}
					{#key look}
						{#await looks[look].load() then { default: Look }}
							<Look {photo} linkedin={linkedin.url} github={github.url} />
						{/await}
					{/key}
				{/if}
			</div>

			<!-- The columns' borders: a light that follows the pointer round the first and
			     third (spotlight sets --x / --y on each column), a beam running round the
			     second. The third's links also slide and pop their icons. -->
			<div class="columns" {@attach spotlight}>
				<section aria-labelledby="footer-who">
					<h3 id="footer-who">{m.footerWho()}</h3>
					<p>{m.aboutLead()}</p>
					<p>
						<a class="button secondary" href={route('/about')}>
							<UserRound aria-hidden="true" />
							{m.footerMoreAbout()}
							<ArrowRight class="nudge" aria-hidden="true" />
						</a>
					</p>
				</section>

				<section aria-labelledby="footer-hire">
					<h3 id="footer-hire">{m.footerHire()}</h3>
					<p>{m.footerHireText()}</p>
					<p>{mailto ? m.footerHireHowEmail() : m.footerHireHow()}</p>
					<p class="buttons">
						<a class="button shine" href={linkedin.url} rel="external">
							<MessageSquare aria-hidden="true" />
							{m.aboutAskLinkedIn()}
						</a>
						{#if mailto}
							<a class="button secondary" href={mailto}>
								<Mail aria-hidden="true" />
								{m.footerEmail()}
							</a>
						{/if}
					</p>
				</section>

				<section aria-labelledby="footer-elsewhere">
					<h3 id="footer-elsewhere">{m.footerElsewhere()}</h3>
					<!-- GitHub's own logo (Simple Icons); LinkedIn's isn't there (removed at
					     LinkedIn's request), so a briefcase stands for it. -->
					<ul class="links">
						<li>
							<a href={github.url} rel="external">
								<span class="icon"><BrandIcon icon={siGithub} size="1.25rem" /></span>
								GitHub
								<ArrowUpRight class="arrow" aria-hidden="true" />
							</a>
						</li>
						<li>
							<a href={linkedin.url} rel="external">
								<span class="icon"><Briefcase aria-hidden="true" /></span>
								LinkedIn
								<ArrowUpRight class="arrow" aria-hidden="true" />
							</a>
						</li>
						<li>
							<a href={repository} rel="external">
								<span class="icon"><FolderGit aria-hidden="true" /></span>
								{m.footerSource()}
								<ArrowUpRight class="arrow" aria-hidden="true" />
							</a>
						</li>
					</ul>
					<p class="built">{m.footerBuilt()}</p>
				</section>
			</div>
		</div>
	</div>
</footer>

<style>
	/* The page's paper behind it, like the header's bar: small text, so no grid. */
	footer {
		border-block-start: var(--border-size-1) solid var(--surface-3);
		background-color: var(--surface-1);
		font-family: var(--font-label);
		color: var(--text-2);
	}

	.inner {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: center;
		gap: var(--size-2) var(--size-4);
		max-inline-size: var(--content-width);
		margin-inline: auto;
		padding: var(--size-4) var(--size-3);
	}

	ul {
		display: flex;
		gap: var(--size-4);
		padding: 0;
		list-style: none;
	}

	/* The bar's button opens the panel: the one thing in the footer that should catch
	   the eye. A brand pill with a person and an arrow up; a light sweeps across it
	   now and then, and it lifts on hover. */
	.more {
		position: relative;
		display: inline-flex;
		align-items: center;
		gap: var(--size-2);
		overflow: hidden;
		padding: var(--size-2) var(--size-4);
		border: none;
		border-radius: var(--radius-round);
		background: var(--brand);
		color: var(--surface-1);
		font: inherit;
		font-size: var(--font-size-1);
		cursor: pointer;
		box-shadow: 0 var(--size-1) var(--size-3) color-mix(in oklab, var(--brand) 30%, transparent);

		& :global(svg) {
			inline-size: 1.15rem;
			block-size: 1.15rem;
		}

		&:hover {
			background: color-mix(in oklab, var(--brand) 85%, var(--text-1));
		}
	}

	/* The light: a slanted bright band crossing the button. */
	.more::after,
	.shine::after {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(
			105deg,
			transparent 35%,
			color-mix(in oklab, var(--surface-1) 45%, transparent) 50%,
			transparent 65%
		);
		translate: -120% 0;
		pointer-events: none;
	}

	@media (prefers-reduced-motion: no-preference) {
		.more {
			transition:
				translate 300ms var(--ease-spring-3),
				box-shadow 300ms var(--ease-out-3);

			&:hover {
				translate: 0 -3px;
				box-shadow: 0 var(--size-2) var(--size-4) color-mix(in oklab, var(--brand) 40%, transparent);
			}
		}

		/* Every 5 s the light crosses (the last 30% of the loop); the arrow bobs. */
		.more::after,
		.shine::after {
			animation: shine 5s var(--ease-in-out-3) infinite;
		}

		.more :global(.chevron) {
			animation: chevron-bob 1.6s var(--ease-in-out-3) infinite;
		}
	}

	@keyframes shine {
		0%,
		70% {
			translate: -120% 0;
		}
		100% {
			translate: 120% 0;
		}
	}

	@keyframes chevron-bob {
		50% {
			translate: 0 -3px;
		}
	}

	/* --- The handle --- */

	/* Only where it can hide itself once the footer is in view (below): elsewhere the
	   bar's button is enough. */
	.hint-wrap {
		display: none;
		position: fixed;
		inset-block-end: 0;
		inset-inline-start: 50%;
		translate: -50% 0;
		z-index: 1;
	}

	/* Far from the bottom: a short, faint grip, like a sheet's handle on a phone. Near
	   it (--near up to 1): the grip lengthens and takes the brand colour, the pill
	   lifts and its label appears. The button is bigger than it looks, so it's easy to
	   hit. */
	.hint {
		--near: 0;
		display: grid;
		justify-items: center;
		gap: var(--size-1);
		padding: var(--size-2) var(--size-4) var(--size-2);
		border: none;
		border-radius: var(--radius-3) var(--radius-3) 0 0;
		background: color-mix(in oklab, var(--surface-1) calc(var(--near) * 90%), transparent);
		color: var(--brand);
		font: inherit;
		font-size: var(--font-size-0);
		cursor: pointer;
		box-shadow: 0 0 var(--size-4)
			color-mix(in oklab, var(--text-1) calc(var(--near) * 12%), transparent);
		transition:
			background-color 200ms var(--ease-out-3),
			box-shadow 200ms var(--ease-out-3);
	}

	.grip {
		inline-size: calc(var(--size-7) + var(--near) * var(--size-7));
		block-size: 4px;
		border-radius: var(--radius-round);
		background: color-mix(in oklab, var(--brand) calc(30% + var(--near) * 70%), var(--text-2));
		opacity: calc(0.35 + var(--near) * 0.65);
		transition:
			inline-size 200ms var(--ease-out-3),
			opacity 200ms var(--ease-out-3);
	}

	.label {
		opacity: var(--near);
		white-space: nowrap;
		transition: opacity 200ms var(--ease-out-3);
	}

	/* Hovered or at the very bottom: fully there. */
	.hint:hover {
		--near: 1;
	}

	@media (prefers-reduced-motion: no-preference) {
		.hint {
			translate: 0 calc((1 - var(--near)) * 1.4rem);
			transition:
				translate 300ms var(--ease-spring-2),
				background-color 200ms var(--ease-out-3),
				box-shadow 200ms var(--ease-out-3);
		}

		/* A slow breath while it's far, so it's noticed without being in the way. */
		.grip {
			animation: grip-breathe 3s var(--ease-in-out-3) infinite;
		}
	}

	@keyframes grip-breathe {
		50% {
			scale: 1.15 1;
		}
	}

	/* Scroll-driven, on the footer's own view timeline: the bar's content rises in as
	   the footer enters, and the handle fades out over the same range, so it's gone
	   when the bar (and its button) is on screen. On a short page the footer is already
	   in view, so the handle never shows. */
	@supports (animation-timeline: view()) {
		footer {
			view-timeline: --footer;
		}

		.hint-wrap {
			display: block;
			animation: hint-out linear both;
			animation-timeline: --footer;
			animation-range: entry 0% entry 60%;
		}

		@media (prefers-reduced-motion: no-preference) {
			.inner {
				animation: footer-in linear both;
				animation-timeline: --footer;
				animation-range: entry 0% entry 100%;
			}
		}
	}

	@keyframes footer-in {
		from {
			opacity: 0;
			translate: 0 var(--size-5);
		}
	}

	@keyframes hint-out {
		to {
			opacity: 0;
			visibility: hidden;
		}
	}

	/* --- The panel --- */

	/* A sheet across the bottom of the window, as wide as the page. */
	.panel {
		inset: auto 0 0;
		inline-size: min(var(--content-width), 100%);
		max-block-size: min(85vh, 48rem);
		margin: 0 auto;
		padding: 0;
		/* Scrolls up and down when it's taller than the window, never sideways: a look
		   that turns in 3D or slides in may poke past the edges for a moment. */
		overflow: hidden auto;
		border: var(--border-size-1) solid var(--surface-3);
		border-block-end: none;
		border-radius: var(--radius-3) var(--radius-3) 0 0;
		background: var(--surface-1);
		color: var(--text-1);
		box-shadow: var(--shadow-float);
		font-family: var(--font-body);
	}

	.panel::backdrop {
		background: color-mix(in oklab, var(--surface-1) 45%, transparent);
	}

	.panel-inner {
		padding: var(--size-5) var(--size-5) var(--size-7);
	}

	.top {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		gap: var(--size-3);
	}

	/* Room for the look while it loads, so the columns don't jump. */
	.look {
		min-block-size: 14rem;
		margin-block-start: var(--size-4);
	}

	.close {
		display: grid;
		place-items: center;
		inline-size: var(--size-7);
		block-size: var(--size-7);
		padding: var(--size-1);
		border: none;
		border-radius: var(--radius-round);
		background: none;
		color: var(--text-2);
		cursor: pointer;

		&:hover {
			background: var(--surface-2);
			color: var(--text-1);
		}
	}

	/* As many 16rem columns as fit: three side by side on a wide screen. */
	.columns {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
		gap: var(--size-5);
		margin-block-start: var(--size-5);
	}

	section {
		position: relative;
		display: grid;
		align-content: start;
		gap: var(--size-2);
		padding: var(--size-4);
		border: var(--border-size-1) solid var(--surface-3);
		border-radius: var(--radius-2);
		background: var(--surface-2);
	}

	/* The light on a border: a 1px ring over the column's own border (the mask keeps
	   only the padding box's edge: content-box excluded from the whole). Its
	   background is the effect. Decoration over the border, not under any text. */
	section::before {
		content: '';
		position: absolute;
		inset: -1px;
		padding: 1px;
		border-radius: inherit;
		mask:
			linear-gradient(#000 0 0) content-box exclude,
			linear-gradient(#000 0 0);
		pointer-events: none;
	}

	/* 1 and 3. Who I am and Elsewhere: a light that follows the pointer (anywhere over
	   the three columns). */
	section:is(:nth-child(1), :nth-child(3))::before {
		background: radial-gradient(
			14rem circle at var(--x, -100rem) var(--y, -100rem),
			var(--brand),
			transparent 70%
		);
	}

	/* 2. Hire me: a beam that runs round the border, again and again. A conic gradient
	   whose start angle is a registered property, so it can be animated. */
	@property --beam {
		syntax: '<angle>';
		inherits: false;
		initial-value: 0deg;
	}

	section:nth-child(2)::before {
		background: conic-gradient(
			from var(--beam),
			transparent 0 70%,
			var(--brand) 85%,
			transparent 100%
		);
	}

	@media (prefers-reduced-motion: no-preference) {
		.panel:popover-open section:nth-child(2)::before {
			animation: beam 4s linear infinite;
		}
	}

	/* Still, the beam is a plain brand border. */
	@media (prefers-reduced-motion: reduce) {
		section:nth-child(2)::before {
			background: var(--brand);
		}
	}

	@keyframes beam {
		to {
			--beam: 360deg;
		}
	}

	h3 {
		font-size: var(--font-size-2);
	}

	section p {
		color: var(--text-2);
	}

	/* The panel's buttons: a brand pill (Ask on LinkedIn, with the same light as the
	   bar's button) or an outlined one (More about me, Email me), each with an icon. */
	.buttons {
		display: flex;
		flex-wrap: wrap;
		gap: var(--size-2);
	}

	.button {
		position: relative;
		display: inline-flex;
		align-items: center;
		gap: var(--size-2);
		overflow: hidden;
		padding: var(--size-2) var(--size-4);
		border: var(--border-size-1) solid var(--brand);
		border-radius: var(--radius-round);
		background: var(--brand);
		color: var(--surface-1);
		font-family: var(--font-label);
		font-size: var(--font-size-0);
		text-decoration: none;

		& :global(svg) {
			flex: none;
			inline-size: 1.1rem;
			block-size: 1.1rem;
		}

		&:hover {
			background: color-mix(in oklab, var(--brand) 85%, var(--text-1));
		}

		&.secondary {
			background: var(--surface-1);
			color: var(--brand);

			&:hover {
				background: color-mix(in oklab, var(--brand) 10%, var(--surface-1));
			}
		}
	}

	@media (prefers-reduced-motion: no-preference) {
		.button {
			transition: translate 300ms var(--ease-spring-3);

			&:hover {
				translate: 0 -2px;
			}
		}

		.button :global(.nudge) {
			transition: translate 300ms var(--ease-spring-3);
		}

		.button:hover :global(.nudge) {
			translate: 3px 0;
		}
	}

	/* 3. Elsewhere: each link a row with its icon in a tile. Hovered, the row slides,
	   the tile takes the brand colour and its icon pops, and an arrow shows the way
	   out. */
	.links {
		display: grid;
		gap: var(--size-1);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.links a {
		display: flex;
		align-items: center;
		gap: var(--size-3);
		padding: var(--size-1);
		border-radius: var(--radius-2);
		text-decoration: none;
		color: var(--text-1);

		&:is(:hover, :focus-visible) {
			background: var(--surface-1);
			color: var(--brand);
		}
	}

	.icon {
		display: grid;
		place-items: center;
		flex: none;
		inline-size: 2.25rem;
		block-size: 2.25rem;
		border: var(--border-size-1) solid var(--surface-3);
		border-radius: var(--radius-2);
		background: var(--surface-1);
		color: var(--text-1);

		& :global(svg) {
			inline-size: 1.25rem;
			block-size: 1.25rem;
		}
	}

	.links a:is(:hover, :focus-visible) .icon {
		border-color: var(--brand);
		background: var(--brand);
		color: var(--surface-1);
	}

	.links :global(.arrow) {
		inline-size: 1rem;
		block-size: 1rem;
		margin-inline-start: auto;
		opacity: 0;
	}

	.links a:is(:hover, :focus-visible) :global(.arrow) {
		opacity: 1;
	}

	@media (prefers-reduced-motion: no-preference) {
		.links a {
			transition: translate 300ms var(--ease-spring-3);

			&:is(:hover, :focus-visible) {
				translate: var(--size-2) 0;
			}
		}

		.links a:is(:hover, :focus-visible) .icon :global(svg) {
			animation: icon-pop 450ms var(--ease-spring-4);
		}

		.links :global(.arrow) {
			translate: calc(-1 * var(--size-2)) var(--size-1);
			transition:
				opacity 200ms var(--ease-out-3),
				translate 300ms var(--ease-spring-3);
		}

		.links a:is(:hover, :focus-visible) :global(.arrow) {
			translate: 0;
		}
	}

	@keyframes icon-pop {
		40% {
			scale: 1.35;
			rotate: -12deg;
		}
	}

	.built {
		margin-block-start: var(--size-2);
		font-size: var(--font-size-0);
	}

	/* Rising from the bottom, the same way out: @starting-style is where it starts when
	   it appears, allow-discrete keeps it in the top layer until it's down. */
	@media (prefers-reduced-motion: no-preference) {
		.panel {
			translate: 0 100%;
			transition:
				translate 420ms var(--ease-spring-2),
				display 420ms allow-discrete,
				overlay 420ms allow-discrete;
		}

		.panel:popover-open {
			translate: 0;

			@starting-style {
				translate: 0 100%;
			}
		}

		.panel::backdrop {
			background: transparent;
			transition:
				background-color 300ms var(--ease-out-2),
				display 420ms allow-discrete,
				overlay 420ms allow-discrete;
		}

		.panel:popover-open::backdrop {
			background: color-mix(in oklab, var(--surface-1) 45%, transparent);

			@starting-style {
				background: transparent;
			}
		}

		/* The three columns follow the sheet up, one after the other. */
		.panel:popover-open section {
			animation: column-in 420ms var(--ease-out-3) both;
		}

		.panel:popover-open section:nth-child(2) {
			animation-delay: 60ms;
		}

		.panel:popover-open section:nth-child(3) {
			animation-delay: 120ms;
		}
	}

	@keyframes column-in {
		from {
			opacity: 0;
			translate: 0 var(--size-5);
		}
	}

	/* Not printed: its links and hints mean nothing on paper. */
	@media print {
		footer {
			display: none;
		}
	}
</style>
