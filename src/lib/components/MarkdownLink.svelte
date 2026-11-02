<script lang="ts">
	// Every link written in markdown (MarkdownLayout.svelte swaps <a> for this).
	// - /cv: a page on this site. Gets the base path (/portfolio on GitHub Pages),
	//   like the links in our components do with resolve(). Only one slash: //host
	//   is another site.
	// - https://…: rel="external". mdsvex adds rel="nofollow" to every link, which
	//   tells search engines not to vouch for it. These are links I recommend, so it's
	//   dropped (it's never read from the props below).
	// - ./other-post or #a-heading: relative, so they already work under any base.
	import { resolve } from '$app/paths';
	import type { Snippet } from 'svelte';

	// resolve()'s types only accept one known page at a time, and a markdown link is
	// just a string, so TypeScript can't check it. For a path with no [param], resolve()
	// only adds the base path, so its type is widened here. The prerender crawler
	// checks these links instead: a link to a missing page fails the build.
	const withBase = resolve as (path: string) => string;

	interface Props {
		href: string;
		title?: string;
		children: Snippet;
	}

	let { href, title, children }: Props = $props();

	let external = $derived(/^https?:\/\//.test(href));
	let url = $derived(/^\/(?!\/)/.test(href) ? withBase(href) : href);
</script>

<a href={url} {title} rel={external ? 'external' : undefined}>{@render children()}</a>
