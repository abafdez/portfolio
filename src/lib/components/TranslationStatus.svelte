<script lang="ts">
	// Two badges about a post's or an entry's language, next to its date:
	// "en inglés" when its text isn't in the page's language (a Spanish page showing a
	// post that isn't translated yet), on every build, since readers need to know;
	// "sin revisar" in dev only, on a translation I haven't read yet (reviewed: false
	// in its frontmatter).
	import { dev } from '$app/env';
	import Languages from '@lucide/svelte/icons/languages';
	import EyeOff from '@lucide/svelte/icons/eye-off';
	import { getLocale, languageTags, m, type Locale } from '#lib/i18n/index.ts';

	let { locale, reviewed }: { locale?: Locale; reviewed?: boolean } = $props();
</script>

<!-- The page's language, set again: the badge can sit inside an article that says
     lang="en", but its own words are the page's. -->
{#if locale && locale !== getLocale()}
	<span class="badge" lang={languageTags[getLocale()]}>
		<Languages size="1em" aria-hidden="true" />{m.inEnglish()}
	</span>
{/if}
{#if dev && reviewed === false}
	<span class="badge unreviewed" lang={languageTags[getLocale()]}>
		<EyeOff size="1em" aria-hidden="true" />{m.unreviewed()}
	</span>
{/if}

<style>
	/* The same shape as the draft/published badge (PostStatus). */
	.badge {
		display: inline-flex;
		align-items: center;
		gap: 0.3em;
		padding-inline: var(--size-1);
		border: var(--border-size-1) solid currentColor;
		border-radius: var(--radius-2);
		font-family: var(--font-label);
		font-size: var(--font-size-0);
		vertical-align: middle;
		color: var(--text-2);
	}

	/* A note to myself, not to readers: dashed, like a draft. */
	.unreviewed {
		border-style: dashed;
	}
</style>
