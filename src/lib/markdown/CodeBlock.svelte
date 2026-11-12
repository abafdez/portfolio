<script lang="ts">
	// A code block: a bar with the language and a copy button, then the <pre> Shiki made.
	// It's rendered on the server into plain HTML (render.server.ts), which shapes it:
	// - no <style>: CSS from a component only the server uses never reaches the page, so
	//   its styles are in global.css (.prose .code-block);
	// - no script: the button is in the HTML, hidden, and copy.ts makes it work once JS
	//   runs (and only if the browser can copy). Its texts come along as data-*.
	import type { Snippet } from 'svelte';
	// The message files themselves, not #lib/i18n/index.ts, which needs SvelteKit's page.
	import { en } from '#lib/i18n/en.ts';
	import { es } from '#lib/i18n/es.ts';
	import type { Locale } from '#lib/i18n/locales.ts';

	interface Props {
		lang: string; // after the opening ``` ('text' when there's none)
		locale: Locale; // the page's, for the button
		children: Snippet;
	}

	let { lang, locale, children }: Props = $props();

	const t = $derived({ en, es }[locale]);
</script>

<figure class="code-block">
	<figcaption>
		<span>{lang}</span>
		<!-- role="status": screen readers announce the text when it changes. -->
		<span class="status" role="status"></span>
		<button
			type="button"
			hidden
			data-copy
			data-copied={t.codeCopied()}
			data-failed={t.codeCopyFailed()}>{t.codeCopy()}</button
		>
	</figcaption>
	{@render children()}
</figure>
