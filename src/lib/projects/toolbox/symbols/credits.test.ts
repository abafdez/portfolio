import { expect, test } from 'vitest';
import { reflow } from '../credits.ts';
import { credits } from './credits.ts';

test('reflow joins wrapped lines and keeps paragraphs', () => {
	expect(reflow('one\ntwo\n\nthree\nfour\n')).toBe('one two\n\nthree four');
});

// What Unicode's licence asks to travel with its data: the copyright line and the
// permission notice, whole.
test("Unicode's notice ships with the data", () => {
	const unicode = credits.find((c) => c.licence.name === 'Unicode License v3')!;
	expect(unicode.by).toMatch(/^Copyright © 1991-\d{4} Unicode, Inc\.$/);
	expect(unicode.notice).toContain('COPYRIGHT AND PERMISSION NOTICE');
	expect(unicode.notice).toContain('this copyright and permission notice appear with all copies');
});

// CC BY 4.0: who, a link to the licence, and what changed.
test('the HTML spec is credited as CC BY asks', () => {
	const whatwg = credits.find((c) => c.licence.name === 'CC BY 4.0')!;
	expect(whatwg.by).toContain('WHATWG');
	expect(whatwg.licence.url).toBe('https://creativecommons.org/licenses/by/4.0/');
	expect(whatwg.changes?.en).toBeTruthy();
});
