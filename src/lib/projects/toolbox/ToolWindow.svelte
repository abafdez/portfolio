<script lang="ts">
	// A tool on the toolbox dashboard, drawn as a small terminal window like the skill
	// windows on /about (SkillWindow.svelte): a title bar with its path, then its icon,
	// name and description. The whole window is one link (the title's, stretched, as in
	// TeaserCard), and its parts fly into the tool's header when it opens (morph.ts).
	import TagList from '#lib/components/TagList.svelte';
	import { route, text } from '#lib/i18n/index.ts';
	import type { Tool } from './tools.ts';

	let { tool }: { tool: Tool } = $props();
	const Icon = $derived(tool.icon);
</script>

<article data-morph-card>
	<!-- Decoration: the lights and the path say nothing the title doesn't. -->
	<div class="titlebar" aria-hidden="true">
		<span class="lights"><i></i><i></i><i></i></span>
		<span class="path">~/toolbox/{tool.slug}</span>
	</div>
	<div class="screen">
		<span class="icon" aria-hidden="true"><Icon size={28} /></span>
		<h3 data-morph="title">
			<a href={route('/projects/toolbox/[tool]', { tool: tool.slug })}>{text(tool.title)}</a>
		</h3>
		<p data-morph="description">{text(tool.description)}</p>
		<div data-morph="tags"><TagList tags={tool.tags} --tags-space="var(--size-3)" /></div>
	</div>
</article>

<style>
	article {
		position: relative;
		overflow: clip;
		border: var(--border-size-1) solid var(--surface-3);
		border-radius: var(--radius-3);
		background: var(--surface-1);
		transition: border-color 0.2s;
	}

	.titlebar {
		display: flex;
		align-items: center;
		gap: var(--size-3);
		padding: var(--size-2) var(--size-3);
		border-block-end: var(--border-size-1) solid var(--surface-3);
		background: var(--surface-2);
		font-family: var(--font-label);
		font-size: var(--font-size-0);
		color: var(--text-2);
	}

	.lights {
		display: flex;
		gap: var(--size-1);

		& i {
			inline-size: 0.6rem;
			block-size: 0.6rem;
			border-radius: var(--radius-round);
			background: var(--surface-3);
		}
	}

	/* contain: inline-size: a long path is cut, never widens the page at 320px. */
	.path {
		flex: 1;
		contain: inline-size;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	/* Icon on the left, the text beside it. */
	.screen {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--size-1) var(--size-3);
		padding: var(--size-4);

		& > :not(.icon) {
			grid-column: 2;
		}
	}

	.icon {
		grid-row: span 3;
		color: var(--brand);
	}

	h3 {
		font-size: var(--font-size-3);
	}

	p {
		color: var(--text-2);
	}

	/* The whole window is the link: the title's ::after covers it. */
	h3 a::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
	}

	/* Hovered or focused, the window "opens": its zoom light comes on. */
	article:has(h3 a:is(:hover, :focus-visible)) {
		border-color: var(--brand);

		& .lights i:nth-child(3) {
			background: var(--window-zoom);
		}
	}

	article:has(h3 a:focus-visible) {
		outline: var(--border-size-2) solid var(--brand);
		outline-offset: var(--border-size-2);

		& h3 a {
			outline: none;
		}
	}

	@media (prefers-reduced-motion: no-preference) {
		.lights i {
			transition:
				background-color 0.2s,
				scale 0.3s var(--ease-spring-3);
		}

		article:has(h3 a:hover) .lights i:nth-child(3) {
			scale: 1.3;
		}
	}
</style>
