<script lang="ts">
	// Wide tables scroll in their own box instead of stretching the page. A table can't get
	// narrower than its longest word or bit of code (`refs/pull/<number>/merge`), and on a
	// phone that's wider than the column: the whole page scrolled sideways. The box scrolls
	// (overflow-x in .prose, global.css); tabindex lets a keyboard reach and scroll it, and
	// the region's name says what it is, in the file's language. Wrapping the table, rather
	// than giving it display: block, keeps it a table for screen readers.
	import type { Snippet } from 'svelte';
	import { fileLocale } from '#lib/i18n/locales.ts';

	let { file, children }: { file: string; children?: Snippet } = $props();

	const labels = { en: 'Table', es: 'Tabla' };
</script>

<!-- A region that scrolls must be reachable without a mouse, so it takes the focus. -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div class="table-scroll" role="region" aria-label={labels[fileLocale(file)]} tabindex="0">
	<table>{@render children?.()}</table>
</div>
