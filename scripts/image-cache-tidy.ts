// Deletes the files in .image-cache/ that the last build didn't use (pnpm image-cache:tidy,
// after pnpm build). Without it the cache keeps every version of every image forever:
// replaced images, deleted posts, drafts' images from pnpm dev.
//
// How it knows what a build used: imagetools writes the encoded image to the cache and
// emits the very same bytes into the build (under a hashed name of Vite's). So a cache
// file was used if a file with identical content is in the build output. The output is
// build/ plus .svelte-kit/output/, where the server half of the build puts the images
// only server code imports (an og:image JPEG, for example).
//
// imagetools has its own option for this (cache.retention), but enhanced-img doesn't let
// us pass it.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';

const store = '.image-cache';
const outputs = ['build', '.svelte-kit/output'];

// A missing or half-written build would make every cache file look unused.
if (!existsSync('build/index.html')) {
	console.error('image cache: no finished build in build/. Run pnpm build first.');
	process.exit(1);
}

const hashOf = (path: string) => createHash('sha1').update(readFileSync(path)).digest('hex');

const used = new Set<string>();
for (const output of outputs) {
	if (!existsSync(output)) continue;
	for (const entry of readdirSync(output, { recursive: true, withFileTypes: true })) {
		if (entry.isFile() && /\.(avif|webp|png|jpe?g|gif|tiff)$/i.test(entry.name)) {
			used.add(hashOf(join(entry.parentPath, entry.name)));
		}
	}
}

let kept = 0;
let keptBytes = 0;
let deleted = 0;
for (const name of readdirSync(store)) {
	const path = join(store, name);
	if (used.has(hashOf(path))) {
		kept++;
		keptBytes += statSync(path).size;
	} else {
		rmSync(path);
		deleted++;
	}
}

const megabytes = (keptBytes / 1024 / 1024).toFixed(1);
console.log(`image cache: kept ${kept} files (${megabytes} MB), deleted ${deleted}`);
