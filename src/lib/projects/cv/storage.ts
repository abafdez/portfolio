// localStorage, and checking what comes out of it (or out of an imported file). Both
// can hold anything: an older version of this tool, another page on the same origin
// (every project on abafdez.github.io shares it), or me in DevTools.

// null when there's nothing, it isn't JSON, or storage is blocked.
export function loadJson(key: string): unknown {
	try {
		return JSON.parse(localStorage.getItem(key) ?? 'null');
	} catch {
		return null;
	}
}

export function saveJson(key: string, value: unknown) {
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch {
		// Storage full or blocked (some private windows): the page still works, it just
		// won't survive a reload.
	}
}

// Type guards: after `if (isObject(x))`, TypeScript knows x is an object with keys.
export function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Only the strings of an array; anything else gives [].
export function strings(value: unknown): string[] {
	return Array.isArray(value) ? value.filter((item) => typeof item === 'string') : [];
}

// Only the string values of an object.
export function stringRecord(value: unknown): Record<string, string> {
	if (!isObject(value)) return {};
	// entry is [string, string]: a type predicate, so TypeScript knows what's left.
	return Object.fromEntries(
		Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === 'string')
	);
}
