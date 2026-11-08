<script module lang="ts">
	// Exported so pages can type their lists: const sections: Section[] = [...]
	export interface Section {
		id: string;
		label: string;
	}
</script>

<script lang="ts">
	import { m } from '#lib/i18n/index.ts';
	let { sections }: { sections: Section[] } = $props();

	// The id of the section being read. Without JS it stays undefined: the links still
	// jump to their sections, there's just no highlight.
	let current = $state<string>();

	// Scroll-spy: the current section is the last one whose top has passed a line a
	// third of the way down the screen. It's worked out from where the sections are on
	// every scroll, not from events about them crossing the line, so it can't fall out
	// of step however fast you scroll (an IntersectionObserver did: a fast scroll could
	// land the line in the gap between two sections, and the old one stayed).
	// Two edges: before the first section reaches the line, it's already current, and at
	// the very bottom the last one is, since a short last section never reaches the line.
	function update() {
		const line = innerHeight / 3;
		// A few pixels to spare: zoom can leave scrollY a fraction short of the end.
		const atBottom = scrollY + innerHeight >= document.documentElement.scrollHeight - 4;

		let id = sections[0]?.id;
		for (const section of sections) {
			const top = document.getElementById(section.id)?.getBoundingClientRect().top;
			if (top !== undefined && top <= line) id = section.id;
		}
		current = atBottom ? sections.at(-1)?.id : id;
	}

	// Once the page is in the DOM (on load, or a reload halfway down), then on scroll,
	// and whenever the page changes height without a scroll: on /about, a window that
	// opens by itself moves every section below it.
	$effect(() => {
		update();
		const observer = new ResizeObserver(update);
		observer.observe(document.body);
		return () => observer.disconnect();
	});
</script>

<svelte:window onscroll={update} onresize={update} />

<nav aria-label={m.sectionNavLabel()}>
	<ul>
		{#each sections as section (section.id)}
			<li>
				<a href="#{section.id}" aria-current={current === section.id ? 'location' : undefined}>
					{section.label}
				</a>
			</li>
		{/each}
	</ul>
</nav>

<style>
	ul {
		display: grid;
		gap: var(--size-3);
		padding: 0;
		list-style: none;
	}

	/* A line before each label; the current one grows and turns brand-colored,
	   so it doesn't rely on color alone. */
	a {
		display: inline-flex;
		align-items: center;
		gap: var(--size-3);
		font-family: var(--font-label);
		font-size: var(--font-size-0);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--text-2);
		text-decoration: none;

		&::before {
			content: '';
			inline-size: var(--size-6);
			border-block-start: var(--border-size-1) solid currentColor;
			transition: inline-size 200ms ease-out;
		}
	}

	a:hover,
	a[aria-current='location'] {
		color: var(--text-1);

		&::before {
			inline-size: var(--size-10);
		}
	}

	a[aria-current='location'] {
		color: var(--brand);
	}
</style>
