// Serves build/ the way GitHub Pages does, for the e2e tests (playwright.config.ts) and
// for looking at a build by hand: `BASE_PATH=/portfolio node scripts/serve.ts`.
// Not `vite preview`: it serves .svelte-kit/output, so whatever is added to build/ after
// SvelteKit (the CMS at /admin, Pagefind's search index) isn't there.
//
// Like Pages: /x serves x.html, x/index.html or the file x itself; anything else gets
// 404.html with status 404, and the app shows its own 404 page.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const root = join(import.meta.dirname, '..', 'build');
const base = process.env.BASE_PATH ?? '';
const port = Number(process.env.PORT ?? 4174);

const types: Record<string, string> = {
	'.html': 'text/html; charset=utf-8',
	'.js': 'text/javascript',
	'.mjs': 'text/javascript',
	'.css': 'text/css',
	'.json': 'application/json',
	'.svg': 'image/svg+xml',
	'.xml': 'application/xml',
	'.txt': 'text/plain; charset=utf-8',
	'.yml': 'text/yaml; charset=utf-8',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.webp': 'image/webp',
	'.avif': 'image/avif',
	'.gif': 'image/gif',
	'.ico': 'image/x-icon',
	'.woff2': 'font/woff2',
	'.wasm': 'application/wasm',
	'.webm': 'video/webm',
	'.mp4': 'video/mp4'
};

async function isFile(path: string) {
	return (await stat(path).catch(() => undefined))?.isFile() ?? false;
}

// The file for a URL path inside build/, or undefined.
async function find(path: string): Promise<string | undefined> {
	if (!path.startsWith(`${base}/`)) return undefined;
	const local = normalize(decodeURIComponent(path.slice(base.length)));
	if (local.split(/[/\\]/).includes('..')) return undefined;
	const file = join(root, local);
	for (const candidate of [file, `${file}.html`, join(file, 'index.html')]) {
		if (await isFile(candidate)) return candidate;
	}
}

createServer(async (request, response) => {
	const path = new URL(request.url ?? '/', 'http://localhost').pathname;
	const file = await find(path);
	const shown = file ?? join(root, '404.html');
	response.writeHead(file ? 200 : 404, {
		'Content-Type': types[extname(shown)] ?? 'application/octet-stream'
	});
	response.end(await readFile(shown));
}).listen(port, () => console.log(`build/ on http://localhost:${port}${base}/`));
