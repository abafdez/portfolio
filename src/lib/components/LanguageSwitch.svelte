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

<!-- data-sveltekit-reset="false": the same page in another language, so stay where you
     are reading instead of jumping to the top, and keep focus on the switch (SvelteKit 3's
     name for the old data-sveltekit-noscroll). data-language-switch: where the transition
     starts from (the root layout's onNavigate). -->
<a
	href={translate(other)}
	lang={languageTags[other]}
	hreflang={languageTags[other]}
	data-sveltekit-reset="false"
	data-language-switch
>
	<!-- The character from Lucide's "languages" icon (ISC licence), with the code of the
	     language it leads to where the icon has an "A". The name comes from the hidden
	     text, which starts with the same code, so voice control users can say what
	     they see. -->
	<svg viewBox="0 0 24 24" aria-hidden="true">
		<g class="glyph">
			<path d="m5 8 6 6" />
			<path d="m4 14 6-6 2-3" />
			<path d="M2 5h12" />
			<path d="M7 2h1" />
		</g>
		<text class="code" x="18" y="22.5" text-anchor="middle">{text.languageShort()}</text>
	</svg>
	<span class="visually-hidden">{text.languageShort()}: {text.languageSwitch()}</span>
</a>

<style>
	/* The same round target as the theme toggle and the palette picker beside it. */
	a {
		display: grid;
		place-items: center;
		inline-size: var(--size-8);
		block-size: var(--size-8);
		padding: var(--size-2);
		border-radius: var(--radius-round);
		color: var(--text-2);

		&:is(:hover, :focus-visible) {
			color: var(--text-1);
		}
	}

	svg {
		inline-size: 100%;
		block-size: 100%;
		overflow: visible;
		fill: none;
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.code {
		fill: currentColor;
		stroke: none;
		font-family: var(--font-label);
		font-size: 10px;
		font-weight: 700;
	}

	/* Pointed at, the two halves lean towards each other with a spring, as if the
	   character were turning into the code (the transforms are in the SVG's units). */
	.glyph,
	.code {
		transform-box: fill-box;
		transform-origin: center;
		transition: transform 500ms var(--ease-spring-3);
	}

	a:is(:hover, :focus-visible) {
		& .glyph {
			transform: translate(1px, 1px) rotate(-12deg) scale(0.9);
		}

		& .code {
			transform: translate(-1px, -1px) scale(1.2);
		}
	}
</style>
