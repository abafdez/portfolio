// The CMS for the live site: `pnpm build` runs this after the site's own build, and it
// writes build/admin/ (index.html + the CMS's code), deployed with the site at /admin/.
// In dev, plugin.ts serves the same page from the dev server instead.
// A build of its own, not part of SvelteKit's: a route would wrap the CMS in the site's
// layout and global CSS. It compiles the same files (main.ts and what it imports: the
// site's markdown components, blocks.ts, Prettier…), with the plain Svelte plugin.
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { enhancedImages } from '@sveltejs/enhanced-img';
import { lucideNames } from './lucide-names.ts';
import { parse } from 'yaml';

const here = (path: string) => fileURLToPath(new URL(path, import.meta.url));
const base = process.env.BASE_PATH ?? '';

// Where GitHub serves each cover, from the repo and branch the CMS edits (config.yml).
function coverUrls() {
	const { repo, branch } = parse(readFileSync(here('./config.yml'), 'utf8')).backend;
	const raw = `https://raw.githubusercontent.com/${repo}/${branch}`;
	const files = readdirSync(here('../../../content'), { recursive: true, encoding: 'utf8' })
		.map((file) => `/content/${file.replaceAll('\\', '/')}`)
		.filter((file) => /\/cover\.(avif|png|jpe?g|webp)$/.test(file));
	return Object.fromEntries(files.map((file) => [file, `${raw}${file}`]));
}

// covers.ts → covers.hosted.ts (see that file for why).
function hostedCovers(): Plugin {
	return {
		name: 'hosted-covers',
		enforce: 'pre',
		async resolveId(source, importer, options) {
			const resolved = await this.resolve(source, importer, { ...options, skipSelf: true });
			if (resolved?.id === here('./covers.ts')) return here('./covers.hosted.ts');
		}
	};
}

export default defineConfig({
	root: here('.'),
	// Only warnings and errors: the full report lists ~530 files (Shiki's languages,
	// Sveltia's locales) and would bury the site's build in the CI log.
	logLevel: 'warn',
	base: `${base}/admin/`,
	publicDir: false,
	plugins: [
		hostedCovers(),
		lucideNames(), // virtual:lucide-names, for the icon picker
		// enhanced-img compiles the <enhanced:img> in the markdown components (Image.svelte).
		// Their src is a value at run time, so it never encodes an image here.
		enhancedImages(),
		svelte({ compilerOptions: { runes: true } })
	],
	define: {
		// Like the site's (vite.config.ts at the root): the markdown links need the base.
		'import.meta.env.BASE_PATH': JSON.stringify(base),
		__CMS_COVERS__: JSON.stringify(coverUrls())
	},
	build: {
		outDir: here('../../../build/admin'),
		emptyOutDir: true,
		// Sveltia alone is a few MB: no point warning about it on every build.
		chunkSizeWarningLimit: 4096
	}
});
