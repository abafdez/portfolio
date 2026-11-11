// Serves Sveltia CMS at /admin, in dev only (`apply: 'serve'`): it's never built, so it
// never reaches GitHub Pages. Why Sveltia: design/cms-study.md.
// Everything else is ordinary source that Vite serves: main.ts imports Sveltia from npm,
// its config, and the site's own code. Why the page isn't a SvelteKit route: a route
// would wrap the CMS in the site's layout and global CSS, and in dev it would load Vite's
// client, which reloads the page whenever a content file changes, as saving one does:
// Sveltia would start over (and ask for the folder again) after every save.
import type { Plugin } from 'vite';
import { fileURLToPath } from 'node:url';

const page = `<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<meta name="robots" content="noindex" />
		<title>Content manager</title>
		<script type="module" src="/src/lib/cms/main.ts"></script>
	</head>
	<body></body>
</html>`;

export function cms(): Plugin {
	return {
		name: 'cms',
		apply: 'serve',
		config: () => ({
			// formats.ts imports the repo's Prettier config, outside the folders SvelteKit lets
			// Vite serve.
			server: {
				fs: { allow: [fileURLToPath(new URL('../../../prettier.config.js', import.meta.url))] }
			},
			optimizeDeps: {
				// Pre-bundled when the dev server starts. Otherwise Vite finds them the first time
				// the CMS asks, bundles them again and wants a reload, and the CMS page has no
				// Vite client to do it: a 504 Outdated Optimize Dep in the console.
				include: [
					'yaml',
					'shiki',
					'marked',
					'@humanspeak/svelte-markdown', // the preview's renderers (src/lib/markdown/)
					'lucide',
					'prettier/standalone',
					'prettier/plugins/markdown',
					'prettier/plugins/yaml'
				],
				// Served as it is: its build loads fonts and wasm files from an assets/ folder next
				// to its code (new URL(…, import.meta.url)), which pre-bundling would leave behind.
				// Its own dependencies are already bundled inside it.
				exclude: ['@sveltia/cms']
			}
		}),
		configureServer(server) {
			// A function before Vite's own middleware: /admin is no file and no route.
			server.middlewares.use((req, res, next) => {
				const path = (req.url ?? '').split('?')[0];
				if (!['/admin', '/admin/', '/admin/index.html'].includes(path)) return next();
				res.setHeader('Content-Type', 'text/html; charset=utf-8');
				res.setHeader('Cache-Control', 'no-store');
				res.end(page);
			});
		}
	};
}
