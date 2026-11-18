// Puts the repo's image cache where vite-imagetools looks for it (pnpm image-cache:link,
// and on every install through postinstall).
//
// enhanced-img runs vite-imagetools with its default cache folder,
// ./node_modules/.cache/imagetools, and has no option to change it. That folder dies with
// node_modules, and CI starts without one, so every build re-encoded every image.
// The cache is committed to the repo in .image-cache/ instead, and this script makes
// node_modules/.cache/imagetools a link to it. imagetools then reads and writes the
// committed files without knowing. Its files are named sha1(settings + the source
// image's bytes), so a cached file can only ever match the image it was made from.
//
// If the link is missing, nothing breaks: builds just encode every image again.
import {
	existsSync,
	lstatSync,
	mkdirSync,
	readdirSync,
	readlinkSync,
	renameSync,
	rmSync,
	symlinkSync
} from 'node:fs';
import { dirname, join, relative } from 'node:path';

const store = '.image-cache';
const link = 'node_modules/.cache/imagetools';
const target = relative(dirname(link), store); // '../../.image-cache'

mkdirSync(store, { recursive: true });
mkdirSync(dirname(link), { recursive: true });

const current = lstatSync(link, { throwIfNoEntry: false });

if (current?.isSymbolicLink() && readlinkSync(link) === target) {
	process.exit(0); // already linked
}

if (current?.isDirectory()) {
	// A cache from before the link: its files are valid entries, so keep them (the tidy
	// step drops the ones no build uses) instead of encoding them again.
	let moved = 0;
	for (const name of readdirSync(link)) {
		if (!existsSync(join(store, name))) {
			renameSync(join(link, name), join(store, name));
			moved++;
		}
	}
	console.log(`image cache: moved ${moved} files from ${link} into ${store}`);
}

if (current) rmSync(link, { recursive: true, force: true });

// 'junction' only matters on Windows, where a directory link needs no admin rights.
symlinkSync(process.platform === 'win32' ? join(process.cwd(), store) : target, link, 'junction');
console.log(`image cache: ${link} -> ${store}`);
