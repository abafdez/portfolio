<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { isInside, sections } from '#lib/links.ts';
</script>

<nav aria-label="Main navigation">
	<ul>
		{#each sections as link (link.href)}
			<!-- 'page' on the section's own page; 'true' on a page inside it (a post is in
			     Blog), the current item of this set. Both get the marker. Route ids, not
			     URLs: see isInside() in links.ts. -->
			{@const current =
				page.route.id === link.href
					? 'page'
					: isInside(link.href, page.route.id)
						? 'true'
						: undefined}
			<li>
				<a href={resolve(link.href)} aria-current={current}>
					{link.label}
					{#if current}
						<span class="marker" aria-hidden="true"></span>
					{/if}
				</a>
			</li>
		{/each}
	</ul>
</nav>

<style>
	ul {
		display: flex;
		flex-wrap: wrap;
		gap: var(--size-2) var(--size-4);
		list-style: none;
		padding: 0;
	}

	a {
		position: relative;
		font-family: var(--font-label);
		color: var(--text-2);
		text-decoration: none;
	}

	a:hover {
		color: var(--text-1);
		text-decoration: underline;
	}

	/* The current section: brand color plus a bar under it, so it doesn't rely on color
	   alone. */
	a[aria-current] {
		color: var(--brand);
	}

	/* The bar is its own element, not a text underline, so a view transition can move it:
	   during a route change it gets a name, and the browser slides it from the old
	   page's link to the new one. Only during "route" transitions: a named element is
	   cut out of the root picture, and the theme reveal only animates the root. */
	.marker {
		position: absolute;
		inset-inline: 0;
		inset-block-end: -0.25em;
		block-size: 2px;
		background: currentColor;
	}

	:global(:root:active-view-transition-type(route)) .marker {
		view-transition-name: nav-marker;
	}
</style>
