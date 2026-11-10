import { describe, expect, test } from 'vitest';
import { fileLocale } from '#lib/i18n/locales.ts';
import { previewPath } from './preview.ts';

describe('previewPath', () => {
	test('a hidden file in the same folder', () => {
		expect(previewPath('/content/blog/drafts/2026-11-09-a-post/2026-11-09-a-post.md')).toBe(
			'/content/blog/drafts/2026-11-09-a-post/.preview.md'
		);
	});

	test('keeps the language', () => {
		const path = previewPath('content/bitacora/2026-11-09-an-entry/2026-11-09-an-entry.es.md');
		expect(path).toBe('content/bitacora/2026-11-09-an-entry/.preview.es.md');
		expect(fileLocale(path)).toBe('es');
	});
});
