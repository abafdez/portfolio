// Which ::yt pictures a build would fetch: only for a ::yt without thumbnail=, whose
// yt-<id>.jpg isn't there yet, outside drafts.
import { afterAll, expect, test } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { missingThumbnails } from './yt-thumbnails.ts';

const root = mkdtempSync(join(tmpdir(), 'yt-'));
afterAll(() => rmSync(root, { recursive: true, force: true }));

function post(slug: string, body: string, extra: Record<string, string> = {}) {
	const folder = join(root, 'content/blog/posts', slug);
	mkdirSync(folder, { recursive: true });
	writeFileSync(join(folder, `${slug}.md`), body);
	for (const [name, text] of Object.entries(extra)) writeFileSync(join(folder, name), text);
	return folder;
}

test('only a ::yt with no thumbnail and no saved picture, once per folder, not in drafts or code', () => {
	const a = post('a', '---\ntitle: A\n---\n\n::yt[One](src=https://youtu.be/AAAAAAAAAAA)\n', {
		'a.es.md':
			'---\ntitle: A\n---\n\n::yt[Uno](src="https://www.youtube.com/watch?v=AAAAAAAAAAA")\n'
	});
	post('b', '::yt[Two](src=https://youtu.be/BBBBBBBBBBB, thumbnail=./mine.jpg)\n');
	post('c', '::yt[Three](src=https://youtu.be/CCCCCCCCCCC)\n', { 'yt-CCCCCCCCCCC.jpg': 'x' });
	post('d', '---\ndraft: true\n---\n\n::yt[Four](src=https://youtu.be/DDDDDDDDDDD)\n');
	post('e', '````md\n```md\n::yt[In code](src=https://youtu.be/EEEEEEEEEEE)\n```\n````\n');
	expect(missingThumbnails(root)).toEqual([[a, 'AAAAAAAAAAA']]);
});
