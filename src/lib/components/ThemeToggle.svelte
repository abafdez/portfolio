<script lang="ts">
	import { onMount } from 'svelte';

	type Theme = 'light' | 'dark';

	// Unknown until mounted: the prerendered HTML can't know the visitor's theme.
	let theme = $state<Theme>();

	const systemTheme = (): Theme =>
		matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

	onMount(() => {
		// app.html may already have set data-theme from localStorage; otherwise follow the OS.
		const sync = () => {
			const saved = document.documentElement.dataset.theme;
			theme = saved === 'light' || saved === 'dark' ? saved : systemTheme();
		};
		sync();

		// Keep the button right if the OS theme changes while the page is open.
		const query = matchMedia('(prefers-color-scheme: dark)');
		query.addEventListener('change', sync);
		return () => query.removeEventListener('change', sync);
	});

	// Two states: the system theme and its opposite (Lea Verou's model).
	// Going back to the system theme removes the override, so the site follows the OS again.
	function toggle() {
		theme = theme === 'dark' ? 'light' : 'dark';
		const root = document.documentElement;
		try {
			if (theme === systemTheme()) {
				delete root.dataset.theme;
				localStorage.removeItem('theme');
			} else {
				root.dataset.theme = theme;
				localStorage.setItem('theme', theme);
			}
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
