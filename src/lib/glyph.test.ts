import { describe, expect, test } from 'vitest';
import { glyphFrom } from './glyph.server.ts';

describe('glyphFrom', () => {
	test('a Lucide name gives its elements', () => {
		expect(glyphFrom('x', { icon: 'sparkles' })).toHaveProperty('node');
	});
	test('a Simple Icons slug gives its path', () => {
		expect(glyphFrom('x', { logo: 'svelte' })).toHaveProperty('path');
	});
	test('nothing chosen is no glyph', () => {
		expect(glyphFrom('x', {})).toBeUndefined();
	});
	test('a name that does not exist fails, naming the file', () => {
		expect(() => glyphFrom('list.yaml', { icon: 'no-such-icon' })).toThrow(/list\.yaml/);
		expect(() => glyphFrom('list.yaml', { logo: 'no-such-logo' })).toThrow(/list\.yaml/);
	});
	test('both at once fails', () => {
		expect(() => glyphFrom('x', { icon: 'globe', logo: 'svelte' })).toThrow(/not both/);
	});
});
