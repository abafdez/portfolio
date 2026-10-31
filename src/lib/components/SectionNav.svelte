<script module lang="ts">
	// Exported so pages can type their lists: const sections: Section[] = [...]
	export interface Section {
		id: string;
		label: string;
	}
</script>

<script lang="ts">
	let { sections }: { sections: Section[] } = $props();

	// The id of the section being read. Without JS it stays undefined: the links still
	// jump to their sections, there's just no highlight.
	let current = $state<string>();

	// Scroll-spy. rootMargin shrinks the observed area to a thin line a third of the
	// way down the screen; a section "intersects" while it crosses that line.
	// $effect runs after the page is in the DOM, so getElementById finds the sections.
	$effect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) current = entry.target.id;
				}
			},
			{ rootMargin: '-33% 0px -67% 0px' }
		);

		for (const { id } of sections) {
			const section = document.getElementById(id);
			if (section) observer.observe(section);
		}

		return () => observer.disconnect();
	});
</script>

<nav aria-label="On this page">
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
