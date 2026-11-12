<script lang="ts">
	// A post's body: svelte-markdown draws the tokens (parse.ts), with our components in
	// place of its own for the elements below. Every prop after `tokens` is handed on to
	// every renderer, so each knows the file (for its language and ./files), the page's
	// language (for links and buttons), Shiki and where the files are.
	// Rendered to HTML on the server for the site (render.server.ts), and mounted live in
	// the CMS's preview (src/lib/cms/markdown.svelte.ts): the same code draws both.
	import SvelteMarkdown from '@humanspeak/svelte-markdown';
	import type { Token } from 'marked';
	import type { Locale } from '#lib/i18n/locales.ts';
	import type { Highlighter } from './shiki.ts';
	import type { Media } from './media.ts';
	import Heading from './Heading.svelte';
	import Code from './Code.svelte';
	import Codespan from './Codespan.svelte';
	import Image from './Image.svelte';
	import Figure from './Figure.svelte';
	import Link from './Link.svelte';
	import Table from './Table.svelte';
	import Callout from './Callout.svelte';
	import CalloutTitle from './CalloutTitle.svelte';

	interface Props {
		tokens: Token[];
		file: string;
		locale: Locale;
		highlighter: Highlighter;
		media: Media;
	}

	let { tokens, ...context }: Props = $props();

	// Keys are token types: marked's, plus our own from parse.ts (callout, calloutTitle,
	// figure). svelte-markdown's type only lists marked's, hence the cast.
	const renderers = {
		heading: Heading,
		code: Code,
		codespan: Codespan,
		image: Image,
		figure: Figure,
		link: Link,
		table: Table,
		callout: Callout,
		calloutTitle: CalloutTitle
	};
</script>

<SvelteMarkdown source={tokens} renderers={renderers as never} {...context} />
