import { describe, expect, test } from 'vitest';
import { checkSite, site } from './site.ts';

const good = {
	name: 'A',
	tagline: { en: 'a', es: 'a' },
	role: { en: 'b', es: 'b' },
	hire: {
		text: { en: 'c', es: 'c' },
		contact: { en: 'd', es: 'd' },
		contactWithEmail: { en: 'e', es: 'e' }
	},
	github: 'https://github.com/x',
	linkedin: 'https://linkedin.com/in/x'
};

describe('site settings', () => {
	test('the real file passes', () => {
		expect(site.name).toBeTruthy();
	});
	test('a missing translation fails, naming the field', () => {
		expect(() => checkSite({ ...good, role: { en: 'b' } })).toThrow(/role\.es/);
	});
	test('a link that is not https fails', () => {
		expect(() => checkSite({ ...good, github: 'http://x' })).toThrow(/github/);
	});
	test('no email is fine; a bad one fails', () => {
		expect(checkSite(good).email).toBe('');
		expect(() => checkSite({ ...good, email: 'nope' })).toThrow(/email/);
	});
});
