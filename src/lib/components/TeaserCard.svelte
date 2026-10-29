<script lang="ts">
	import { resolve } from '$app/paths';
	import type { RouteId } from '$app/types';

	interface Props {
		title: string;
		description: string;
		// Optional: placeholder cards have nowhere to link yet.
		route?: RouteId;
	}

	let { title, description, route }: Props = $props();
</script>

<article>
	<h3>
		{#if route}
			<a href={resolve(route)}>{title}</a>
		{:else}
			{title}
		{/if}
	</h3>
	<p>{description}</p>
</article>

<style>
	article {
		padding: var(--size-4);
		border: var(--border-size-1) solid var(--surface-3);
		border-radius: var(--radius-3);
		background: var(--surface-2);
	}

	h3 {
		font-size: var(--font-size-3);
	}

	p {
		margin-block-start: var(--size-2);
		color: var(--text-2);
	}
</style>
