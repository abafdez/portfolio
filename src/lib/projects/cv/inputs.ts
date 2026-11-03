// The form's text fields: what each one is and what it accepts. The checking is the
// browser's own (the constraint validation API: required, type, pattern); we only
// write the messages.
import type { HTMLInputAttributes } from 'svelte/elements';
import type { Field } from './details.svelte.ts';

export interface Input {
	name: Exclude<Field, 'profile' | 'letter'>;
	label: string;
	type?: 'text' | 'tel' | 'email';
	autocomplete: HTMLInputAttributes['autocomplete'];
	inputmode?: HTMLInputAttributes['inputmode'];
	required?: boolean;
	// A regular expression the whole value must match (the browser adds ^ and $).
	pattern?: string;
	// What a good value looks like, said when the value isn't one.
	hint?: string;
}

// A CV without a name or a way to reach you isn't one: those four are required.
export const inputs: Input[] = [
	{ name: 'name', label: 'Name', autocomplete: 'given-name', required: true },
	{ name: 'surnames', label: 'Surnames', autocomplete: 'family-name', required: true },
	{
		name: 'phone',
		label: 'Phone',
		type: 'tel',
		autocomplete: 'tel',
		required: true,
		// type="tel" checks nothing (phone numbers differ too much), so the pattern does:
		// an optional +, then 9 to 20 digits, spaces, brackets or dashes. Inside [ ] the
		// brackets and the dash are escaped: browsers read pattern in the regex v mode,
		// where they must be.
		pattern: String.raw`\+?[0-9\s\(\)\-]{9,20}`,
		hint: 'Digits, spaces and + ( ) -, at least 9.'
	},
	{
		name: 'email',
		label: 'Email',
		type: 'email',
		autocomplete: 'email',
		required: true,
		hint: 'An address like name@example.com.'
	},
	{ name: 'city', label: 'City', autocomplete: 'address-level2' },
	{ name: 'state', label: 'State', autocomplete: 'address-level1' },
	{
		name: 'postalCode',
		label: 'Postal code',
		autocomplete: 'postal-code',
		inputmode: 'numeric',
		pattern: String.raw`[0-9A-Za-z\s\-]{3,10}`,
		hint: '3 to 10 digits or letters.'
	}
];

// What's wrong with a field, or '' if nothing. The browser's verdict is in
// field.validity, one flag per kind of problem. The words are ours: the browser's own
// (validationMessage) come in the browser's language, and this page is in English.
export function problem(field: HTMLInputElement): string {
	if (field.validity.valid) return '';
	if (field.validity.valueMissing) return 'Required.';
	return inputs.find(({ name }) => name === field.name)?.hint ?? field.validationMessage;
}
