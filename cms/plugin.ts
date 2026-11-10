// Serves Sveltia CMS at /admin/index.html, in dev only (`apply: 'serve'`): it's never
// built, so it never reaches GitHub Pages. Why Sveltia: design/cms-study.md.
// /admin/index.html and /admin/config.yml come from this folder; /admin/cover/<folder>
// is the cover image of a content folder (for the focal-point field); POST /admin/preview
// writes the live preview's file (src/lib/preview.ts); everything else under /admin/ is
// Sveltia's own build from node_modules (its script and its chunks).
// cms/main.ts is served by Vite itself, like any source file, so it can import src/lib.
import { readFile, writeFile } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Connect, Plugin } from 'vite';
import { previewPath } from '../src/lib/preview.ts';

const root = fileURLToPath(new URL('..', import.meta.url));
const here = fileURLToPath(new URL('.', import.meta.url));
const sveltia = fileURLToPath(new URL('../node_modules/@sveltia/cms/dist/', import.meta.url));
const content = join(root, 'content') + sep;
const own: Record<string, string> = { '/index.html': 'index.html', '/config.yml': 'config.yml' };
const types: Record<string, string> = {
	'.html': 'text/html; charset=utf-8',
	'.yml': 'text/yaml; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.map': 'application/json',
	'.avif': 'image/avif',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.webp': 'image/webp'
};
// The names covers.ts looks for, in its order.
const covers = ['cover.avif', 'cover.png', 'cover.jpg', 'cover.webp'];

// The file a request under /admin/ asks for, or undefined. normalize() resolves ../, and
// the startsWith() checks keep every request inside the folder it's meant for.
function fileFor(path: string): string[] | undefined {
	if (own[path]) return [join(here, own[path])];
	if (path.startsWith('/cover/')) {
		const folder = join(root, normalize(path.slice('/cover/'.length)));
		if (!folder.startsWith(content)) return undefined;
		return covers.map((name) => join(folder, name));
	}
	const file = join(sveltia, normalize(path));
	return file.startsWith(sveltia) ? [file] : undefined;
}

// The files the live preview may stand in for: a post's, draft's or Devlog entry's markdown,
// English or Spanish, in its own folder (content/blog/drafts/<slug>/<slug>.es.md).
const editable =
	/^content\/(?:blog\/(?:published|drafts)|bitacora)\/([a-z0-9-]+)\/\1(?:\.es)?\.md$/;

// POST /admin/preview { path, text }: the entry as it is in the CMS, unsaved, written to
// the hidden file next to it. Only from the CMS page itself (same origin: another site
// open in the browser can't make the dev server write files), only for the files above.
async function writePreview(req: Connect.IncomingMessage) {
	if (req.headers.origin !== `http://${req.headers.host}`) return 403;
	let body = '';
	for await (const chunk of req) {
		body += chunk;
		if (body.length > 2_000_000) return 413;
	}
	const { path, text } = JSON.parse(body) as { path?: unknown; text?: unknown };
	if (typeof path !== 'string' || typeof text !== 'string' || !editable.test(path)) return 400;
	await writeFile(join(root, previewPath(path)), text);
	return 204;
}

export function cms(): Plugin {
	return {
		name: 'cms',
		apply: 'serve',
		// SvelteKit lists what Vite may serve; main.ts and the Prettier config are outside it.
		config: () => ({
			server: { fs: { allow: [here, join(root, 'prettier.config.js')] } },
			// Pre-bundled when the dev server starts. Otherwise Vite finds them the first time the
			// CMS asks and bundles them again, which needs a page reload, and the CMS page has
			// no Vite client to do it (see dynamicCompileOptions in vite.config.ts).
			optimizeDeps: {
				include: [
					'yaml',
					'shiki',
					'unified',
					'remark-parse',
					'remark-gfm',
					'remark-rehype',
					'rehype-raw',
					'rehype-slug',
					'rehype-autolink-headings',
					'rehype-stringify',
					'lucide',
					'prettier/standalone',
					'prettier/plugins/markdown',
					'prettier/plugins/yaml'
				]
			}
		}),
		configureServer(server) {
			// use('/admin') strips the prefix: req.url is /index.html, /sveltia-cms.js…
			server.middlewares.use('/admin', async (req, res, next) => {
				const path = decodeURIComponent((req.url ?? '/').split('?')[0]);
				if (req.method === 'POST' && path === '/preview') {
					res.statusCode = await writePreview(req).catch(() => 400);
					return res.end();
				}
				for (const file of fileFor(path) ?? []) {
					try {
						const body = await readFile(file);
						res.setHeader('Content-Type', types[extname(file)] ?? 'application/octet-stream');
						res.setHeader('Cache-Control', 'no-store');
						return res.end(body);
					} catch {
						// not there: try the next name
					}
				}
				next();
			});
		}
	};
}
