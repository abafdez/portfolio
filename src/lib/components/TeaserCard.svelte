<script module lang="ts">
	import type { RouteId } from '$app/types';

	// Exported so pages can type their lists: const posts: Teaser[] = [...]
	export interface Teaser {
		title: string;
		description: string;
		// Optional: a card can exist before its page does.
		route?: RouteId;
	}
</script>

<script lang="ts">
	import { resolve } from '$app/paths';

	let { title, description, route }: Teaser = $props();
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
