// Vite's defineConfig with Vitest's types added, so the config can have a `test` section.
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import adapter from '@sveltejs/adapter-static'; //for SSG
import { enhancedImages } from '@sveltejs/enhanced-img';
import OpenProps from 'open-props'; //Styling
import postcssJitProps from 'postcss-jit-props'; //treeshaking for styles
import { cms } from './src/lib/cms/plugin.ts'; // Sveltia CMS at /admin, dev only

// base path for using github pages
const base = process.argv.includes('dev') ? '' : (process.env.BASE_PATH ?? '');
//Checks if the base path is valid. It must start with a slash and not end with a slash.
if (base && (!base.startsWith('/') || base.endsWith('/'))) {
	throw new Error(`BASE_PATH must look like '/portfolio'. Got: "${base}"`);
}

// Markdown (posts and Devlog entries) isn't compiled by Vite: each [slug] page renders its
// file to HTML on the server with svelte-markdown (src/lib/markdown/render.server.ts).

export default defineConfig({
	plugins: [
		cms(),
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
	css: {
		postcss: {
			plugins: [postcssJitProps(OpenProps)]
		}
	}
});
