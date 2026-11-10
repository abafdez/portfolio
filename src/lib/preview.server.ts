// The frontmatter of an entry's live-preview file (see preview.ts), for the [slug] pages'
// server loads: title, description, tags… as typed in the CMS, not yet saved.
import { readFileSync } from 'node:fs';
import { readEntry } from '#lib/content-files.ts';
import { previewPath } from '#lib/preview.ts';

// path is root-relative (/content/…); the dev server runs from the project's folder.
export function previewMeta(path: string): Record<string, unknown> {
	try {
		const { body: _body, ...meta } = readEntry(readFileSync(`.${previewPath(path)}`, 'utf8'));
		return meta;
	} catch {
		return {}; // no preview file yet: the saved entry as it is
	}
}
