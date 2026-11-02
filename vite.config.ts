import { defineConfig, type Plugin } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import adapter from '@sveltejs/adapter-static'; //for SSG
import { enhancedImages } from '@sveltejs/enhanced-img';
import { compile } from 'mdsvex'; //markdown to Svelte markup
import OpenProps from 'open-props'; //Styling
import postcssJitProps from 'postcss-jit-props'; //treeshaking for styles
import { bundledLanguages, createHighlighter, type BundledLanguage } from 'shiki'; //code blocks
import { codeTheme } from './src/lib/code-theme.ts';

// base path for using github pages
const base = process.argv.includes('dev') ? '' : (process.env.BASE_PATH ?? '');
//Checks if the base path is valid. It must start with a slash and not end with a slash.
if (base && (!base.startsWith('/') || base.endsWith('/'))) {
	throw new Error(`BASE_PATH must look like '/portfolio'. Got: "${base}"`);
}

// Code blocks are highlighted with Shiki at build time: the HTML ships with a color on
// every token and no highlighting JS. Our theme's colors are var(--code-…), so code
// follows the site theme like everything else (see code-theme.ts).
// Created once and shared by every .md file. It starts with no languages: each one is
// loaded the first time a code block uses it.
const shiki = createHighlighter({ themes: [codeTheme], langs: [] });

async function highlight(code: string, lang: string | null | undefined) {
	const highlighter = await shiki;
	let language = 'text';
	if (lang && lang in bundledLanguages) {
		await highlighter.loadLanguage(lang as BundledLanguage);
		language = lang;
	} else if (lang) {
		console.warn(`Shiki has no language "${lang}"; that block is shown as plain text.`);
	}
	const html = highlighter.codeToHtml(code, { lang: language, theme: 'tokens' });
	// The HTML goes into a Svelte template string: { } would be read as Svelte
	// expressions, and ` \ would end or change the string. As HTML entities they show
	// the same characters on screen.
	return `{@html \`${html.replace(/[{}`\\]/g, (c) => `&#${c.charCodeAt(0)};`)}\`}`;
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
				const out = await compile(code, {
					filename: id,
					extensions: ['.md'],
					highlight: { highlighter: highlight }
				});
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
			}),
			prerender: {
				// A route nobody links to fails the build, which catches broken links. One
				// exception: /blog/[slug] has no pages while every post is a draft (drafts
				// don't exist in a build). Once a post is published, entries() makes it.
				handleUnseenRoutes: ({ routes, message }) => {
					if (routes.some((route) => route !== '/blog/[slug]')) throw new Error(message);
				}
			}
		})
	],
	css: {
		postcss: {
			plugins: [postcssJitProps(OpenProps)]
		}
	}
});
