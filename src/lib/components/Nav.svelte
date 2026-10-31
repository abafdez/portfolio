<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import type { RouteId } from '$app/types';

	const links: { href: RouteId; label: string }[] = [
		{ href: '/', label: 'Home' },
		{ href: '/blog', label: 'Blog' },
		{ href: '/awesome', label: 'Awesome' },
		{ href: '/projects', label: 'Projects' },
		{ href: '/cv', label: 'CV' },
		{ href: '/bitacora', label: 'Bitacora' }
	];
</script>

<nav aria-label="Main navigation">
	<ul>
		{#each links as link (link.href)}
			{@const current = page.url.pathname === resolve(link.href)}
			<li>
				<a href={resolve(link.href)} aria-current={current ? 'page' : undefined}>
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

	/* The current page: brand color plus a bar under it, so it doesn't rely on color alone. */
	a[aria-current='page'] {
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
