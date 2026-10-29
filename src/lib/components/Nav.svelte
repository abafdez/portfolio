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
		gap: var(--size-2) var(--size-3);
		list-style: none;
		padding: 0;
	}
</style>
