<script lang="ts" module>
	// The name at the end of every <title> and in link previews (og:site_name).
	export const siteName = 'Alfonso Baeza';
</script>

<script lang="ts">
	// Everything a page tells search engines and link previews about itself, in one place:
	// <title>, description, canonical URL and the Open Graph tags (the card LinkedIn,
	// Slack or Discord show for a link). Every page uses this instead of its own
	// <svelte:head>. Pages with an image (a post with a cover) get a big preview card;
	// the rest get a text card.
	import { page } from '$app/state';

	let {
		title,
		description,
		section,
		published,
		image,
		noindex = false
	}: {
		// The page's own name: 'CV builder'. Home passes none and gets the site name.
		title?: string;
		// One or two sentences, ideally under 160 characters: search results cut there.
		description: string;
		// The section it's in, for the <title>: 'CV builder · Projects · Alfonso Baeza'.
		section?: string;
		// 'YYYY-MM-DD' for a post or a Bitácora entry, which makes it an article.
		published?: string;
		// The link preview's picture (coverPreviews in covers.ts) and its alt text.
		image?: { src: string; alt: string };
		// Keep this page out of search results (a page that isn't ready, like /mascot).
		noindex?: boolean;
	} = $props();

	const fullTitle = $derived([title, section, siteName].filter(Boolean).join(' · '));

	// The page's address without ?query or #hash: /projects/cv?profile=support is still
	// the same page. While prerendering the origin is prerender.origin (vite.config.ts).
	const canonical = $derived(page.url.origin + page.url.pathname);

	// og:image must be a full URL; the import gives a path, absolute or relative to the
	// page, and new URL() resolves either against the page's address.
	const imageUrl = $derived(image && new URL(image.src, page.url.href).href);
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonical} />
	{#if noindex}
		<meta name="robots" content="noindex" />
	{/if}

	<meta property="og:site_name" content={siteName} />
	<meta property="og:title" content={title ?? siteName} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={canonical} />
	<meta property="og:type" content={published ? 'article' : 'website'} />
	{#if published}
		<meta property="article:published_time" content={published} />
	{/if}
	{#if image && imageUrl}
		<meta property="og:image" content={imageUrl} />
		<meta property="og:image:alt" content={image.alt} />
	{/if}
	<!-- X reads the og: tags too, but needs this to show a card at all: the big one with
	     an image on top, or the small text one. -->
	<meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
</svelte:head>
