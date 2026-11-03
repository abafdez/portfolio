<script lang="ts">
	// A brand logo from Simple Icons. The package gives each logo as data (a title, a
	// brand color and one SVG path on a 24×24 grid), not as a component, so this draws it.
	// fill="currentColor": the logo takes the text color, so it follows our tokens and
	// themes instead of the brand's own color.
	import type { SimpleIcon } from 'simple-icons';

	let { icon, size = '1em' }: { icon: SimpleIcon; size?: string } = $props();
</script>

<!-- aria-hidden: the name is always written next to it. -->
<svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
	<path d={icon.path} />
</svg>
