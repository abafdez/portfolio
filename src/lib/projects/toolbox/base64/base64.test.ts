import { describe, expect, test } from 'vitest';
import { cssBackground, decodeText, encodeText, toUrlSafe } from './base64.ts';

describe('encodeText', () => {
	test.each([
		['', ''],
		['Hello', 'SGVsbG8='],
		// Two bytes in UTF-8: btoa('ñ') alone would give '8Q==' (Latin-1), not this.
		['ñ', 'w7E='],
		['€', '4oKs'],
		// Four bytes: outside Latin-1, where btoa() on its own throws.
		['😀', '8J+YgA==']
	])('%j → %j', (text, base64) => {
		expect(encodeText(text)).toBe(base64);
	});

	test('URL-safe: - and _ instead of + and /, no padding', () => {
		expect(encodeText('😀', true)).toBe('8J-YgA');
		expect(encodeText('Hello', true)).toBe('SGVsbG8');
	});

	test('a big input (more than one chunk)', () => {
		const text = 'ab'.repeat(50_000);
		expect(decodeText(encodeText(text))).toEqual({ ok: true, text });
	});
});

describe('decodeText', () => {
	test.each(['', 'Hello', 'ñandú', '€ 5', '😀 emoji', 'line\nbreak'])('round trip %j', (text) => {
		expect(decodeText(encodeText(text))).toEqual({ ok: true, text });
		expect(decodeText(encodeText(text, true))).toEqual({ ok: true, text });
	});

	test('forgives spaces, line breaks and missing padding', () => {
		expect(decodeText(' SGVs\nbG8 ')).toEqual({ ok: true, text: 'Hello' });
		expect(decodeText('SGVsbG8')).toEqual({ ok: true, text: 'Hello' });
	});

	test('takes a whole data URL', () => {
		expect(decodeText('data:text/plain;base64,SGVsbG8=')).toEqual({ ok: true, text: 'Hello' });
	});

	test('not Base64', () => {
		expect(decodeText('Hello!')).toEqual({ ok: false, problem: 'base64' });
	});

	test('Base64, but not UTF-8 text (a PNG starts with byte 0x89)', () => {
		expect(decodeText('iVBORw0KGgo=')).toEqual({ ok: false, problem: 'text' });
	});
});

test('toUrlSafe', () => {
	expect(toUrlSafe('a+b/c==')).toBe('a-b_c');
});

test('cssBackground', () => {
	expect(cssBackground('data:x')).toBe(".element {\n\tbackground-image: url('data:x');\n}");
});
