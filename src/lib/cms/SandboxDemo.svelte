<!--
	A demo (a ```svelte run block) in the CMS preview. The preview runs in the page that
	holds the GitHub token, so a post's code never runs here: this compiles the demo and
	runs it in <iframe sandbox="allow-scripts"> (demo.html, demo-runner.ts), which gets an
	opaque origin and can't reach the token, the CMS's page or its storage. Its messages are
	only trusted to be from that frame, and only as a height or an error text.
	Script blocks (```ts run) aren't run in the preview at all: a note says so.
	mdsvex.svelte.ts makes one of these per block, bound to its code.
-->
<script lang="ts">
	import type { Snippet } from 'mdsvex/compile';
	import { en } from '#lib/i18n/en.ts';
	import { es } from '#lib/i18n/es.ts';
	import { markdownLocale } from '#lib/markdown/context.ts';

	let { snippet }: { snippet: Snippet } = $props();

	const t = { en, es }[markdownLocale()];
	// The CMS's own build serves demo.html next to its page; in dev, plugin.ts serves it.
	const runner = import.meta.env.DEV ? '/admin/demo.html' : `${import.meta.env.BASE_URL}demo.html`;

	let frame = $state<HTMLIFrameElement>();
	let height = $state(0);
	let problem = $state<string>();

	// Compiled here, with the compiler the preview already loaded; sent when the frame has
	// loaded (its script listens before its load event).
	const compiled = import('svelte/compiler').then(({ compile }) => {
		try {
			return compile(snippet.code, {
				filename: 'Demo.svelte',
				generate: 'client',
				runes: true,
				css: 'injected'
			}).js.code;
		} catch (error) {
			problem = (error as Error).message;
		}
	});

	async function run() {
		const js = await compiled;
		if (js) frame?.contentWindow?.postMessage({ type: 'demo-run', js }, '*');
	}

	$effect(() => {
		function listen(event: MessageEvent) {
			if (!frame || event.source !== frame.contentWindow) return;
			const { type, height: next, message } = event.data ?? {};
			if (type === 'demo-height' && Number.isFinite(next))
				height = Math.min(Math.max(next, 0), 2000);
			if (type === 'demo-error' && typeof message === 'string') problem = message.slice(0, 500);
		}
		addEventListener('message', listen);
		return () => removeEventListener('message', listen);
	});
</script>

{#if snippet.lang !== 'svelte'}
	<p class="demo-note">{t.demoPreviewScript()}</p>
{:else}
	<iframe
		bind:this={frame}
		src={runner}
		sandbox="allow-scripts"
		title={t.demoLabel()}
		onload={run}
		style:block-size="{height}px"
		style:inline-size="100%"
		style:border="0"
	></iframe>
	{#if problem}<p class="demo-note">{problem}</p>{/if}
{/if}
