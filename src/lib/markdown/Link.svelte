<script lang="ts">
	// Every link written in markdown:
	// - /about: a page on this site. Gets the base path and the page's language
	//   (/portfolio/es/about). Only one slash: //host is another site. The prerender
	//   crawler checks these: a link to a missing page fails the build.
	// - https://…: rel="external".
	// - ./other-post or #a-heading: relative, so they already work under any base.
	// sitePath(), not route(): route() reads the page's language from SvelteKit's page
	// state, and this renders outside a page (render.server.ts).
	import type { Snippet } from 'svelte';
	import { sitePath, type Locale } from '#lib/i18n/locales.ts';

	interface Props {
		href: string;
		title?: string | null;
		locale: Locale;
		children?: Snippet;
	}

	let { href, title, locale, children }: Props = $props();

	let external = $derived(/^https?:\/\//.test(href));
	let url = $derived(/^\/(?!\/)/.test(href) ? sitePath(href, locale) : href);
</script>

<a href={url} title={title ?? undefined} rel={external ? 'external' : undefined}
	>{@render children?.()}</a
>
