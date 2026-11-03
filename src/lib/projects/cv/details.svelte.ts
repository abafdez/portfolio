// What I type into the CV builder, kept in this browser's localStorage so a reload
// doesn't lose it. It never leaves the browser: no request sends it, and it isn't in
// the repo or the build.
// A $state class, like the Awesome filter: the values, and the ways to load and save
// them, in one object.

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

export type Details = Record<(typeof fields)[number], string>;

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
		try {
			this.read(JSON.parse(localStorage.getItem(key) ?? '{}'));
		} catch {
			// Not JSON, or storage blocked: start empty.
		}
		this.loaded = true;
	}

	// Only known fields, only strings. unknown, not any: TypeScript makes us check
	// before we use it, which is the point with data we didn't write.
	read(data: unknown) {
		if (typeof data !== 'object' || data === null) return;
		const saved = data as Record<string, unknown>;
		for (const field of fields) {
			const value = saved[field];
			if (typeof value !== 'string') continue;
			if (field === 'profile' && !this.#profiles.includes(value)) continue;
			this.values[field] = value;
		}
	}

	save() {
		try {
			localStorage.setItem(key, JSON.stringify(this.values));
		} catch {
			// Storage full or blocked (some private windows): the form still works, it just
			// won't survive a reload.
		}
	}
}
