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
			<li>
				<a
					href={resolve(link.href)}
					aria-current={page.url.pathname === resolve(link.href) ? 'page' : undefined}
				>
					{link.label}
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
		font-family: var(--font-label);
		color: var(--text-2);
		text-decoration: none;
	}

	a:hover {
		color: var(--text-1);
		text-decoration: underline;
	}

	/* The current page: brand color plus a thick underline, so it doesn't rely on color alone. */
	a[aria-current='page'] {
		color: var(--brand);
		text-decoration: underline;
		text-decoration-thickness: 2px;
	}
</style>
