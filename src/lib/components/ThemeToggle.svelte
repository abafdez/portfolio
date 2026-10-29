<script lang="ts">
	import { onMount } from 'svelte';

	type Theme = 'light' | 'dark';

	// Unknown until mounted: the prerendered HTML can't know the visitor's theme.
	let theme = $state<Theme>();

	onMount(() => {
		// app.html may already have set data-theme from localStorage; otherwise follow the OS.
		const saved = document.documentElement.dataset.theme;
		theme =
			saved === 'light' || saved === 'dark'
				? saved
				: matchMedia('(prefers-color-scheme: dark)').matches
					? 'dark'
					: 'light';
	});

	function toggle() {
		theme = theme === 'dark' ? 'light' : 'dark';
		document.documentElement.dataset.theme = theme;
		try {
			localStorage.setItem('theme', theme);
		} catch {
			// Storage blocked (private mode): the theme still applies for this visit.
		}
	}
</script>

<button type="button" onclick={toggle} aria-pressed={theme === 'dark'} disabled={!theme}>
	Dark theme
</button>

<style>
	button {
		font-size: var(--font-size-0);
		padding: var(--size-1) var(--size-2);
		color: var(--text-1);
		background: var(--surface-2);
		border: var(--border-size-1) solid var(--surface-3);
		border-radius: var(--radius-2);
		cursor: pointer;
	}

	button[aria-pressed='true'] {
		background: var(--surface-3);
	}
</style>
