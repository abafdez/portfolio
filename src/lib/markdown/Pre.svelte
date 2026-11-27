<script lang="ts">
	// A code block (it replaces mdsvex's <pre>): a bar with the language and a copy button,
	// then the <pre> mdsvex highlighted with twinkleplop (`children` is that whole <pre>).
	// - its styles are in global.css (.prose .code-block), with the rest of the body's;
	// - the copy button is in the HTML, hidden, and copy.ts makes it work once JS runs
	//   (and only if the browser can copy). Its texts come along as data-*.
	// A fence marked `run` (```svelte run) is also a module the page imports, which mdsvex
	// hands over as `module`: a Svelte block's component is drawn above its code, a script
	// block's default export, if a function, is called and its result shown. `run=client`
	// gives `load` instead, a function that imports it: the demo waits for a button.
	import type { Component, Snippet } from 'svelte';
	// The message files themselves, not #lib/i18n/index.ts, which needs SvelteKit's page.
	import { en } from '#lib/i18n/en.ts';
	import { es } from '#lib/i18n/es.ts';
	import { markdownLocale } from './context.ts';

	type Module = Record<string, unknown>;

	interface Props {
		lang?: string; // after the opening ```
		children: Snippet;
		module?: Module; // a `run` block's exports
		load?: () => Promise<Module>; // a `run=client` block's import
	}

	let { lang = 'text', children, module, load }: Props = $props();

	// The button speaks the page's language (context.ts).
	const t = { en, es }[markdownLocale()];

	let loaded = $state<Module>();
	const ran = $derived(module ?? loaded);
	// `sandboxed`: in the CMS preview a block's module is a component that runs it in a
	// sandboxed frame (cms/SandboxDemo.svelte), whatever its language.
	const drawn = $derived(lang === 'svelte' || ran?.sandboxed === true);
	const Demo = $derived(drawn ? (ran?.default as Component | undefined) : undefined);
	const result = $derived(
		!drawn && typeof ran?.default === 'function'
			? String((ran.default as () => unknown)())
			: undefined
	);
	const runs = $derived(module !== undefined || load !== undefined);
</script>

<!-- data-lang: some token colours depend on the language (global.css). data-pagefind-ignore:
     the language name and "copy" aren't worth finding. role="status": screen readers
     announce its text when it changes. -->
{#snippet block()}
	<figure class="code-block" data-lang={lang}>
		<figcaption data-pagefind-ignore>
			<span>{lang}</span>
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
{/snippet}

<!-- A demo goes above its code block, in a region named for screen readers, both in one
     frame (.code-demo). Outside the figure: its caption must stay its first child. -->
{#if runs}
	<div class="code-demo">
		<div class="demo" role="group" aria-label={t.demoLabel()}>
			{#if Demo}
				<Demo />
			{:else if result !== undefined}
				<output>{result}</output>
			{:else if load}
				<button type="button" class="demo-run" onclick={async () => (loaded = await load())}
					>{t.demoRun()}</button
				>
			{/if}
		</div>
		{@render block()}
	</div>
{:else}
	{@render block()}
{/if}
