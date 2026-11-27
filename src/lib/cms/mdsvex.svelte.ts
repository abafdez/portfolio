// The CMS preview with mdsvex 1.0. A post is a Svelte component in the build, so
// the preview compiles it in the browser, as the build does, and mounts it:
//
//   markdown --mdsvex compile()--> Svelte source --svelte/compiler--> a JS module
//
// That module imports Svelte's runtime and our components by name ('svelte/internal/client',
// 'preview:components'). The browser can't resolve those names, so each is swapped for a
// blob: module that hands out this bundle's own copy (the same Svelte that mounts it).
import * as svelteApi from 'svelte';
import { mount, unmount, type Component } from 'svelte';
import { client } from './svelte-runtime.ts';
import { compile, type Snippet } from 'mdsvex/compile';
import { previewBraces } from './preview-braces.ts';
import { create_highlight, load_default_languages, type HighlightConfig } from 'mdsvex/highlight';
import * as components from '#lib/markdown/components.ts';
import { compileOptions } from '#lib/markdown/options.ts';
import * as blockComponents from '#lib/markdown/blocks/index.ts';
import * as directiveComponents from '#lib/markdown/directives/index.ts';
import * as stepsComponents from '@mdsvex/plugin-steps/directives/unstyled';
import * as tabsComponents from '@mdsvex/plugin-tabs/directives/unstyled';
import * as tocComponents from '@mdsvex/plugin-toc/directives';
import { markdownContext } from '#lib/markdown/context.ts';
import type { Media } from '#lib/markdown/media.ts';
import type { Locale } from '#lib/i18n/locales.ts';
import PreviewImage from './PreviewImage.svelte';
import SandboxDemo from './SandboxDemo.svelte';
import { blobModules, importCode, rewriteImports } from './blob-modules.ts';

// The build's replacements, plus images drawn from Sveltia's files (the build's are imports).
const replacements: Record<string, unknown> = { ...components, img: PreviewImage };

// What a compiled post may import, by the name it imports it under.
const modules: Record<string, Record<string, unknown>> = {
	'svelte/internal/client': client,
	// A post whose plugins left data sets it as a context (mdsvex writes the import).
	svelte: svelteApi,
	'svelte/internal/disclose-version': {},
	'preview:components': replacements,
	// Each plugin's components, under the module name the plugin gives (markdown/options.ts):
	// our blocks and directives, and mdsvex's steps, tabs and toc.
	'/src/lib/markdown/blocks/index.ts': blockComponents,
	'/src/lib/markdown/directives/index.ts': directiveComponents,
	'@mdsvex/plugin-steps/directives/unstyled': stepsComponents,
	'@mdsvex/plugin-tabs/directives/unstyled': tabsComponents,
	'@mdsvex/plugin-toc/directives': tocComponents
};

// One blob: module per name, made once (blob-modules.ts).
let urls: Record<string, string> | undefined;
const moduleUrls = () => (urls ??= blobModules(modules, '__previewModules'));

// A demo (a ```svelte run block) is code the post's author wrote, and the preview runs in
// the page that holds the GitHub token. So it never runs here: its module is the sandbox
// component (SandboxDemo.svelte), bound to the block's code, which runs it in a sandboxed
// frame. `sandboxed` tells Pre.svelte to draw it, whatever the block's language. One
// module per block, kept: the same code has the same hash.
const snippetUrls = new Map<string, string>();
const snippetName = (snippet: Snippet) => `preview:snippet/${snippet.hash}`;
function snippetUrl(snippet: Snippet) {
	const name = snippetName(snippet);
	let url = snippetUrls.get(name);
	if (!url) {
		const bound = ((internals: Parameters<typeof SandboxDemo>[0], props: object) =>
			SandboxDemo(internals, { ...props, snippet })) as Component;
		url = blobModules(
			{ [name]: { default: bound, sandboxed: true } },
			`__previewSnippet_${snippet.hash}`
		)[name];
		snippetUrls.set(name, url);
	}
	return url;
}

// The languages load once (mdsvex's own list, like the build's).
let highlight: Promise<HighlightConfig> | undefined;
const highlighter = () =>
	(highlight ??= load_default_languages().then((languages) => create_highlight({ languages })));

// A post's body as a component, compiled the way the build compiles it. Throws what the
// build would stop on (the parse plugins' errors, Svelte's).
export async function compilePost(body: string, file: string) {
	const [config, { compile: svelte }] = await Promise.all([
		highlighter(),
		import('svelte/compiler')
	]);
	const markdown = compile(body, {
		filename: file,
		...compileOptions,
		parse_plugins: [...compileOptions.parse_plugins, previewBraces],
		highlight: config,
		components: [{ specifier: 'preview:components', names: Object.keys(replacements) }],
		// Blocks that run import preview:snippet/<hash>, answered by snippetUrl().
		snippets: snippetName
	});
	const { js } = svelte(markdown.code, {
		filename: `${file}.svelte`,
		generate: 'client',
		runes: true
	});
	const snippets = markdown.snippets ?? [];
	const urls = {
		...moduleUrls(),
		...Object.fromEntries(snippets.map((snippet) => [snippetName(snippet), snippetUrl(snippet)]))
	};
	const module = await importCode(rewriteImports(js.code, urls, snippets.map(snippetName)));
	return module.default as Component;
}

type ReactLike = {
	createElement: (type: string, props: object) => unknown;
	useRef: <T>(value: T) => { current: T };
	useEffect: (effect: () => void | (() => void), deps: unknown[]) => void;
};

// The files next to the post, from Sveltia (getAsset), as the media the components ask
// (context.ts). State: Sveltia answers with an empty URL while it reads a file and draws
// the template again when it has it, so the pictures and videos follow.
function assetState(initial: (path: string) => string) {
	let asset = $state.raw(initial);
	// has(): Sveltia answers an empty URL for a file it doesn't have (or is still reading).
	const media: Media = {
		picture: (_file, src) => asset(src),
		url: (_file, src) => asset(src),
		has: (_file, src) => asset(src) !== ''
	};
	return {
		media: () => media,
		set: (next: (path: string) => string) => void (asset = next)
	};
}

// The React side: an element to mount the compiled post into, mounted again for every
// new component (each compile is a new one).
export function mdsvexBody(React: ReactLike) {
	return function MdsvexBody({
		component,
		asset,
		locale,
		...attributes
	}: { component: Component; asset: (path: string) => string; locale: Locale } & Record<
		string,
		unknown
	>) {
		const target = React.useRef<HTMLElement | null>(null);
		const assets = React.useRef<ReturnType<typeof assetState> | null>(null);
		assets.current ??= assetState(asset);

		React.useEffect(() => {
			assets.current!.set(asset);
		}, [asset]);

		React.useEffect(() => {
			const app = mount(component, {
				target: target.current!,
				// Links in the file's language; images and blocks' files from Sveltia.
				context: markdownContext(() => locale, assets.current!.media)
			});
			return () => void unmount(app);
		}, [component]);

		return React.createElement('div', { ref: target, ...attributes });
	};
}
