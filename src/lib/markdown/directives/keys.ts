// The keys of a :kbd[…] directive: "Ctrl+Shift+P" is Ctrl, Shift and P. A + that ends
// the text is a key itself, so "Ctrl++" is Ctrl and +, and "+" alone is +.
export function splitKeys(text: string): string[] {
	return text
		.split(/\+(?=.)/)
		.map((key) => key.trim())
		.filter(Boolean);
}
