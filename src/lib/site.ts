// The site's settings: the owner's name, the tagline, the hiring texts, the contact email
// and the profile links. They live in content/site.yaml so they can be edited in the CMS
// ("Site settings"), and arrive here as data parsed at build time (yaml-data.ts).
// checkSite() fails the build on a missing or malformed value, naming the field.
import data from '/content/site.yaml?data';
import { locales, type Translated } from '#lib/i18n/locales.ts';

export interface Site {
	name: string;
	// Under the name on the home page, and in the hire panel's looks.
	tagline: Translated;
	// One line for a business card: "Web developer".
	role: Translated;
	hire: {
		// What kind of work I'm looking for.
		text: Translated;
		// How to reach me, without and with an email address.
		contact: Translated;
		contactWithEmail: Translated;
	};
	// The hire panel's "Email me" button; empty or missing means no button. An address made
	// for this (a forwarding alias), never a personal one: it ends up in the site's code.
	email: string;
	github: `https://${string}`;
	linkedin: `https://${string}`;
}

type Raw = Record<string, unknown>;

const isRecord = (value: unknown): value is Raw =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

function fail(field: string, problem: string): never {
	throw new Error(`content/site.yaml: ${field} ${problem}`);
}

function text(value: unknown, field: string): string {
	if (typeof value !== 'string' || !value.trim()) fail(field, 'must be some text');
	return value;
}

function translated(value: unknown, field: string): Translated {
	if (!isRecord(value)) fail(field, 'must have a text for each language (en, es)');
	return Object.fromEntries(
		locales.map((locale) => [locale, text(value[locale], `${field}.${locale}`)])
	) as Translated;
}

function url(value: unknown, field: string): `https://${string}` {
	const link = text(value, field);
	if (!link.startsWith('https://')) fail(field, 'must start with https://');
	return link as `https://${string}`;
}

export function checkSite(raw: unknown): Site {
	if (!isRecord(raw)) fail('', 'must be a set of fields');
	const hire = isRecord(raw.hire)
		? raw.hire
		: fail('hire', 'must have text, contact and contactWithEmail');
	const email = raw.email === undefined || raw.email === null ? '' : String(raw.email).trim();
	if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail('email', 'is not an email address');
	return {
		name: text(raw.name, 'name'),
		tagline: translated(raw.tagline, 'tagline'),
		role: translated(raw.role, 'role'),
		hire: {
			text: translated(hire.text, 'hire.text'),
			contact: translated(hire.contact, 'hire.contact'),
			contactWithEmail: translated(hire.contactWithEmail, 'hire.contactWithEmail')
		},
		email,
		github: url(raw.github, 'github'),
		linkedin: url(raw.linkedin, 'linkedin')
	};
}

export const site = checkSite(data);
