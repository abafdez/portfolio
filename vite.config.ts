import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';
// Vite's defineConfig with Vitest's types added, so the config can have a `test` section.
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import adapter from '@sveltejs/adapter-static'; //for SSG
import { enhancedImages } from '@sveltejs/enhanced-img';
import { compile, type MdsvexCompileOptions } from 'mdsvex'; //markdown to Svelte markup
import OpenProps from 'open-props'; //Styling
import postcssJitProps from 'postcss-jit-props'; //treeshaking for styles
import { bundledLanguages, createHighlighter, type BundledLanguage } from 'shiki'; //code blocks
import { codeTheme } from './src/lib/code-theme.ts';
import { enhanceImages } from './src/lib/enhance-images.ts'; //images next to a post
import rehypeSlug from 'rehype-slug'; //an id on every heading
import rehypeAutolinkHeadings from 'rehype-autolink-headings'; //and a link to it

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
	const html = highlighter.codeToHtml(code, {
		lang: language,
		theme: 'tokens',
		// Long lines wrap (CodeBlock.svelte), so a block never scrolls and doesn't need
		// to be focusable.
		transformers: [{ pre: (node) => void delete node.properties.tabindex }]
	});
	// The HTML goes into a Svelte template string: { } would be read as Svelte
	// expressions, and ` \ would end or change the string. As HTML entities they show
	// the same characters on screen. CodeBlock comes from the layout (MarkdownLayout).
	const escaped = html.replace(/[{}`\\]/g, (c) => `&#${c.charCodeAt(0)};`);
	return `<Components.CodeBlock lang="${language}">{@html \`${escaped}\`}</Components.CodeBlock>`;
}

// Every heading gets an id from its text ('## The base path' -> #the-base-path, a
// repeated one gets -1), and its text becomes a link to itself, so any section can be
// linked to. 'wrap' keeps the heading's name as it is for screen readers: "The base
// path, link", nothing added. The prerender crawler checks #links against these ids.
// mdsvex 0.12's types come from an older unified (v9) than these plugins' (v11); the
// trees they work on are the same, so only the types disagree, hence the cast.
const rehypePlugins = [
	rehypeSlug,
	[rehypeAutolinkHeadings, { behavior: 'wrap' }]
] as unknown as MdsvexCompileOptions['rehypePlugins'];

// The layout every .md file is wrapped in. mdsvex reads it from disk (to see which
// elements it replaces), so it needs a file path, not a URL.
const layout = fileURLToPath(
	new URL('./src/lib/components/MarkdownLayout.svelte', import.meta.url)
);

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
					highlight: { highlighter: highlight },
					rehypePlugins,
					layout
				});
				if (!out) return;
				// mdsvex 0.12 still writes Svelte 4 syntax: <script context="module"> for
				// the frontmatter, and {...$$props} on the layout (runes mode has no $$props;
				// nothing passes props to a post anyway).
				// The empty map says "no sourcemap on purpose": markdown -> HTML has no
				// useful line-by-line mapping, and without it the build warns per file.
				return {
					code: enhanceImages(out.code, id)
						.replace('<script context="module">', '<script module>')
						.replace('{...$$props}', ''),
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
				entries: ['*', '/logos.svg', '/sitemap.xml'],
				// A route nobody links to fails the build, which catches broken links. The
				// exceptions: the post and tag pages have no pages while every post is a
				// draft (drafts don't exist in a build). Once a post is published,
				// entries() makes them.
				handleUnseenRoutes: ({ routes, message }) => {
					const draftOnly = ['/blog/[slug]', '/blog/tags/[tag]'];
					if (routes.some((route) => !draftOnly.includes(route))) throw new Error(message);
				}
			}
		})
	],
	// Unit tests (pnpm test). Vitest runs them through this same config, plugins and all,
	// so a test imports files exactly like the site does (#lib/…, import.meta.glob).
	// A test lives next to the file it tests: content.ts -> content.test.ts.
	test: {
		include: ['src/**/*.test.ts']
	},
	css: {
		postcss: {
			plugins: [postcssJitProps(OpenProps)]
		}
	}
});
