// Base64: bytes written with 64 safe characters (A–Z a–z 0–9 + /), 3 bytes as 4
// characters, so it's a third bigger. It encodes bytes, not text: text first becomes
// bytes in some encoding, and here that's UTF-8, the web's. btoa() on the text itself
// throws on anything outside Latin-1 ("€", "😀"): see encodeText().

// btoa() and atob() only speak "binary strings": one character per byte (codes 0–255).
// So text goes text → UTF-8 bytes (TextEncoder) → binary string → btoa(), and back the
// other way. The newer Uint8Array.toBase64() skips the middle step, but Node 22 (CI)
// and 24 don't have it yet.
export function encodeText(text: string, urlSafe = false): string {
	const bytes = new TextEncoder().encode(text);
	let binary = '';
	// One String.fromCharCode() call per byte would be slow, and one call with every
	// byte as an argument breaks on big inputs (too many arguments), so in chunks.
	for (let i = 0; i < bytes.length; i += 0x8000) {
		binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
	}
	const base64 = btoa(binary);
	return urlSafe ? toUrlSafe(base64) : base64;
}

// base64url (RFC 4648 §5): - and _ instead of + and /, which mean something in URLs,
// and no = padding. JWTs use it.
export const toUrlSafe = (base64: string) =>
	base64.replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');

export type Decoded = { ok: true; text: string } | { ok: false; problem: 'base64' | 'text' };

// Forgiving with what people paste: spaces and line breaks (e-mail wraps Base64 at 76
// characters), base64url, missing padding, and a whole data URL (only what's after
// "base64," is Base64).
export function decodeText(input: string): Decoded {
	let base64 = input.replace(/^data:[^,]*;base64,/, '').replace(/\s+/g, '');
	base64 = base64.replaceAll('-', '+').replaceAll('_', '/');
	base64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
	let binary: string;
	try {
		binary = atob(base64);
	} catch {
		return { ok: false, problem: 'base64' };
	}
	const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
	try {
		// fatal: bytes that aren't UTF-8 throw instead of turning into "�": Base64 of an
		// image is valid Base64 but not text, and the tool should say so.
		return { ok: true, text: new TextDecoder('utf-8', { fatal: true }).decode(bytes) };
	} catch {
		return { ok: false, problem: 'text' };
	}
}

// Data URLs get big fast (a third bigger than the file, and inside your CSS or HTML,
// where the browser can't cache it apart): they're for icons, not photos.
export const maxFileSize = 2 * 1024 * 1024;

// A file as a data URL ('data:image/png;base64,…'). FileReader is older than promises,
// so it's wrapped in one. It's already async: the page doesn't freeze while it reads,
// so no worker is needed.
export function readAsDataUrl(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.addEventListener('load', () => resolve(reader.result as string));
		reader.addEventListener('error', () => reject(reader.error));
		reader.readAsDataURL(file);
	});
}

// How a data URL is used in CSS.
export const cssBackground = (dataUrl: string) =>
	`.element {\n\tbackground-image: url('${dataUrl}');\n}`;
