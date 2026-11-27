// Vite's defineConfig with Vitest's types added, so the config can have a `test` section.
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import adapter from '@sveltejs/adapter-static'; //for SSG
import { enhancedImages } from '@sveltejs/enhanced-img';
import OpenProps from 'open-props'; //Styling
import postcssJitProps from 'postcss-jit-props'; //treeshaking for styles
import { cms } from './src/lib/cms/plugin.ts'; // Sveltia CMS at /admin, dev only
import { drafts } from './src/lib/drafts.ts'; // leaves draft posts out of a build
import { lucideNames } from './src/lib/cms/lucide-names.ts'; // the CMS icon picker's list
import { yamlData } from './src/lib/yaml-data.ts'; // import x from '/content/x.yaml?data'
import { mdsvex } from 'mdsvex'; // markdown files as Svelte components
import type { Plugin } from 'vite';
import { compileOptions } from './src/lib/markdown/options.ts';
import { ytThumbnails } from './src/lib/markdown/yt-thumbnails.ts'; // ::yt pictures, at build

// base path for using github pages
const base = process.argv.includes('dev') ? '' : (process.env.BASE_PATH ?? '');
//Checks if the base path is valid. It must start with a slash and not end with a slash.
if (base && (!base.startsWith('/') || base.endsWith('/'))) {
	throw new Error(`BASE_PATH must look like '/portfolio'. Got: "${base}"`);
}

// Markdown (posts and Devlog entries) is compiled by mdsvex: each .md file becomes a
// Svelte component (src/lib/markdown/ has our replacements and parse plugins), which the
// [slug] pages load through src/lib/bodies.ts. content.ts still reads the frontmatter
// with ?raw imports, which mdsvex leaves alone.

// mdsvex's transform must run before enhanced-img's markup step. That step's transform has
// order: 'pre', which Vite runs before every hook without an order, whatever a plugin's
// enforce says (mdsvex's plugin has enforce: 'pre', its transform no order). So it got
// the raw markdown of any post that shows <enhanced:img> in a code example, parsed it as
// Svelte, and failed, or rewrote the example. With order: 'pre' on mdsvex's transform too,
// mdsvex goes first (its enforce decides among 'pre' hooks, not the list below), and the
// example reaches enhanced-img as escaped text. mdsvex has no option for this; reported
// upstream (design/upstream-reports.md). Drop this once mdsvex sets the order itself.
function mdsvexFirst(plugins: Plugin[]) {
	for (const plugin of plugins) {
		const hook = plugin.transform;
		if (plugin.name !== 'mdsvex' || !hook) continue;
		plugin.transform = { order: 'pre', handler: typeof hook === 'function' ? hook : hook.handler };
	}
	return plugins;
}

export default defineConfig({
	plugins: [
		cms(),
		drafts(),
		lucideNames(),
		yamlData(),
		ytThumbnails(),
		mdsvexFirst(
			mdsvex({
				extensions: ['.md'],
				...compileOptions,
				components: '/src/lib/markdown/components.ts'
			})
		),
		enhancedImages(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			paths: {
				base: base as `/${string}` | '', //validated above, so this is safe to cast
				// The site's public origin. While prerendering there's no real request, so
				// SvelteKit makes up page.url (http://sveltekit-prerender); with this, its
				// origin is the one the pages are served from, so canonical and og:url
				// (Seo.svelte) and the sitemap get absolute URLs that work.
				origin: 'https://abafdez.github.io'
			},
			// See https://svelte.dev/docs/kit/adapters for more information about adapters.
			adapter: adapter({
				pages: 'build',
				assets: 'build',
				fallback: '404.html',
				strict: true
			}),
			prerender: {
				// '*' is every page the crawler finds from the home page (the default).
				// /logos.svg is only used by <use href>, and nothing links to /sitemap.xml
				// (search engines are told about it), so the crawler finds neither.
				entries: ['*', '/logos.svg', '/sitemap.xml']
				// A route nobody links to fails the build (SvelteKit's default for
				// handleUnseenRoutes). Until the first post was published, /blog/[slug] and
				// /blog/tags/[tag] had no pages in a build and needed an exception.
			}
		})
	],
	// Unit tests (pnpm test). Vitest runs them through this same config, plugins and all,
	// so a test imports files exactly like the site does (#lib/…, import.meta.glob).
	// A test lives next to the file it tests: content.ts -> content.test.ts.
	test: {
		include: ['src/**/*.test.ts']
	},
	// The base path for our own code, written into it at build time: '/portfolio' in a
	// build, '' in dev. The reroute hook (src/hooks.ts) needs it to find the /es in a URL.
	// Not Vite's import.meta.env.BASE_URL: SvelteKit sets that to './' (relative paths).
	define: {
		'import.meta.env.BASE_PATH': JSON.stringify(base)
	},
	// The encoded images (scripts/image-cache-link.ts): imagetools writes them while the
	// dev server runs, and no page imports them, so there's nothing to watch.
	server: {
		watch: { ignored: ['**/.image-cache/**'] }
	},
	css: {
		postcss: {
			plugins: [postcssJitProps(OpenProps)]
		}
	}
});
