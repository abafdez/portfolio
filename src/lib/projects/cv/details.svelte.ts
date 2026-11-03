// What I type into the CV builder, kept in this browser's localStorage so a reload
// doesn't lose it. It never leaves the browser: no request sends it, and it isn't in
// the repo or the build.
// A $state class, like the Awesome filter: the values, and the ways to load and save
// them, in one object.
import { isObject, loadJson, saveJson } from './storage.ts';

// One key for the whole form, as JSON. localStorage only stores strings.
const key = 'cv-builder';

// Every field, in the form's order. Also the list read() trusts: anything else in
// storage (or, later, in an imported file) is ignored.
export const fields = [
	'profile',
	'name',
	'surnames',
	'phone',
	'email',
	'city',
	'state',
	'postalCode',
	'letter'
] as const;

export type Field = (typeof fields)[number];
export type Details = Record<Field, string>;

export class CvDetails {
	// One object, not a $state per field: a $state object is a deep proxy, so
	// bind:value={cv.values.name} works, and JSON.stringify() sees every field.
	values: Details;
	// False until the saved values are read. The form waits for it, so nothing typed
	// before then is overwritten.
	loaded = $state(false);

	#profiles: string[];

	// The profile ids from the skills: the first is the default, and a saved one must be
	// one of them (a profile could be renamed in the YAML after it was saved).
	constructor(profiles: string[]) {
		this.#profiles = profiles;
		const empty = Object.fromEntries(fields.map((field) => [field, ''])) as Details;
		this.values = $state({ ...empty, profile: profiles[0] });
	}

	// Called in onMount: localStorage only exists in the browser, and the page is
	// prerendered without it.
	load() {
		this.read(loadJson(key));
		this.loaded = true;
	}

	// Only known fields, only strings. unknown, not any: TypeScript makes us check
	// before we use it, which is the point with data we didn't write.
	// Returns how many fields it took, so an import can say whether the file had any.
	// A field the data doesn't have keeps its value.
	read(data: unknown): number {
		if (!isObject(data)) return 0;
		let count = 0;
		for (const field of fields) {
			const value = data[field];
			if (typeof value !== 'string') continue;
			if (field === 'profile' && !this.#profiles.includes(value)) continue;
			this.values[field] = value;
			count++;
		}
		return count;
	}

	save() {
		saveJson(key, this.values);
	}
}
