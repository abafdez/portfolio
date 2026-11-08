<script lang="ts">
	import { getLocale, languageTags, messages, translate } from '#lib/i18n/index.ts';

	// Two languages, so the switch is one link to the other one: this same page in it.
	// A plain <a>, not a button: it goes to a page that exists, works without JS, and the
	// prerender crawler follows it, which is how every Spanish page gets built.
	const other = $derived(getLocale() === 'en' ? 'es' : 'en');
	// Written in the language it leads to (that's who reads it), so the link says so with
	// lang, and hreflang tells browsers and search engines what's on the other end.
	const text = $derived(messages[other]);
</script>

<a href={translate(other)} lang={languageTags[other]} hreflang={languageTags[other]}>
	{text.languageShort()}<span class="visually-hidden">: {text.languageSwitch()}</span>
</a>

<style>
	/* The same round target as the theme toggle and the palette picker beside it. */
	a {
		display: grid;
		place-items: center;
		inline-size: var(--size-8);
		block-size: var(--size-8);
		border-radius: var(--radius-round);
		font-family: var(--font-label);
		font-size: var(--font-size-0);
		font-weight: 600;
		color: var(--text-2);
		text-decoration: none;

		&:is(:hover, :focus-visible) {
			color: var(--text-1);
		}
	}
</style>
