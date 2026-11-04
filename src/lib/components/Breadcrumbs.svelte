<script lang="ts">
	// Where a nested page sits: Home / Projects / CV builder. Only on pages inside a
	// section (the nav already says where a section's own page is), and only when the
	// route names its page in its load data (`crumb`, see App.PageData).
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { isInside, sections } from '#lib/links.ts';

	const section = $derived(sections.find(({ href }) => isInside(href, page.route.id)));
</script>

{#if section && page.data.crumb}
	<nav aria-label="Breadcrumb">
		<!-- An ordered list: the order is the point, and a screen reader says "list, 3 items". -->
		<ol>
			<li><a href={resolve('/')}>Home</a></li>
			<li><a href={resolve(section.href)}>{section.label}</a></li>
			<!-- The page itself is text, not a link to where you already are. -->
			<li aria-current="page">{page.data.crumb}</li>
		</ol>
	</nav>
{/if}

<style>
	ol {
		display: flex;
		flex-wrap: wrap;
		gap: var(--size-1);
		list-style: none;
		padding: 0;
		margin-block: var(--size-3) 0;
		font-family: var(--font-code);
		font-size: var(--font-size-0);
		color: var(--text-2);
	}

	/* A path separator. The "/ ''" after it is the alt text: empty, so a screen reader
	   doesn't read "slash" between the items. */
	li + li::before {
		content: '/' / '';
		margin-inline-end: var(--size-1);
	}

	a {
		color: var(--text-2);
	}

	a:hover {
		color: var(--brand);
	}

	[aria-current='page'] {
		color: var(--text-1);
	}
</style>
