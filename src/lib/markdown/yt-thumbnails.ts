// ytThumbnails(), a Vite plugin for builds only: before anything is compiled, it fetches
// the picture of every ::yt that has no thumbnail= from YouTube and saves it next to
// the post as yt-<id>.jpg, unless that file is already there. The blocks plugin points
// such a ::yt at that file, as an optional one (blocks-plugin.ts): if the download
// failed, the card is drawn without a picture instead of failing the build.
// Readers never ask Google for anything: the picture is one of the site's own files.
// It runs at build start, before media.ts's glob is expanded, so the new file is in it.
// Commit the files it saves; otherwise every build (CI's too) downloads them again.
// Drafts are skipped (a build leaves them out anyway). In dev nothing is fetched.
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Plugin } from 'vite';
import { readArgs, youtubeId } from '../blocks.ts';

const sections = ['content/blog/posts', 'content/bitacora'];
// A ::yt line: its label, then its arguments.
const ytLine = /^::yt(?:\[(?:\\.|[^\]\\])*\])?\((.*)\)\s*$/gm;
// A fenced code block, which may show a ::yt as a sample (3 backticks or more, closed by
// as many).
const fence = /^(`{3,})[^\n]*\n[\s\S]*?^\1\s*$/gm;

// The videos whose picture should be fetched: [folder, id], one per folder and video.
export function missingThumbnails(root: string): [string, string][] {
	const wanted = new Map<string, [string, string]>();
	for (const section of sections) {
		const dir = join(root, section);
		if (!existsSync(dir)) continue;
		for (const slug of readdirSync(dir)) {
			const folder = join(dir, slug);
			const english = join(folder, `${slug}.md`);
			if (!existsSync(english)) continue;
			if (/^draft: true$/m.test(readFileSync(english, 'utf8').split('\n---')[0])) continue;
			for (const name of readdirSync(folder).filter((file) => file.endsWith('.md'))) {
				const text = readFileSync(join(folder, name), 'utf8').replace(fence, '');
				for (const [, args] of text.matchAll(ytLine)) {
					const { src, thumbnail } = readArgs(args);
					const id = src && youtubeId(src);
					if (!id || thumbnail || existsSync(join(folder, `yt-${id}.jpg`))) continue;
					wanted.set(`${folder}/${id}`, [folder, id]);
				}
			}
		}
	}
	return [...wanted.values()];
}

// The video's picture: the 1280 × 720 one, or the 480 × 360 one (4:3) when a video
// has no large one. Undefined if YouTube doesn't answer in time.
async function fetchThumbnail(id: string): Promise<Uint8Array | undefined> {
	for (const size of ['maxresdefault', 'hqdefault']) {
		try {
			const response = await fetch(`https://i.ytimg.com/vi/${id}/${size}.jpg`, {
				signal: AbortSignal.timeout(10_000)
			});
			if (response.ok) return new Uint8Array(await response.arrayBuffer());
		} catch {
			// offline or slow: try the next size, then give up
		}
	}
}

let running: Promise<void> | undefined;

export function ytThumbnails(): Plugin {
	return {
		name: 'yt-thumbnails',
		apply: 'build',
		buildStart() {
			// Once per build: each environment (server, client) starts its own.
			running ??= (async () => {
				for (const [folder, id] of missingThumbnails(process.cwd())) {
					const bytes = await fetchThumbnail(id);
					const file = join(folder, `yt-${id}.jpg`);
					if (bytes) {
						writeFileSync(file, bytes);
						this.info(`saved YouTube's picture of ${id} as ${file}: commit it`);
					} else {
						this.warn(`couldn't fetch YouTube's picture of ${id}; its card has no picture`);
					}
				}
			})();
			return running;
		}
	};
}
