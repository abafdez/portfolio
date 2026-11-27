// Modules a page can import by name, made from objects it already holds: a compiled post
// or demo imports Svelte's runtime by name ('svelte/internal/client'), which a module
// loaded from a blob: URL can't resolve. So each name gets a tiny blob: module that hands
// out the page's own copy, and the compiled code's imports are rewritten to point at them.
// The CMS preview (mdsvex.svelte.ts) and the demo frame (demo-runner.ts) both do this,
// each with its own copies: the frame is another document, sandboxed.

export type Modules = Record<string, Record<string, unknown>>;

// One blob: module per name: `const v0 = m["a"]; … export { v0 as "a", … }`. Through
// locals because some export names are reserved words (Svelte's runtime has `await`).
// The modules are read from globalThis[key] when a blob module first runs.
export function blobModules(modules: Modules, key: string): Record<string, string> {
	(globalThis as Record<string, unknown>)[key] = modules;
	const urls: Record<string, string> = {};
	for (const [name, exports] of Object.entries(modules)) {
		const keys = Object.keys(exports);
		const code = [
			`const m = globalThis[${JSON.stringify(key)}][${JSON.stringify(name)}];`,
			...keys.map((k, i) => `const v${i} = m[${JSON.stringify(k)}];`),
			`export { ${keys.map((k, i) => `v${i} as ${JSON.stringify(k)}`).join(', ')} };`
		].join('\n');
		urls[name] = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
	}
	return urls;
}

// The import statements at the top of a compiled module, pointed at the URLs for their
// names; any other name throws, saying which. Only the top ones: the same text can be in
// a post's code blocks further down. The module name is the string after `from` (or a
// bare `import '…'`), the last one in the statement: an export name can be a string too,
// as in { 'compare-side' as C }. `dynamic` names may also be imported with import("…")
// anywhere (a demo that waits for a button): only those exact strings are rewritten.
export function rewriteImports(
	code: string,
	urls: Record<string, string>,
	dynamic: string[] = []
): string {
	const header = /^\s*import\b[^;]*;/;
	let rest = code;
	let head = '';
	for (let match = header.exec(rest); match; match = header.exec(rest)) {
		head += match[0].replace(
			/(from|import)(\s*)(['"])([^'"]+)\3(\s*;)$/,
			(_, keyword: string, space: string, quote: string, name: string, end: string) => {
				const url = urls[name];
				if (!url) throw new Error(`The preview can't import ${name}`);
				return keyword + space + quote + url + quote + end;
			}
		);
		rest = rest.slice(match[0].length);
	}
	for (const name of dynamic) {
		rest = rest.replaceAll(
			`import(${JSON.stringify(name)})`,
			`import(${JSON.stringify(urls[name])})`
		);
	}
	return head + rest;
}

// A module from its code, imported, its blob: URL released once it has loaded.
export async function importCode(code: string): Promise<Record<string, unknown>> {
	const url = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
	try {
		return await import(/* @vite-ignore */ url);
	} finally {
		URL.revokeObjectURL(url);
	}
}
