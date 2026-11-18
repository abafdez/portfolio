<script lang="ts">
	import { page } from '$app/state';
	import { m, route } from '#lib/i18n/index.ts';
	import { isInside, sections } from '#lib/links.ts';
</script>

<nav aria-label={m.navLabel()}>
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
				<a href={route(link.href)} aria-current={current}>
					{link.label()}
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
		gap: var(--size-1);
		list-style: none;
		padding: 0;
	}

	/* Each link is a pill: no underline, a soft fill on hover. isolation: the marker
	   (below) sits behind the text with z-index -1, inside the pill, not behind the
	   header. */
	a {
		position: relative;
		isolation: isolate;
		display: block;
		padding: var(--size-1) var(--size-3);
		border-radius: var(--radius-round);
		font-family: var(--font-label);
		color: var(--text-2);
		text-decoration: none;
		transition:
			background-color 150ms var(--ease-out-2),
			color 150ms var(--ease-out-2);
	}

	a:hover {
		background-color: var(--surface-2);
		color: var(--text-1);
	}

	/* The current section: a tinted pill with a brand border, so it doesn't rely on
	   colour alone. The text is --text-1: the pill's tint sits under it, and --text-1
	   keeps its contrast on any tint in every colour theme. */
	a[aria-current] {
		color: var(--text-1);
	}

	/* The pill is its own element, not the link's background, so a view transition can
	   move it: during a route change it gets a name, and the browser slides it from the
	   old page's link to the new one. Only during "route" transitions: a named element
	   is cut out of the root picture, and the theme reveal only animates the root. */
	.marker {
		position: absolute;
		inset: 0;
		z-index: -1;
		border: var(--border-size-1) solid color-mix(in oklab, var(--brand) 55%, transparent);
		border-radius: inherit;
		background: color-mix(in oklab, var(--brand) 12%, transparent);
	}

	:global(:root:active-view-transition-type(route)) .marker {
		view-transition-name: nav-marker;
	}
</style>
