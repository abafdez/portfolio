import { defineConfig, type Plugin } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import adapter from '@sveltejs/adapter-static'; //for SSG
import { enhancedImages } from '@sveltejs/enhanced-img';
import { compile } from 'mdsvex'; //markdown to Svelte markup
import OpenProps from 'open-props'; //Styling
import postcssJitProps from 'postcss-jit-props'; //treeshaking for styles

// base path for using github pages
const base = process.argv.includes('dev') ? '' : (process.env.BASE_PATH ?? '');
//Checks if the base path is valid. It must start with a slash and not end with a slash.
if (base && (!base.startsWith('/') || base.endsWith('/'))) {
	throw new Error(`BASE_PATH must look like '/portfolio'. Got: "${base}"`);
}

// Turns each .md file into Svelte markup with mdsvex; vite-plugin-svelte then compiles
// it like any component. Why a plugin and not `preprocess: [mdsvex()]`: enhanced-img
// parses every Svelte file in a 'pre' transform, which Vite runs before the
// preprocessors, so it would read the raw markdown and choke on `<enhanced:img>` in
// prose. This hook is 'pre' too and its plugin is enforce: 'pre', so it runs first.
function markdown(): Plugin {
	return {
		name: 'markdown',
		enforce: 'pre',
		transform: {
			order: 'pre',
			// Only plain .md imports: '…md?raw' (content.ts) must stay plain text.
			filter: { id: /\.md$/ },
			async handler(code, id) {
				const out = await compile(code, { filename: id, extensions: ['.md'] });
				if (!out) return;
				// mdsvex 0.12 still writes Svelte 4 syntax for the frontmatter script.
				// The empty map says "no sourcemap on purpose": markdown -> HTML has no
				// useful line-by-line mapping, and without it the build warns per file.
				return {
					code: out.code.replace('<script context="module">', '<script module>'),
					map: { mappings: '' }
				};
			}
		}
	};
}

export default defineConfig({
	plugins: [
		markdown(),
		enhancedImages(),
		sveltekit({
			// Compile .md files as components too (after markdown() above has run).
			extensions: ['.svelte', '.md'],
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			paths: { base: base as `/${string}` | '' }, //validated above, so this is safe to cast
			// See https://svelte.dev/docs/kit/adapters for more information about adapters.
			adapter: adapter({
				pages: 'build',
				assets: 'build',
				fallback: '404.html',
				strict: true
			})
		})
	],
	css: {
		postcss: {
			plugins: [postcssJitProps(OpenProps)]
		}
	}
});
