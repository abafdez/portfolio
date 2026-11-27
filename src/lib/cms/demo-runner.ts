// The page inside a demo's frame in the CMS preview (demo.html, SandboxDemo.svelte).
// The frame is <iframe sandbox="allow-scripts"> without allow-same-origin, so this page
// has an opaque origin: it can't read the CMS's storage (where Sveltia keeps the GitHub
// token), its cookies or its page, can't open windows or navigate the tab. It can only
// run the demo and talk through postMessage.
// The CMS compiles the demo and posts its JavaScript here; this page imports it with its
// own copy of Svelte's runtime (blob-modules.ts) and mounts it, then reports its height,
// and any error, back. Its scripts come from the CMS's server with CORS (an opaque origin
// is "null"): GitHub Pages sends Access-Control-Allow-Origin: *, the dev server allows
// null (plugin.ts) and scripts/serve.ts sends * like Pages.
import * as svelteApi from 'svelte';
import { mount, type Component } from 'svelte';
import { client } from './svelte-runtime.ts';
import { blobModules, importCode, rewriteImports } from './blob-modules.ts';

const urls = blobModules(
	{ 'svelte/internal/client': client, svelte: svelteApi, 'svelte/internal/disclose-version': {} },
	'__demoModules'
);
const target = document.querySelector('main')!;

// Who asked: the CMS's window. Not always `parent`: Sveltia draws the preview in a frame of
// its own, so this frame's parent is that one, while the code that runs the demo (and
// listens for answers) lives in the top window. Only windows that hold this frame can
// post to it at all. '*': the CMS can't name this frame's origin (it has none), and
// nothing secret is sent.
let asker: MessageEventSource | null = null;
const tell = (message: object) => (asker as Window | null)?.postMessage(message, '*');

addEventListener('message', async (event: MessageEvent) => {
	const { type, js } = event.data ?? {};
	if (event.source !== parent && event.source !== top) return;
	if (type !== 'demo-run' || typeof js !== 'string') return;
	asker = event.source;
	try {
		const module = await importCode(rewriteImports(js, urls));
		target.replaceChildren();
		mount(module.default as Component, { target });
	} catch (error) {
		tell({ type: 'demo-error', message: error instanceof Error ? error.message : String(error) });
	}
});

new ResizeObserver(() =>
	tell({ type: 'demo-height', height: Math.ceil(document.documentElement.scrollHeight) })
).observe(document.body);
