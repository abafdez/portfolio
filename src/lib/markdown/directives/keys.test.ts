import { expect, test } from 'vitest';
import { splitKeys } from './keys.ts';

test.each([
	['Ctrl+B', ['Ctrl', 'B']],
	['Ctrl + Shift + P', ['Ctrl', 'Shift', 'P']],
	['Ctrl++', ['Ctrl', '+']],
	['+', ['+']],
	['Esc', ['Esc']]
])('%s', (text, keys) => {
	expect(splitKeys(text)).toEqual(keys);
});
