// A hue (0–359) from a name: a small hash, so the same name always gives the same hue,
// on every build, on the server and in the browser. Used where something has no colour
// of its own: generic skill icons (/about), blog tags (TagCloud.svelte).
export function hueOf(name: string): number {
	let hash = 0;
	for (const char of name) hash = (hash * 31 + char.codePointAt(0)!) % 360;
	return hash;
}
