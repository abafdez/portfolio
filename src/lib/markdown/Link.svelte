<script lang="ts">
	// Every link written in markdown:
	// - /about: a page on this site. Gets the base path and the page's language
	//   (/portfolio/es/about). Only one slash: //host is another site. The prerender
	//   crawler checks these: a link to a missing page fails the build.
	// - https://…: rel="external", from the external-links plugin (options.ts).
	// - ./other-post or #a-heading: relative, so they already work under any base.
	// At run time, not when mdsvex compiles: one compiled body serves every language.
	import type { Snippet } from 'svelte';
	import { sitePath } from '#lib/i18n/locales.ts';
	import { markdownLocale } from './context.ts';

	interface Props {
		href: string;
		title?: string;
		rel?: string;
		children?: Snippet;
	}
	let { href, title, rel, children }: Props = $props();

	const locale = markdownLocale();
	let url = $derived(/^\/(?!\/)/.test(href) ? sitePath(href, locale) : href);
</script>

<a href={url} {title} {rel}>{@render children?.()}</a>
